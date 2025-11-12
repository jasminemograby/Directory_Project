// Auth Service Integration
const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4000/api';
const AUTH_SERVICE_API_KEY = process.env.AUTH_SERVICE_API_KEY;

/**
 * Check if an employee is registered in Auth Service
 * @param {string} email - Employee email
 * @returns {Promise<{isRegistered: boolean, userId?: string}>}
 */
const checkEmployeeRegistration = async (email) => {
  try {
    if (!AUTH_SERVICE_URL) {
      // In development or if Auth Service not configured, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Mock] Checking registration for: ${email}`);
        return { isRegistered: false, userId: null };
      }
      throw new Error('Auth Service URL not configured');
    }

    const response = await axios.get(
      `${AUTH_SERVICE_URL}/users/check`,
      {
        params: { email },
        headers: AUTH_SERVICE_API_KEY ? {
          'X-API-Key': AUTH_SERVICE_API_KEY,
        } : {},
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.data && response.data.success) {
      return {
        isRegistered: response.data.isRegistered || false,
        userId: response.data.userId || null,
      };
    }

    return { isRegistered: false, userId: null };
  } catch (error) {
    // If Auth Service is unavailable, use mock data fallback
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || !AUTH_SERVICE_URL || AUTH_SERVICE_URL === 'http://localhost:4000/api') {
      // Load mock data from centralized file
      try {
        const mockData = require('../../mockData/index.json');
        const mockResult = mockData.data?.auth_service?.registration_check?.default || { isRegistered: false, userId: null };
        console.log(`[Mock Data Fallback] Auth Service unavailable, using mock data for ${email}:`, mockResult);
        return mockResult;
      } catch (mockError) {
        // If mock data file not found, use default
        console.warn(`Auth Service unavailable, treating ${email} as not registered (mock data fallback)`);
        return { isRegistered: false, userId: null };
      }
    }

    // Log other errors but don't fail
    console.error(`Error checking registration for ${email}:`, error.message);
    return { isRegistered: false, userId: null };
  }
};

/**
 * Check registration status for multiple employees
 * @param {Array<string>} emails - Array of employee emails
 * @returns {Promise<Array<{email: string, isRegistered: boolean, userId?: string}>>}
 */
const checkMultipleEmployees = async (emails) => {
  const results = await Promise.all(
    emails.map(async (email) => {
      const status = await checkEmployeeRegistration(email);
      return {
        email,
        ...status,
      };
    })
  );

  return results;
};

module.exports = {
  checkEmployeeRegistration,
  checkMultipleEmployees,
};

