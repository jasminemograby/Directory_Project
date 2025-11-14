// Requests Controller - Handles all employee requests (training, skill verification, self-learning, extra attempts)
const { query } = require('../config/database');

/**
 * Create a training request
 */
const createTrainingRequest = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { courseId, courseName, reason } = req.body;

    if (!courseId || !courseName) {
      return res.status(400).json({
        success: false,
        error: 'Course ID and course name are required'
      });
    }

    // Verify employee exists
    const employeeResult = await query(
      `SELECT id, company_id FROM employees WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const { company_id } = employeeResult.rows[0];

    // Create training request
    const result = await query(
      `INSERT INTO training_requests (employee_id, company_id, course_id, course_name, reason, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP)
       RETURNING *`,
      [employeeId, company_id, courseId, courseName, reason || null]
    );

    res.json({
      success: true,
      data: {
        request: result.rows[0]
      }
    });
  } catch (error) {
    console.error('[RequestsController] Error creating training request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create training request'
    });
  }
};

/**
 * Create a skill verification request
 */
const createSkillVerificationRequest = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { skillIds, reason } = req.body;

    if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one skill ID is required'
      });
    }

    // Verify employee exists
    const employeeResult = await query(
      `SELECT id, company_id FROM employees WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const { company_id } = employeeResult.rows[0];

    // Create skill verification request
    const result = await query(
      `INSERT INTO skill_verification_requests (employee_id, company_id, skill_ids, reason, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)
       RETURNING *`,
      [employeeId, company_id, JSON.stringify(skillIds), reason || null]
    );

    res.json({
      success: true,
      data: {
        request: result.rows[0]
      }
    });
  } catch (error) {
    console.error('[RequestsController] Error creating skill verification request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create skill verification request'
    });
  }
};

/**
 * Create a self-learning request
 */
const createSelfLearningRequest = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { courseId, courseName, reason, learningPath } = req.body;

    if (!courseId || !courseName) {
      return res.status(400).json({
        success: false,
        error: 'Course ID and course name are required'
      });
    }

    // Verify employee exists
    const employeeResult = await query(
      `SELECT id, company_id FROM employees WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const { company_id } = employeeResult.rows[0];

    // Create self-learning request
    const result = await query(
      `INSERT INTO self_learning_requests (employee_id, company_id, course_id, course_name, reason, learning_path, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP)
       RETURNING *`,
      [employeeId, company_id, courseId, courseName, reason || null, learningPath || null]
    );

    res.json({
      success: true,
      data: {
        request: result.rows[0]
      }
    });
  } catch (error) {
    console.error('[RequestsController] Error creating self-learning request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create self-learning request'
    });
  }
};

/**
 * Create an extra attempt request
 */
const createExtraAttemptRequest = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { courseId, courseName, currentAttempts, reason } = req.body;

    if (!courseId || !courseName || currentAttempts === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Course ID, course name, and current attempts are required'
      });
    }

    // Verify employee exists
    const employeeResult = await query(
      `SELECT id, company_id FROM employees WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const { company_id } = employeeResult.rows[0];

    // Create extra attempt request
    const result = await query(
      `INSERT INTO extra_attempt_requests (employee_id, company_id, course_id, current_attempts, reason, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP)
       RETURNING *`,
      [employeeId, company_id, courseId, currentAttempts, reason || null]
    );

    res.json({
      success: true,
      data: {
        request: result.rows[0]
      }
    });
  } catch (error) {
    console.error('[RequestsController] Error creating extra attempt request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create extra attempt request'
    });
  }
};

/**
 * Get all pending requests for HR (by company)
 */
