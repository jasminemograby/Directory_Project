// Microservice Integration Service
// Handles communication with external microservices with fallback to mock data
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { 
  getServiceConfig, 
  REQUEST_TIMEOUT,
  CIRCUIT_BREAKER 
} = require('../config/microservices');

// Circuit breaker state per service
const circuitBreakerState = {};

/**
 * Initialize circuit breaker state for a service
 */
const initCircuitBreaker = (serviceName) => {
  if (!circuitBreakerState[serviceName]) {
    circuitBreakerState[serviceName] = {
      failures: 0,
      lastFailureTime: null,
      state: 'closed', // 'closed', 'open', 'half-open'
      halfOpenCalls: 0
    };
  }
  return circuitBreakerState[serviceName];
};

/**
 * Check if circuit breaker should allow request
 */
const canMakeRequest = (serviceName) => {
  const state = initCircuitBreaker(serviceName);
  const now = Date.now();

  // If circuit is open, check if reset timeout has passed
  if (state.state === 'open') {
    if (now - state.lastFailureTime > CIRCUIT_BREAKER.resetTimeout) {
      state.state = 'half-open';
      state.halfOpenCalls = 0;
      console.log(`[CircuitBreaker] ${serviceName}: Moving to half-open state`);
      return true;
    }
    return false;
  }

  return true;
};

/**
 * Record successful request
 */
const recordSuccess = (serviceName) => {
  const state = initCircuitBreaker(serviceName);
  state.failures = 0;
  if (state.state === 'half-open') {
    state.state = 'closed';
    state.halfOpenCalls = 0;
    console.log(`[CircuitBreaker] ${serviceName}: Circuit closed (recovered)`);
  }
};

/**
 * Record failed request
 */
const recordFailure = (serviceName) => {
  const state = initCircuitBreaker(serviceName);
  state.failures++;
  state.lastFailureTime = Date.now();

  if (state.state === 'half-open') {
    state.halfOpenCalls++;
    if (state.halfOpenCalls >= CIRCUIT_BREAKER.halfOpenMaxCalls) {
      state.state = 'open';
      console.log(`[CircuitBreaker] ${serviceName}: Circuit opened (half-open failed)`);
    }
  } else if (state.failures >= CIRCUIT_BREAKER.failureThreshold) {
    state.state = 'open';
    console.log(`[CircuitBreaker] ${serviceName}: Circuit opened (threshold reached)`);
  }
};

// Cache for mock data (loaded once)
let mockDataCache = null;
// Use absolute path from project root, or relative from backend/services
// Try multiple possible paths for production (Railway uses /app as root)
// Priority: backend/mockData (for Railway), then root mockData, then /app/mockData
const possiblePaths = [
  process.env.MOCKDATA_PATH,
  path.resolve(__dirname, '../mockData/index.json'), // backend/mockData/index.json (Railway)
  path.resolve(__dirname, '../../mockData/index.json'), // root/mockData/index.json
  path.resolve(__dirname, '../../../mockData/index.json'), // alternative root path
  '/app/mockData/index.json', // Railway absolute path
  '/app/backend/mockData/index.json', // Railway backend path
  path.join(process.cwd(), 'mockData', 'index.json'), // current working directory
  path.join(process.cwd(), 'backend', 'mockData', 'index.json') // backend subdirectory
].filter(Boolean); // Remove undefined values

const MOCK_DATA_PATH = possiblePaths[0]; // Use first available path

/**
 * Load mock data from file (cached)
 */
const loadMockData = async () => {
  if (mockDataCache) {
    return mockDataCache;
  }

  console.log('[MockData] Attempting to load mock data from paths:', possiblePaths);

  // Try all possible paths
  for (const tryPath of possiblePaths) {
    try {
      // Check if file exists
      await fs.access(tryPath);
      const data = await fs.readFile(tryPath, 'utf8');
      mockDataCache = JSON.parse(data);
      console.log('[MockData] ✅ Loaded mock data from:', tryPath);
      return mockDataCache;
    } catch (error) {
      // Try next path
      if (error.code !== 'ENOENT') {
        console.warn(`[MockData] ⚠️ Error reading ${tryPath}:`, error.message);
      }
      continue;
    }
  }
  
  // If all paths failed, return empty structure
  console.error('[MockData] ❌ Failed to load mock data from all paths:', possiblePaths);
  console.warn('[MockData] Using empty mock data structure');
  return {};
};

/**
 * Get fallback mock data for a service
 * @param {string} serviceName - Service name
 * @param {object} payloadSchema - Original payload to match structure
 * @returns {object} - Mock data matching the requested structure
 */
