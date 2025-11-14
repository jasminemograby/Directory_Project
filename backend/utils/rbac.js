// RBAC Utility Functions - Check user permissions
const { query } = require('../config/database');

/**
 * Get user RBAC type (system permissions level)
 * Returns: 'hr' | 'department_manager' | 'team_manager' | 'trainer' | 'employee' | 'admin'
 * 
 * @param {string} employeeId - Employee ID
 * @returns {Promise<string>} - RBAC type
 */
const getUserRBACType = async (employeeId) => {
  try {
    // Get employee data
    const employeeResult = await query(
      `SELECT 
        e.id,
        e.email,
        e.type,
        e.department_id,
        e.team_id
       FROM employees e
       WHERE e.id = $1
       LIMIT 1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return null;
    }

    const employee = employeeResult.rows[0];
    const normalizedEmail = employee.email.trim().toLowerCase();

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
      return 'hr';
    }

    // Check if department manager (takes precedence over team manager)
    if (employee.department_id) {
      const deptCheck = await query(
        `SELECT manager_id FROM departments WHERE id = $1 AND manager_id = $2`,
        [employee.department_id, employee.id]
      );
      if (deptCheck.rows.length > 0) {
        return 'department_manager';
      }
    }

    // Check if team manager
    if (employee.team_id) {
      const teamCheck = await query(
        `SELECT manager_id FROM teams WHERE id = $1 AND manager_id = $2`,
        [employee.team_id, employee.id]
      );
      if (teamCheck.rows.length > 0) {
        return 'team_manager';
      }
    }

    // Check if trainer
    if (employee.type === 'internal_instructor' || employee.type === 'external_instructor') {
      return 'trainer';
    }

    // Default: regular employee
    return 'employee';
  } catch (error) {
    console.error('[RBAC] Error getting user RBAC type:', error);
    return null;
  }
};

/**
 * Check if user has specific RBAC type
 * 
 * @param {string} employeeId - Employee ID
 * @param {string|string[]} allowedTypes - Allowed RBAC type(s)
 * @returns {Promise<boolean>} - True if user has allowed type
 */
const hasRBACType = async (employeeId, allowedTypes) => {
  const userType = await getUserRBACType(employeeId);
  if (!userType) return false;

  if (Array.isArray(allowedTypes)) {
    return allowedTypes.includes(userType);
  }
  return userType === allowedTypes;
};

/**
 * Check if user is HR or Admin
 * 
 * @param {string} employeeId - Employee ID
 * @returns {Promise<boolean>} - True if user is HR or Admin
 */
const isHROrAdmin = async (employeeId) => {
  const userType = await getUserRBACType(employeeId);
  return userType === 'hr' || userType === 'admin';
};

/**
 * Check if user can edit employee profile (HR/Admin or own profile)
 * 
 * @param {string} editorEmployeeId - Employee ID of editor
 * @param {string} targetEmployeeId - Employee ID of target profile
 * @returns {Promise<boolean>} - True if user can edit
 */
const canEditEmployeeProfile = async (editorEmployeeId, targetEmployeeId) => {
  // Can always edit own profile
  if (editorEmployeeId === targetEmployeeId) {
    return true;
  }

  // HR/Admin can edit any profile
  return await isHROrAdmin(editorEmployeeId);
};

/**
 * Check if user can edit sensitive fields (name, email, role, etc.)
 * Only HR/Admin can edit sensitive fields
 * 
 * @param {string} editorEmployeeId - Employee ID of editor
 * @param {string} targetEmployeeId - Employee ID of target profile
 * @returns {Promise<boolean>} - True if user can edit sensitive fields
 */
const canEditSensitiveFields = async (editorEmployeeId, targetEmployeeId) => {
  // Only HR/Admin can edit sensitive fields (even for own profile)
  return await isHROrAdmin(editorEmployeeId);
};

module.exports = {
  getUserRBACType,
  hasRBACType,
  isHROrAdmin,
  canEditEmployeeProfile,
  canEditSensitiveFields
};