const getPendingRequests = async (req, res) => {
  try {
    const hrEmail = req.query.hrEmail || req.user?.email;
    
    if (!hrEmail) {
      return res.status(400).json({
        success: false,
        error: 'HR email is required'
      });
    }

    // Get HR's company ID
    const hrCheck = await query(
      `SELECT company_id 
       FROM company_settings 
       WHERE setting_key = 'hr_email' 
       AND LOWER(TRIM(setting_value)) = $1
       LIMIT 1`,
      [hrEmail.trim().toLowerCase()]
    );

    if (hrCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'HR not found or not authorized'
      });
    }

    const companyId = hrCheck.rows[0].company_id;

    // Get all pending requests
    const [trainingRequests, skillVerificationRequests, selfLearningRequests, extraAttemptRequests] = await Promise.all([
      query(
        `SELECT tr.*, e.name as employee_name, e.email as employee_email
         FROM training_requests tr
         JOIN employees e ON tr.employee_id = e.id
         WHERE tr.company_id = $1 AND tr.status = 'pending'
         ORDER BY tr.created_at DESC`,
        [companyId]
      ),
      query(
        `SELECT svr.*, e.name as employee_name, e.email as employee_email
         FROM skill_verification_requests svr
         JOIN employees e ON svr.employee_id = e.id
         WHERE svr.company_id = $1 AND svr.status = 'pending'
         ORDER BY svr.created_at DESC`,
        [companyId]
      ),
      query(
        `SELECT slr.*, e.name as employee_name, e.email as employee_email
         FROM self_learning_requests slr
         JOIN employees e ON slr.employee_id = e.id
         WHERE slr.company_id = $1 AND slr.status = 'pending'
         ORDER BY slr.created_at DESC`,
        [companyId]
      ),
      query(
        `SELECT ear.*, e.name as employee_name, e.email as employee_email
         FROM extra_attempt_requests ear
         JOIN employees e ON ear.employee_id = e.id
         WHERE ear.company_id = $1 AND ear.status = 'pending'
         ORDER BY ear.created_at DESC`,
        [companyId]
      )
    ]);

    res.json({
      success: true,
      data: {
        training: trainingRequests.rows,
        skillVerification: skillVerificationRequests.rows,
        selfLearning: selfLearningRequests.rows,
        extraAttempts: extraAttemptRequests.rows
      }
    });
  } catch (error) {
    console.error('[RequestsController] Error getting pending requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending requests'
    });
  }
};

/**
 * Approve a request (generic - works for all request types)
 */
const approveRequest = async (req, res) => {
  try {
    const { requestType, requestId } = req.params;
    const { notes } = req.body;

    // Map request types to table names
    const tableMap = {
      'training': 'training_requests',
      'skill-verification': 'skill_verification_requests',
      'self-learning': 'self_learning_requests',
      'extra-attempts': 'extra_attempt_requests'
    };

    const tableName = tableMap[requestType];
    if (!tableName) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request type'
      });
    }

    // Update request status
    const result = await query(
      `UPDATE ${tableName} 
       SET status = 'approved', 
           approved_at = CURRENT_TIMESTAMP,
           approved_by = $1,
           notes = $2
       WHERE id = $3
       RETURNING *`,
      [req.user?.email || 'hr', notes || null, requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: {
        request: result.rows[0]
      }
    });
  } catch (error) {
    console.error('[RequestsController] Error approving request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve request'
    });
  }
};

/**
 * Reject a request (generic - works for all request types)
 */
const rejectRequest = async (req, res) => {
  try {
    const { requestType, requestId } = req.params;
    const { reason } = req.body;

    // Map request types to table names
    const tableMap = {
      'training': 'training_requests',
      'skill-verification': 'skill_verification_requests',
      'self-learning': 'self_learning_requests',
      'extra-attempts': 'extra_attempt_requests'
    };

    const tableName = tableMap[requestType];
    if (!tableName) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request type'
      });
    }

    // Update request status
    const result = await query(
      `UPDATE ${tableName} 
       SET status = 'rejected', 
           rejected_at = CURRENT_TIMESTAMP,
           rejected_by = $1,
           rejection_reason = $2
       WHERE id = $3
       RETURNING *`,
      [req.user?.email || 'hr', reason || null, requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: {
        request: result.rows[0]
      }
    });
  } catch (error) {
    console.error('[RequestsController] Error rejecting request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject request'
    });
  }
};

/**
 * Get employee's own requests
 */
const getEmployeeRequests = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Verify employee exists
    const employeeResult = await query(
      `SELECT id FROM employees WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Get all requests for this employee
    const [trainingRequests, skillVerificationRequests, selfLearningRequests, extraAttemptRequests] = await Promise.all([
      query(
        `SELECT * FROM training_requests WHERE employee_id = $1 ORDER BY created_at DESC`,
        [employeeId]
      ),
      query(
        `SELECT * FROM skill_verification_requests WHERE employee_id = $1 ORDER BY created_at DESC`,
        [employeeId]
      ),
      query(
        `SELECT * FROM self_learning_requests WHERE employee_id = $1 ORDER BY created_at DESC`,
        [employeeId]
      ),
      query(
        `SELECT * FROM extra_attempt_requests WHERE employee_id = $1 ORDER BY created_at DESC`,
        [employeeId]
      )
    ]);

    res.json({
      success: true,
      data: {
        training: trainingRequests.rows,
        skillVerification: skillVerificationRequests.rows,
        selfLearning: selfLearningRequests.rows,
        extraAttempts: extraAttemptRequests.rows
      }
    });
  } catch (error) {
    console.error('[RequestsController] Error getting employee requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee requests'
    });
  }
};

module.exports = {
  createTrainingRequest,
  createSkillVerificationRequest,
  createSelfLearningRequest,
  createExtraAttemptRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getEmployeeRequests
};

