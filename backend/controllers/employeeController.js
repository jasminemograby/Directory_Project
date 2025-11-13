// Employee Controller
const { query } = require('../config/database');

/**
 * Get employee by ID
 * GET /api/employee/:id
 */
const getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    const result = await query(
      `SELECT 
        id,
        name,
        email,
        role,
        company_id,
        department_id,
        team_id,
        bio,
        profile_status,
        created_at,
        updated_at
       FROM employees 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching employee:', error.message);
    next(error);
  }
};

/**
 * Get all employees (with optional filters)
 * GET /api/employee
 */
const getEmployees = async (req, res, next) => {
  try {
    const { companyId, departmentId, teamId } = req.query;

    let sql = `SELECT 
      id,
      name,
      email,
      role,
      company_id,
      department_id,
      team_id,
      bio,
      profile_status,
      created_at,
      updated_at
     FROM employees 
     WHERE 1=1`;
    
    const params = [];
    let paramIndex = 1;

    if (companyId) {
      sql += ` AND company_id = $${paramIndex}`;
      params.push(companyId);
      paramIndex++;
    }

    if (departmentId) {
      sql += ` AND department_id = $${paramIndex}`;
      params.push(departmentId);
      paramIndex++;
    }

    if (teamId) {
      sql += ` AND team_id = $${paramIndex}`;
      params.push(teamId);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    next(error);
  }
};

/**
 * Update employee
 * PUT /api/employee/:id
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, bio, profile_status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }

    if (role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex}`);
      params.push(bio);
      paramIndex++;
    }

    if (profile_status !== undefined) {
      updates.push(`profile_status = $${paramIndex}`);
      params.push(profile_status);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `UPDATE employees 
                 SET ${updates.join(', ')} 
                 WHERE id = $${paramIndex}
                 RETURNING *`;

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating employee:', error.message);
    next(error);
  }
};

module.exports = {
  getEmployee,
  getEmployees,
  updateEmployee
};

