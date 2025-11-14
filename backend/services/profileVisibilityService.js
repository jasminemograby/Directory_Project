// Profile Visibility Service - RBAC for who can view whose profile
const { query } = require('../config/database');

/**
 * Check if a user can view another employee's profile
 * Returns: { allowed: boolean, reason: string }
 * 
 * Rules:
 * - HR: Can view all employees in their company
 * - Department Manager: Can view all employees in their department
 * - Team Manager: Can view all employees in their team
 * - Employee: Can only view their own profile
 * - Trainer: Can view their own profile (same as employee)
 */
const canViewProfile = async (viewerEmployeeId, targetEmployeeId) => {
  try {
    // Same employee can always view their own profile
    if (viewerEmployeeId === targetEmployeeId) {
      return { allowed: true, reason: 'Own profile' };
    }

    // Get viewer's role and company
    const viewerResult = await query(
      `SELECT 
        e.id,
        e.company_id,
        e.department_id,
        e.team_id,
        e.type,
        d.manager_id as dept_manager_id,
        t.manager_id as team_manager_id
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN teams t ON e.team_id = t.id
       WHERE e.id = $1`,
      [viewerEmployeeId]
    );

    if (viewerResult.rows.length === 0) {
      return { allowed: false, reason: 'Viewer not found' };
    }

    const viewer = viewerResult.rows[0];

    // Check if viewer is HR
    const hrCheck = await query(
      `SELECT company_id 
       FROM company_settings 
       WHERE setting_key = 'hr_email' 
       AND LOWER(TRIM(setting_value)) = (
         SELECT LOWER(TRIM(email)) FROM employees WHERE id = $1
       )
       LIMIT 1`,
      [viewerEmployeeId]
    );

    if (hrCheck.rows.length > 0 && hrCheck.rows[0].company_id === viewer.company_id) {
      // HR can view all employees in their company
      const targetResult = await query(
        `SELECT company_id FROM employees WHERE id = $1`,
        [targetEmployeeId]
      );

      if (targetResult.rows.length === 0) {
        return { allowed: false, reason: 'Target employee not found' };
      }

      if (targetResult.rows[0].company_id === viewer.company_id) {
        return { allowed: true, reason: 'HR viewing company employee' };
      } else {
        return { allowed: false, reason: 'Target employee is from different company' };
      }
    }

    // Check if viewer is department manager
    if (viewer.dept_manager_id === viewerEmployeeId) {
      // Department manager can view all employees in their department
      const targetResult = await query(
        `SELECT department_id, company_id 
         FROM employees 
         WHERE id = $1`,
        [targetEmployeeId]
      );

      if (targetResult.rows.length === 0) {
        return { allowed: false, reason: 'Target employee not found' };
      }

      const target = targetResult.rows[0];

      if (target.company_id !== viewer.company_id) {
        return { allowed: false, reason: 'Target employee is from different company' };
      }

      if (target.department_id === viewer.department_id) {
        return { allowed: true, reason: 'Department manager viewing department employee' };
      } else {
        return { allowed: false, reason: 'Target employee is not in your department' };
      }
    }

    // Check if viewer is team manager
    if (viewer.team_manager_id === viewerEmployeeId) {
      // Team manager can view all employees in their team
      const targetResult = await query(
        `SELECT team_id, company_id 
         FROM employees 
         WHERE id = $1`,
        [targetEmployeeId]
      );

      if (targetResult.rows.length === 0) {
        return { allowed: false, reason: 'Target employee not found' };
      }

      const target = targetResult.rows[0];

      if (target.company_id !== viewer.company_id) {
        return { allowed: false, reason: 'Target employee is from different company' };
      }

      if (target.team_id === viewer.team_id) {
        return { allowed: true, reason: 'Team manager viewing team employee' };
      } else {
        return { allowed: false, reason: 'Target employee is not in your team' };
      }
    }

    // Regular employee or trainer can only view their own profile
    return { allowed: false, reason: 'Employees can only view their own profile' };
  } catch (error) {
    console.error('[ProfileVisibilityService] Error checking profile visibility:', error);
    return { allowed: false, reason: 'Error checking permissions' };
  }
};

/**
 * Get list of employee IDs that a user can view
 */
const getViewableEmployeeIds = async (viewerEmployeeId) => {
  try {
    // Get viewer's role and company
    const viewerResult = await query(
      `SELECT 
        e.id,
        e.company_id,
        e.department_id,
        e.team_id,
        e.email,
        d.manager_id as dept_manager_id,
        t.manager_id as team_manager_id
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN teams t ON e.team_id = t.id
       WHERE e.id = $1`,
      [viewerEmployeeId]
    );

    if (viewerResult.rows.length === 0) {
      return [];
    }

    const viewer = viewerResult.rows[0];

    // Check if viewer is HR
    const hrCheck = await query(
      `SELECT company_id 
       FROM company_settings 
       WHERE setting_key = 'hr_email' 
       AND LOWER(TRIM(setting_value)) = $1
       LIMIT 1`,
      [viewer.email.trim().toLowerCase()]
    );

    if (hrCheck.rows.length > 0 && hrCheck.rows[0].company_id === viewer.company_id) {
      // HR can view all employees in their company
      const result = await query(
        `SELECT id FROM employees WHERE company_id = $1`,
        [viewer.company_id]
      );
      return result.rows.map(row => row.id);
    }

    // Check if viewer is department manager
    if (viewer.dept_manager_id === viewerEmployeeId) {
      // Department manager can view all employees in their department
      const result = await query(
        `SELECT id FROM employees WHERE department_id = $1 AND company_id = $2`,
        [viewer.department_id, viewer.company_id]
      );
      return result.rows.map(row => row.id);
    }

    // Check if viewer is team manager
    if (viewer.team_manager_id === viewerEmployeeId) {
      // Team manager can view all employees in their team
      const result = await query(
        `SELECT id FROM employees WHERE team_id = $1 AND company_id = $2`,
        [viewer.team_id, viewer.company_id]
      );
      return result.rows.map(row => row.id);
    }

    // Regular employee can only view their own profile
    return [viewerEmployeeId];
  } catch (error) {
    console.error('[ProfileVisibilityService] Error getting viewable employee IDs:', error);
    return [viewerEmployeeId]; // Fallback to own profile only
  }
};

module.exports = {
  canViewProfile,
  getViewableEmployeeIds
};

