// Auth Middleware - Extract employee ID from token
const { query } = require('../config/database');

/**
 * Middleware to extract and verify employee ID from auth token
 * Sets req.employeeId and req.user for use in controllers
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token - continue without auth (some endpoints are public)
      return next();
    }

    const token = authHeader.substring(7);
    
    try {
      // Decode token (base64 encoded JSON for now)
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const { employeeId } = decoded;

      if (!employeeId) {
        return next();
      }

      // Verify employee exists
      const employeeResult = await query(
        `SELECT 
          e.id,
          e.name,
          e.email,
          e.type,
          e.role,
          e.company_id,
          e.department_id,
          e.team_id
         FROM employees e
         WHERE e.id = $1
         LIMIT 1`,
        [employeeId]
      );

      if (employeeResult.rows.length === 0) {
        return next(); // Employee not found, but don't block (might be public endpoint)
      }

      const employee = employeeResult.rows[0];

      // Attach employee data to request
      req.employeeId = employee.id;
      req.user = {
        id: employee.id,
        email: employee.email,
        type: employee.type,
        role: employee.role,
        companyId: employee.company_id,
        departmentId: employee.department_id,
        teamId: employee.team_id
      };

      next();
    } catch (decodeError) {
      // Invalid token - continue without auth (might be public endpoint)
      next();
    }
  } catch (error) {
    console.error('[Auth] Error in authentication middleware:', error);
    // Don't block - continue without auth
    next();
  }
};

module.exports = {
  authenticate
};

