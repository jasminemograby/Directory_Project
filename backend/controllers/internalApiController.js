// Internal API Controller - Inbound endpoints for other microservices
// Handles /api/internal/* endpoints with authentication
const { query } = require('../config/database');
const { INTERNAL_API_SECRET } = require('../config/microservices');

/**
 * Middleware to verify internal API authentication
 * Checks Authorization header for Bearer token matching INTERNAL_API_SECRET
 */
const verifyInternalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid Authorization header'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!INTERNAL_API_SECRET) {
    console.error('[InternalAPI] INTERNAL_API_SECRET not configured');
    return res.status(503).json({
      success: false,
      error: 'Internal API authentication not configured'
    });
  }

  if (token !== INTERNAL_API_SECRET) {
    console.warn(`[InternalAPI] Invalid token attempt from ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }

  next();
};

/**
 * Log external API call
 */
const logExternalApiCall = async (serviceName, endpoint, payload, status, error = null) => {
  try {
    await query(
      `INSERT INTO external_api_calls_log 
       (service_name, endpoint, payload, status, error, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [serviceName, endpoint, JSON.stringify(payload), status, error]
    );
  } catch (logError) {
    console.error('[InternalAPI] Failed to log API call:', logError.message);
    // Don't throw - logging failure shouldn't break the request
  }
};

/**
 * POST /api/internal/skills-engine/update
 * Receive skill updates from Skills Engine
 * Body: { employee_id, normalized_skills, verified_skills, relevance_scores }
 */