const getRollbackMockData = async (serviceName, payloadSchema = {}) => {
  const mockData = await loadMockData();
  const serviceData = mockData[serviceName] || mockData[serviceName.toLowerCase()] || {};

  // If payload has specific fields, try to match them in mock data
  if (payloadSchema && Object.keys(payloadSchema).length > 0) {
    // Return service-specific mock data with structure matching payload
    return {
      ...serviceData,
      // Preserve any fields from payload that should be returned
      ...(payloadSchema.employee_id && { employee_id: payloadSchema.employee_id }),
      ...(payloadSchema.trainer_id && { trainer_id: payloadSchema.trainer_id }),
      ...(payloadSchema.course_id && { course_id: payloadSchema.course_id })
    };
  }

  return serviceData;
};

/**
 * Send request to external microservice
 * @param {string} targetServiceName - Target service name (e.g., 'SkillsEngine')
 * @param {object} payloadObject - Payload to send
 * @param {string} endpoint - Endpoint path (default: '/api/exchange')
 * @returns {Promise<object>} - Response data or fallback mock data
 */
const sendRequest = async (targetServiceName, payloadObject, endpoint = '/api/exchange') => {
  const startTime = Date.now();
  const serviceConfig = getServiceConfig(targetServiceName);

  // Check circuit breaker
  if (!canMakeRequest(targetServiceName)) {
    console.warn(`[MicroserviceIntegration] ${targetServiceName}: Circuit breaker is OPEN, using fallback`);
    const fallbackData = await getRollbackMockData(targetServiceName, payloadObject);
    return {
      serviceName: targetServiceName,
      payload: JSON.stringify(fallbackData),
      source: 'fallback_circuit_breaker',
      timestamp: new Date().toISOString()
    };
  }

  // If service not configured, use fallback immediately
  if (!serviceConfig || !serviceConfig.url) {
    console.warn(`[MicroserviceIntegration] ${targetServiceName}: Service not configured, using fallback`);
    const fallbackData = await getRollbackMockData(targetServiceName, payloadObject);
    return {
      serviceName: targetServiceName,
      payload: JSON.stringify(fallbackData),
      source: 'fallback_not_configured',
      timestamp: new Date().toISOString()
    };
  }

  // Build request URL
  const requestUrl = `${serviceConfig.url}${endpoint}`;
  const requestBody = {
    requester_service: 'Directory',
    payload: JSON.stringify(payloadObject)
  };

  // Log request (without sensitive data)
  console.log(`[MicroserviceIntegration] Sending request to ${targetServiceName}:`, {
    url: requestUrl,
    payloadKeys: Object.keys(payloadObject),
    timestamp: new Date().toISOString()
  });

  try {
    // Make HTTP request with timeout
    const response = await axios.post(requestUrl, requestBody, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: (status) => status < 500 // Don't throw on 4xx, only 5xx
    });

    const duration = Date.now() - startTime;

    // Check if response is successful
    if (response.status >= 200 && response.status < 300) {
      recordSuccess(targetServiceName);
      
      console.log(`[MicroserviceIntegration] ${targetServiceName}: Success`, {
        status: response.status,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      // Parse response
      let responseData;
      if (typeof response.data === 'string') {
        responseData = JSON.parse(response.data);
      } else {
        responseData = response.data;
      }

      // If response has payload as string, parse it
      if (responseData.payload && typeof responseData.payload === 'string') {
        responseData.payload = JSON.parse(responseData.payload);
      }

      return {
        serviceName: responseData.serviceName || targetServiceName,
        payload: typeof responseData.payload === 'string' 
          ? responseData.payload 
          : JSON.stringify(responseData.payload),
        source: 'external_api',
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`
      };
    } else {
      // 4xx errors - don't use fallback, return error
      recordFailure(targetServiceName);
      throw new Error(`Service returned ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    recordFailure(targetServiceName);

    // Log error
    console.error(`[MicroserviceIntegration] ${targetServiceName}: Error`, {
      error: error.message,
      code: error.code,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    // Use fallback on error/timeout
    console.log(`[MicroserviceIntegration] ${targetServiceName}: Using fallback mock data`);
    const fallbackData = await getRollbackMockData(targetServiceName, payloadObject);
    
    return {
      serviceName: targetServiceName,
      payload: JSON.stringify(fallbackData),
      source: 'fallback_error',
      error: error.message,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    };
  }
};

/**
 * Directory Client - Send request to another microservice
 * @param {string} targetServiceName - Target service name
 * @param {object} payloadObject - Payload object
 * @returns {Promise<object>} - Response with filled data
 */
const DirectoryClient = {
  sendRequest
};

/**
 * Generic Client (alias for DirectoryClient)
 */
const GenericClient = DirectoryClient;

module.exports = {
  DirectoryClient,
  GenericClient,
  sendRequest,
  getRollbackMockData,
  loadMockData
};

