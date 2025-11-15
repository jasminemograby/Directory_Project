// Admin Controller - Handles super admin requests
const { query } = require('../config/database');

/**
 * Get all companies (for Super Admin)
 */
const getAllCompanies = async (req, res) => {
  try {
    // Get all companies with statistics
    const companiesResult = await query(
      `SELECT 
        c.id,
        c.name,
        c.industry,
        c.domain,
        c.verification_status,
        c.learning_path_approval_policy,
        c.primary_kpi,
        c.created_at,
        c.updated_at,
        (SELECT COUNT(*) FROM employees WHERE company_id = c.id) as employee_count,
        (SELECT COUNT(*) FROM departments WHERE company_id = c.id) as department_count,
        (SELECT COUNT(*) FROM teams t 
         JOIN departments d ON t.department_id = d.id 
         WHERE d.company_id = c.id) as team_count
       FROM companies c
       ORDER BY c.created_at DESC`
    );

    const companies = companiesResult.rows.map(company => ({
      id: company.id,
      name: company.name,
      industry: company.industry,
      domain: company.domain,
      verification_status: company.verification_status,
      learning_path_approval_policy: company.learning_path_approval_policy,
      primary_kpi: company.primary_kpi,
      created_at: company.created_at,
      updated_at: company.updated_at,
      statistics: {
        employees: parseInt(company.employee_count) || 0,
        departments: parseInt(company.department_count) || 0,
        teams: parseInt(company.team_count) || 0
      }
    }));

    res.json({
      success: true,
      data: {
        companies: companies
      }
    });
  } catch (error) {
    console.error('[AdminController] Error getting all companies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies'
    });
  }
};

/**
 * Get all employees across all companies (for Super Admin - read-only)
 */
const getAllEmployees = async (req, res) => {
  try {
    const employeesResult = await query(
      `SELECT 
        e.id,
        e.name,
        e.email,
        e.role,
        e.type,
        e."current_role",
        e.target_role,
        e.profile_status,
        e.created_at,
        e.updated_at,
        c.name as company_name,
        c.id as company_id
       FROM employees e
       LEFT JOIN companies c ON e.company_id = c.id
       ORDER BY e.created_at DESC
       LIMIT 1000`
    );

    const employees = employeesResult.rows.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role || emp.current_role,
      type: emp.type,
      profile_status: emp.profile_status,
      company_id: emp.company_id,
      company_name: emp.company_name,
      created_at: emp.created_at
    }));

    res.json({
      success: true,
      data: {
        employees: employees
      }
    });
  } catch (error) {
    console.error('[AdminController] Error getting all employees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees'
    });
  }
};

/**
 * Get admin action logs
 */
const getAdminLogs = async (req, res) => {
  try {
    // TODO: Implement when audit_logs table is created
    // For now, return empty array
    res.json({
      success: true,
      data: {
        logs: []
      }
    });
  } catch (error) {
    console.error('[AdminController] Error getting admin logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logs'
    });
  }
};

module.exports = {
  getAllCompanies,
  getAllEmployees,
  getAdminLogs
};

