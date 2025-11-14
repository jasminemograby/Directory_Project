// Microservices Configuration
// Centralized configuration for all external microservice URLs
require('dotenv').config();

/**
 * Get microservice URL from environment variable or use default
 * @param {string} envVar - Environment variable name
 * @param {string} defaultValue - Default URL (if env not set)
 * @returns {string|null} - Service URL or null if not configured
 */
const getServiceUrl = (envVar, defaultValue = null) => {
  const url = process.env[envVar];
  if (url) {
    return url.trim();
  }
  // In production, don't use defaults - require explicit configuration
  if (process.env.NODE_ENV === 'production' && !defaultValue) {
    return null;
  }
  return defaultValue;
};

/**
 * Microservices configuration
 * All URLs should be set via environment variables for security
 */
const microservices = {
  // Directory Service (self)
  directory: {
    url: getServiceUrl('DIRECTORY_URL', process.env.FRONTEND_URL ? null : 'http://localhost:5000'),
    name: 'Directory'
  },

  // Content Studio Service
  contentStudio: {
    url: getServiceUrl('CONTENT_STUDIO_URL', 'https://content-studio-production-76b6.up.railway.app'),
    name: 'ContentStudio',
    endpoints: {
      exchange: '/api/exchange',
      fill: '/api/fill-trainer-profile'
    }
  },

  // Course Builder Service
  courseBuilder: {
    url: getServiceUrl('COURSE_BUILDER_URL', 'https://coursebuilderfs-production.up.railway.app'),
    name: 'CourseBuilder',
    endpoints: {
      exchange: '/api/exchange',
      fill: '/api/fill-course-feedback'
    }
  },

  // Skills Engine Service
  skillsEngine: {
    url: getServiceUrl('SKILLS_ENGINE_URL', 'https://skillsengine-production.up.railway.app'),
    name: 'SkillsEngine',
    endpoints: {
      exchange: '/api/exchange',
      fill: '/api/fill-skills'
    }
  },

  // Assessment Service
  assessment: {
    url: getServiceUrl('ASSESSMENT_URL', 'https://assessment-tests-production.up.railway.app'),
    name: 'Assessment',
    endpoints: {
      exchange: '/api/exchange'
    }
  },

  // Learner AI Service
  learnerAI: {
    url: getServiceUrl('LEARNER_AI_URL', 'https://learner-ai-backend-production.up.railway.app'),
    name: 'LearnerAI',
    endpoints: {
      exchange: '/api/exchange'
    }
  },

  // Management Reporting Service
  managementReporting: {
    url: getServiceUrl('MANAGEMENT_REPORTING_URL', 'https://lotusproject-production.up.railway.app'),
    name: 'ManagementReporting',
    endpoints: {
      exchange: '/api/exchange'
    }
  },

  // Learning Analytics Service
  learningAnalytics: {
    url: getServiceUrl('LEARNING_ANALYTICS_URL', 'https://ms8-learning-analytics-production.up.railway.app'),
    name: 'LearningAnalytics',
    endpoints: {
      exchange: '/api/exchange'
    }
  }
};

/**
 * Get service configuration by name
 * @param {string} serviceName - Service name (e.g., 'SkillsEngine', 'ContentStudio')
 * @returns {object|null} - Service config or null if not found
 */
const getServiceConfig = (serviceName) => {
  const normalizedName = serviceName.toLowerCase().replace(/\s+/g, '');
  
  for (const [key, config] of Object.entries(microservices)) {
    if (config.name.toLowerCase() === normalizedName || key === normalizedName) {
      return config;
    }
  }
  
  return null;
};

/**
 * Get all allowed services (for whitelist validation)
 * @returns {string[]} - Array of allowed service names
 */
const getAllowedServices = () => {
  const envAllowed = process.env.ALLOWED_SERVICES;
  if (envAllowed) {
    return envAllowed.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  // Default: allow all configured services
  return Object.values(microservices)
    .map(config => config.name)
    .filter(Boolean);
};

/**
 * Check if a service is allowed
 * @param {string} serviceName - Service name to check
 * @returns {boolean} - True if allowed
 */
const isServiceAllowed = (serviceName) => {
  const allowed = getAllowedServices();
  return allowed.includes(serviceName) || allowed.length === 0;
};

/**
 * Internal API Secret (for inbound endpoints)
 */
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || null;

/**
 * Request timeout (milliseconds)
 */
const REQUEST_TIMEOUT = parseInt(process.env.MICROSERVICE_TIMEOUT || '30000', 10);

/**
 * Circuit breaker configuration
 */
const CIRCUIT_BREAKER = {
  failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5', 10),
  resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '60000', 10), // 1 minute
  halfOpenMaxCalls: parseInt(process.env.CIRCUIT_BREAKER_HALF_OPEN_MAX || '3', 10)
};

module.exports = {
  microservices,
  getServiceConfig,
  getAllowedServices,
  isServiceAllowed,
  INTERNAL_API_SECRET,
  REQUEST_TIMEOUT,
  CIRCUIT_BREAKER
};

