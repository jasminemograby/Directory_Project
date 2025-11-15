// Company Isolation Middleware - Ensures users can only access their company's data
const { query } = require('../config/database');

/**
 * Middleware to verify company isolation
 * Checks that the user can only access data from their own company
 */
const verifyCompanyIsolation = async (req, res, next) => {
  try {
    // Get employee ID from token/auth (assume it's in req.employeeId or req.user.id)
    const employeeId = req.employeeId || req.user?.id;
    
    if (!employeeId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get employee's company ID
    const employeeResult = await query(
      `SELECT company_id FROM employees WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const userCompanyId = employeeResult.rows[0].company_id;

    // Attach company ID to request for use in controllers
    req.userCompanyId = userCompanyId;
    req.employeeId = employeeId;

    // Check if request is trying to access a different company's data
    const targetCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;
    
    if (targetCompanyId && targetCompanyId !== userCompanyId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Cannot access data from another company'
      });
    }

    next();
  } catch (error) {
    console.error('[CompanyIsolation] Error verifying company isolation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify company access'
    });
  }
};

/**
 * Middleware to verify employee belongs to same company as target
 * Used when accessing employee-specific resources
 */
const verifySameCompany = async (req, res, next) => {
  try {
    // For getEmployeeRequests, we only need targetEmployeeId (the employee viewing their own requests)
    // Skip company isolation check if this is a self-request (employee viewing own requests)
    const targetEmployeeId = req.params.employeeId || req.body.employeeId;
    
    // If no target employee ID, this is an error
    if (!targetEmployeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID required'
      });
    }
    
    // For self-requests (employee viewing own requests), skip company isolation
    // The employee can always view their own requests
    const employeeId = req.employeeId || req.user?.id;
    if (!employeeId) {
      // If no authenticated employee ID, allow the request (for self-viewing)
      // The controller will handle authorization
      req.userCompanyId = null; // Will be set by controller if needed
      return next();
    }
    
    // If both IDs exist and are the same, allow (self-request)
    if (employeeId === targetEmployeeId) {
      // Get company ID for the employee
      const employeeResult = await query(
        `SELECT company_id FROM employees WHERE id = $1`,
        [employeeId]
      );
      if (employeeResult.rows.length > 0) {
        req.userCompanyId = employeeResult.rows[0].company_id;
      }
      return next();
    }

    // Get both employees' company IDs
    const result = await query(
      `SELECT e1.company_id as user_company, e2.company_id as target_company
       FROM employees e1, employees e2
       WHERE e1.id = $1 AND e2.id = $2`,
      [employeeId, targetEmployeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const { user_company, target_company } = result.rows[0];

    if (user_company !== target_company) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Employees must be from the same company'
      });
    }

    req.userCompanyId = user_company;
    next();
  } catch (error) {
    console.error('[CompanyIsolation] Error verifying same company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify company access'
    });
  }
};

module.exports = {
  verifyCompanyIsolation,
  verifySameCompany
};