const updateSkillsEngine = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { employee_id, normalized_skills, verified_skills, relevance_scores } = req.body;

    // Validate required fields
    if (!employee_id) {
      await logExternalApiCall('SkillsEngine', '/api/internal/skills-engine/update', req.body, 'error', 'Missing employee_id');
      return res.status(400).json({
        success: false,
        error: 'Missing required field: employee_id'
      });
    }

    // Verify employee exists
    const employeeResult = await query(
      'SELECT id, company_id FROM employees WHERE id = $1',
      [employee_id]
    );

    if (employeeResult.rows.length === 0) {
      await logExternalApiCall('SkillsEngine', '/api/internal/skills-engine/update', req.body, 'error', 'Employee not found');
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const employee = employeeResult.rows[0];

    // Update employee relevance_score if provided
    if (relevance_scores && relevance_scores.score !== undefined) {
      await query(
        'UPDATE employees SET relevance_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [relevance_scores.score, employee_id]
      );
    }

    // Store normalized skills (if provided)
    if (normalized_skills && Array.isArray(normalized_skills)) {
      // Clear existing normalized skills for this employee
      await query(
        'DELETE FROM skills WHERE employee_id = $1 AND skill_type = $2',
        [employee_id, 'normalized']
      );

      // Insert new normalized skills
      for (const skill of normalized_skills) {
        await query(
          `INSERT INTO skills (employee_id, skill_name, skill_type, source)
           VALUES ($1, $2, $3, $4)`,
          [employee_id, skill.name || skill.skill_name, 'normalized', 'skills_engine']
        );
      }
    }

    // Store verified skills (if provided)
    if (verified_skills && Array.isArray(verified_skills)) {
      // Update or insert verified skills
      for (const skill of verified_skills) {
        await query(
          `INSERT INTO skills (employee_id, skill_name, skill_type, source)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [employee_id, skill.name || skill.skill_name, 'verified', 'skills_engine']
        );
      }
    }

    await logExternalApiCall('SkillsEngine', '/api/internal/skills-engine/update', req.body, 'success');

    console.log(`[InternalAPI] Skills Engine update successful for employee ${employee_id}`);

    return res.json({
      success: true,
      message: 'Skills updated successfully',
      employee_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[InternalAPI] Skills Engine update error:', error);
    await logExternalApiCall('SkillsEngine', '/api/internal/skills-engine/update', req.body, 'error', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/internal/content-studio/update
 * Receive course updates from Content Studio
 * Body: { course_id, course_name, trainer_id, trainer_name, status, completed_for: [learner_id] }
 */
const updateContentStudio = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { course_id, course_name, trainer_id, trainer_name, status, completed_for } = req.body;

    // Validate required fields
    if (!course_id || !trainer_id) {
      await logExternalApiCall('ContentStudio', '/api/internal/content-studio/update', req.body, 'error', 'Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: course_id, trainer_id'
      });
    }

    // Verify trainer exists
    const trainerResult = await query(
      'SELECT id, company_id FROM employees WHERE id = $1',
      [trainer_id]
    );

    if (trainerResult.rows.length === 0) {
      await logExternalApiCall('ContentStudio', '/api/internal/content-studio/update', req.body, 'error', 'Trainer not found');
      return res.status(404).json({
        success: false,
        error: 'Trainer not found'
      });
    }

    // If course is completed for learners, update completed_courses table
    if (completed_for && Array.isArray(completed_for)) {
      for (const learner_id of completed_for) {
        // Verify learner exists
        const learnerResult = await query(
          'SELECT id FROM employees WHERE id = $1',
          [learner_id]
        );

        if (learnerResult.rows.length > 0) {
          // Insert or update completed course
          await query(
            `INSERT INTO completed_courses 
             (employee_id, course_id, course_name, trainer_id, trainer_name, completed_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
             ON CONFLICT DO NOTHING`,
            [learner_id, course_id, course_name, trainer_id, trainer_name]
          );
        }
      }
    }

    await logExternalApiCall('ContentStudio', '/api/internal/content-studio/update', req.body, 'success');

    console.log(`[InternalAPI] Content Studio update successful for course ${course_id}`);

    return res.json({
      success: true,
      message: 'Course data updated successfully',
      course_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[InternalAPI] Content Studio update error:', error);
    await logExternalApiCall('ContentStudio', '/api/internal/content-studio/update', req.body, 'error', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/internal/course-builder/feedback
 * Receive course feedback from Course Builder
 * Body: { course_id, course_name, learner_id, feedback }
 */
const updateCourseBuilderFeedback = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { course_id, course_name, learner_id, feedback } = req.body;

    // Validate required fields
    if (!course_id || !learner_id) {
      await logExternalApiCall('CourseBuilder', '/api/internal/course-builder/feedback', req.body, 'error', 'Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: course_id, learner_id'
      });
    }

    // Verify learner exists
    const learnerResult = await query(
      'SELECT id FROM employees WHERE id = $1',
      [learner_id]
    );

    if (learnerResult.rows.length === 0) {
      await logExternalApiCall('CourseBuilder', '/api/internal/course-builder/feedback', req.body, 'error', 'Learner not found');
      return res.status(404).json({
        success: false,
        error: 'Learner not found'
      });
    }

    // Update completed course with feedback
    await query(
      `UPDATE completed_courses 
       SET feedback = $1, updated_at = CURRENT_TIMESTAMP
       WHERE employee_id = $2 AND course_id = $3`,
      [feedback, learner_id, course_id]
    );

    // If course doesn't exist, create it
    const updateResult = await query(
      `SELECT 1 FROM completed_courses WHERE employee_id = $1 AND course_id = $2`,
      [learner_id, course_id]
    );

    if (updateResult.rows.length === 0) {
      await query(
        `INSERT INTO completed_courses 
         (employee_id, course_id, course_name, feedback, completed_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [learner_id, course_id, course_name || 'Unknown Course', feedback]
      );
    }

    await logExternalApiCall('CourseBuilder', '/api/internal/course-builder/feedback', req.body, 'success');

    console.log(`[InternalAPI] Course Builder feedback update successful for course ${course_id}, learner ${learner_id}`);

    return res.json({
      success: true,
      message: 'Feedback updated successfully',
      course_id,
      learner_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[InternalAPI] Course Builder feedback update error:', error);
    await logExternalApiCall('CourseBuilder', '/api/internal/course-builder/feedback', req.body, 'error', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  verifyInternalAuth,
  updateSkillsEngine,
  updateContentStudio,
  updateCourseBuilderFeedback
};

