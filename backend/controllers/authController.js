// Auth Controller - Mock authentication (email-based)
const { query } = require('../config/database');

/**
 * Mock login - email-based (no password for now)
 * Looks up employee by email and returns user data with role
 */
const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Normalize email (case-insensitive)
    const normalizedEmail = email.trim().toLowerCase();

    // Find employee by email
    const employeeResult = await query(
      `SELECT 
        e.id,
        e.name,
        e.email,
        e.type,
        e.role,
        e.current_role,
        e.target_role,
        e.profile_status,
        e.company_id,
        e.team_id,
        e.department_id,
        c.name as company_name,
        c.verification_status as company_verification_status
       FROM employees e
       LEFT JOIN companies c ON e.company_id = c.id
       WHERE LOWER(TRIM(e.email)) = $1
       LIMIT 1`,
      [normalizedEmail]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found. Please check your email or contact HR.'
      });
    }

    const employee = employeeResult.rows[0];

    // Determine role based on employee data
    let userRole = 'employee'; // Default

    // Check if HR (from company_settings)
    const hrCheck = await query(
      `SELECT company_id 
       FROM company_settings 
       WHERE setting_key = 'hr_email' 
       AND LOWER(TRIM(setting_value)) = $1
       LIMIT 1`,
      [normalizedEmail]
    );

    if (hrCheck.rows.length > 0) {
      userRole = 'hr';
    } else if (employee.type === 'internal_instructor' || employee.type === 'external_instructor') {
      // Check if trainer
      userRole = 'trainer';
    } else if (employee.team_id) {
      // Check if team manager
      const teamCheck = await query(
        `SELECT manager_id FROM teams WHERE id = $1 AND manager_id = $2`,
        [employee.team_id, employee.id]
      );
      if (teamCheck.rows.length > 0) {
        userRole = 'team_leader';
      }
    }

    if (userRole === 'employee' && employee.department_id) {
      // Check if department manager
      const deptCheck = await query(
        `SELECT manager_id FROM departments WHERE id = $1 AND manager_id = $2`,
        [employee.department_id, employee.id]
      );
      if (deptCheck.rows.length > 0) {
        userRole = 'department_manager';
      }
    }

    // TODO: Check if admin (for now, no admin check - will be added later)

    // Generate mock token (just employee ID for now)
    const token = Buffer.from(JSON.stringify({ employeeId: employee.id, email: employee.email })).toString('base64');

    // Return user data
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: userRole,
          employeeType: employee.type,
          companyId: employee.company_id,
          companyName: employee.company_name,
          profileStatus: employee.profile_status
        }
      }
    });
  } catch (error) {
    console.error('[AuthController] Error in login:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

/**
 * Get current user (verify token)
 */
const getCurrentUser = async (req, res) => {
  try {
    // For now, token is just base64 encoded employee data
    // In real implementation, this would verify JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const { employeeId } = decoded;

      // Get employee data
      const employeeResult = await query(
        `SELECT 
          e.id,
          e.name,
          e.email,
          e.type,
          e.role,
          e.profile_status,
          e.company_id,
          c.name as company_name
         FROM employees e
         LEFT JOIN companies c ON e.company_id = c.id
         WHERE e.id = $1
         LIMIT 1`,
        [employeeId]
      );

      if (employeeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const employee = employeeResult.rows[0];

      // Determine role (same logic as login)
      let userRole = 'employee';
      
      const normalizedEmail = employee.email.trim().toLowerCase();
      const hrCheck = await query(
        `SELECT company_id 
         FROM company_settings 
         WHERE setting_key = 'hr_email' 
         AND LOWER(TRIM(setting_value)) = $1
         LIMIT 1`,
        [normalizedEmail]
      );

      if (hrCheck.rows.length > 0) {
        userRole = 'hr';
      } else if (employee.type === 'internal_instructor' || employee.type === 'external_instructor') {
        userRole = 'trainer';
      }

      res.json({
        success: true,
        data: {
          user: {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            role: userRole,
            employeeType: employee.type,
            companyId: employee.company_id,
            companyName: employee.company_name,
            profileStatus: employee.profile_status
          }
        }
      });
    } catch (decodeError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('[AuthController] Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
};

/**
 * Logout (just clears token on client side, but endpoint exists for consistency)
 */
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  login,
  getCurrentUser,
  logout
};

