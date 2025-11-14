// Employee Controller
const { query } = require('../config/database');
const { canEditSensitiveFields, isHROrAdmin } = require('../utils/rbac');

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
        phone,
        address,
        role,
        current_role,
        target_role,
        type,
        company_id,
        department_id,
        team_id,
        preferred_language,
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
    const { name, email, phone, address, role, bio, preferred_language, profile_status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    // Define allowed fields for employee self-edit (non-sensitive fields)
    // Only: phone, address, preferred_language
    // Sensitive fields (name, role, email, department_id, team_id, type, bio, target_role, career_path) require HR approval
    const allowedFields = ['phone', 'address', 'preferred_language'];
    
    // Get editor employee ID from auth token (assume it's in req.employeeId or req.user.id)
    // For now, we'll extract from token or use the target employee ID if self-edit
    const editorEmployeeId = req.employeeId || req.user?.id || id; // Fallback to target ID if no auth
    
    // Check if editor is HR/Admin
    const canEditSensitive = await canEditSensitiveFields(editorEmployeeId, id);
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      params.push(phone);
      paramIndex++;
    }

    if (address !== undefined) {
      updates.push(`address = $${paramIndex}`);
      params.push(address);
      paramIndex++;
    }

    if (preferred_language !== undefined) {
      updates.push(`preferred_language = $${paramIndex}`);
      params.push(preferred_language);
      paramIndex++;
    }

    // Sensitive fields - require HR/Admin approval (not allowed for employee self-edit)
    if (name !== undefined) {
      if (!canEditSensitive) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: Name changes require HR approval. Please contact HR to update your name.'
        });
      }
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (email !== undefined) {
      if (!canEditSensitive) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: Email changes require HR approval. Please contact HR to update your email.'
        });
      }
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }

    if (role !== undefined) {
      if (!canEditSensitive) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: Role changes require HR approval. Please contact HR to update your role.'
        });
      }
      updates.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (bio !== undefined) {
      // Bio is AI-generated, don't allow manual editing (even for HR)
      return res.status(400).json({
        success: false,
        error: 'Bio is AI-generated from your LinkedIn/GitHub data and cannot be edited manually. To update your bio, reconnect your external accounts.'
      });
    }

    if (profile_status !== undefined) {
      // Profile status can only be changed by HR/Admin
      if (!canEditSensitive) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: Profile status can only be changed by HR/Admin.'
        });
      }
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

