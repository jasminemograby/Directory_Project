// Exchange Controller - Cross-Microservice Exchange Protocol
// Handles /api/exchange endpoint with security and validation
const { query } = require('../config/database');
const { 
  isServiceAllowed, 
  getServiceConfig 
} = require('../config/microservices');
const { sendRequest } = require('../services/microserviceIntegrationService');

// Whitelist of allowed tables and columns for dynamic queries
const ALLOWED_TABLES = {
  employees: ['id', 'name', 'email', 'role', 'target_role', 'type', 'company_id', 'department_id', 'team_id', 'bio', 'value_proposition', 'relevance_score', 'profile_status'],
  companies: ['id', 'name', 'industry', 'primary_kpi', 'verification_status'],
  departments: ['id', 'name', 'company_id', 'manager_id'],
  teams: ['id', 'name', 'department_id', 'manager_id'],
  skills: ['id', 'employee_id', 'skill_name', 'skill_type', 'source'],
  projects: ['id', 'employee_id', 'title', 'summary', 'source'],
  completed_courses: ['id', 'employee_id', 'course_id', 'course_name', 'trainer_id', 'trainer_name', 'feedback', 'completed_at']
};

// Whitelist of allowed operations
const ALLOWED_OPERATIONS = ['SELECT', 'GET'];

/**
 * Validate payload structure and fields
 * @param {object} payload - Parsed payload
 * @returns {object} - { valid: boolean, error?: string }
 */
const validatePayload = (payload) => {
  // Check if payload is an object
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Payload must be a valid JSON object' };
  }

  // If payload contains SQL or query fields, validate against whitelist
  if (payload.table || payload.query || payload.sql) {
    return { valid: false, error: 'Direct SQL queries are not allowed. Use structured field requests only.' };
  }

  // If payload contains fields array, validate each field
  if (payload.fields && Array.isArray(payload.fields)) {
    for (const field of payload.fields) {
      // Check if field references a table.column format
      if (field.includes('.')) {
        const [table, column] = field.split('.');
        if (!ALLOWED_TABLES[table] || !ALLOWED_TABLES[table].includes(column)) {
          return { valid: false, error: `Field ${field} is not in whitelist` };
        }
      }
    }
  }

  return { valid: true };
};

/**
 * Build safe query from payload (if needed)
 * This is a placeholder - actual implementation should use ORM/QueryBuilder
 * @param {object} payload - Parsed payload
 * @returns {object|null} - Safe query object or null
 */
const buildSafeQuery = (payload) => {
  // For now, we don't support dynamic SQL generation
  // All data should come from structured API calls or mock data
  // This function is a placeholder for future ORM-based queries
  
  if (!payload.fields || !Array.isArray(payload.fields)) {
    return null;
  }

  // Return structured query object (not raw SQL)
  return {
    fields: payload.fields,
    filters: payload.filters || {},
    limit: payload.limit || 100
  };
};

/**
 * Execute safe query (placeholder - should use ORM)
 * @param {object} safeQuery - Safe query object
 * @returns {Promise<object>} - Query results
 */
const executeSafeQuery = async (safeQuery) => {
  // This is a placeholder - actual implementation should use an ORM
  // For now, return empty result - data should come from microservices
  console.warn('[ExchangeController] Direct database queries not implemented - use microservice APIs');
  return {};
};

/**
 * POST /api/exchange
 * Cross-microservice exchange endpoint
 */
const exchange = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const { requester_service, payload: payloadString } = req.body;

    // Validate requester_service
    if (!requester_service || typeof requester_service !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid requester_service field'
      });
    }

    // Check if requester service is allowed
    if (!isServiceAllowed(requester_service)) {
      console.warn(`[Exchange] Unauthorized requester_service: ${requester_service}`);
      return res.status(403).json({
        success: false,
        error: 'Service not authorized to make requests'
      });
    }

    // Parse payload
    let payload;
    try {
      if (typeof payloadString === 'string') {
        payload = JSON.parse(payloadString);
      } else {
        payload = payloadString;
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON in payload field'
      });
    }

    // Validate payload structure
    const validation = validatePayload(payload);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Log the request
    console.log(`[Exchange] Request from ${requester_service}:`, {
      payloadKeys: Object.keys(payload),
      timestamp: new Date().toISOString()
    });

    // Determine target service from payload or requester
    // For now, Directory handles requests internally or forwards to other services
    const targetService = payload.target_service || requester_service;

    // If target is Directory itself, handle internally
    if (targetService === 'Directory' || !targetService) {
      // Build safe query if needed
      const safeQuery = buildSafeQuery(payload);
      
      if (safeQuery) {
        // Execute safe query (placeholder)
        const queryResult = await executeSafeQuery(safeQuery);
        
        return res.json({
          success: true,
          serviceName: 'Directory',
          payload: JSON.stringify(queryResult),
          timestamp: new Date().toISOString()
        });
      } else {
        // Return empty payload or error
        return res.status(400).json({
          success: false,
          error: 'No valid query structure in payload'
        });
      }
    } else {
      // Forward to external microservice
      const serviceConfig = getServiceConfig(targetService);
      
      if (!serviceConfig || !serviceConfig.url) {
        // Service not configured - return error
        return res.status(503).json({
          success: false,
          error: `Service ${targetService} is not configured`,
          serviceName: 'Directory'
        });
      }

      // Forward request using integration service
      const response = await sendRequest(targetService, payload, serviceConfig.endpoints?.exchange || '/api/exchange');
      
      return res.json({
        success: true,
        serviceName: response.serviceName,
        payload: response.payload,
        source: response.source,
        timestamp: response.timestamp
      });
    }

  } catch (error) {
    console.error('[Exchange] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  exchange
};

