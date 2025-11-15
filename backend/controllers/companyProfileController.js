// Company Profile Controller - Handles company profile and hierarchy requests
const { query } = require('../config/database');

/**
 * Get company hierarchy (Company → Departments → Teams → Employees)
 */
const getCompanyHierarchy = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Get company details
    const companyResult = await query(
      `SELECT id, name FROM companies WHERE id = $1`,
      [companyId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const company = companyResult.rows[0];

    // Get all departments
    const departmentsResult = await query(
      `SELECT id, name FROM departments WHERE company_id = $1 ORDER BY name`,
      [companyId]
    );

    // Get teams and employees for each department
    const departments = await Promise.all(
      departmentsResult.rows.map(async (dept) => {
        // Get teams in department
        const teamsResult = await query(
          `SELECT id, name FROM teams WHERE department_id = $1 ORDER BY name`,
          [dept.id]
        );

        // Get employees for each team
        const teams = await Promise.all(
          teamsResult.rows.map(async (team) => {
            const employeesResult = await query(
              `SELECT id, name, email, role, type, "current_role", target_role
               FROM employees 
               WHERE team_id = $1 AND company_id = $2
               ORDER BY name`,
              [team.id, companyId]
            );

            return {
              id: team.id,
              name: team.name,
              type: 'Team',
              employees: employeesResult.rows.map(emp => ({
                id: emp.id,
                name: emp.name,
                email: emp.email,
                role: emp.role || emp.current_role,
                type: emp.type
              }))
            };
          })
        );

        return {
          id: dept.id,
          name: dept.name,
          type: 'Department',
          teams: teams
        };
      })
    );

    const hierarchy = {
      id: company.id,
      name: company.name,
      type: 'Company',
      departments: departments
    };

    res.json({
      success: true,
      data: {
        hierarchy: hierarchy
      }
    });
  } catch (error) {
    console.error('[CompanyProfileController] Error getting company hierarchy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company hierarchy'
    });
  }
};

/**
 * Get company requests (pending approvals, extra attempts, etc.)
 */
const getCompanyRequests = async (req, res) => {
  try {
    const { companyId } = req.params;

    // TODO: Implement when requests table is created
    // For now, return empty array
    res.json({
      success: true,
      data: {
        requests: []
      }
    });
  } catch (error) {
    console.error('[CompanyProfileController] Error getting company requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company requests'
    });
  }
};

module.exports = {
  getCompanyHierarchy,
  getCompanyRequests
};

