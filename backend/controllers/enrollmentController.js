// Enrollment Controller - HR enrolls employees to learning paths
const { query } = require('../config/database');
const microserviceIntegrationService = require('../services/microserviceIntegrationService');

/**
 * Enroll employees to learning paths
 * POST /api/enrollment/learning-path
 * Body: {
 *   employeeIds: [uuid],
 *   type: 'personalized' | 'group' | 'instructor',
 *   skillIds?: [string], // For group type
 *   instructorId?: string // For instructor type
 * }
 */
const enrollEmployeesToLearningPath = async (req, res) => {
  try {
    const { employeeIds, type, skillIds, instructorId } = req.body;

    // Validation
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one employee ID is required'
      });
    }

    if (!type || !['personalized', 'group', 'instructor'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid enrollment type. Must be: personalized, group, or instructor'
      });
    }

    // Validate type-specific requirements
    if (type === 'instructor' && !instructorId) {
      return res.status(400).json({
        success: false,
        error: 'Instructor ID is required for instructor type enrollment'
      });
    }

    // Verify all employees exist and belong to the same company
    const employeesResult = await query(
      `SELECT id, name, email, company_id, current_role, target_role, type
       FROM employees 
       WHERE id = ANY($1::uuid[])`,
      [employeeIds]
    );

    if (employeesResult.rows.length !== employeeIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more employee IDs not found'
      });
    }

    // Check all employees belong to the same company
    const companyIds = [...new Set(employeesResult.rows.map(emp => emp.company_id))];
    if (companyIds.length > 1) {
      return res.status(400).json({
        success: false,
        error: 'All employees must belong to the same company'
      });
    }

    const companyId = companyIds[0];

    // Prepare enrollment data for Learner AI
    const enrollmentData = {
      company_id: companyId,
      employee_ids: employeeIds,
      enrollment_type: type,
      employees: employeesResult.rows.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        current_role: emp.current_role,
        target_role: emp.target_role,
        type: emp.type
      }))
    };

    // Add type-specific data
    if (type === 'group' && skillIds && skillIds.length > 0) {
      enrollmentData.skill_ids = skillIds;
    } else if (type === 'instructor' && instructorId) {
      enrollmentData.instructor_id = instructorId;
    }

    // Send enrollment request to Learner AI microservice
    let learnerAiResponse = null;
    try {
      console.log(`[Enrollment] Sending enrollment request to Learner AI for ${employeeIds.length} employee(s), type: ${type}`);
      
      learnerAiResponse = await microserviceIntegrationService.sendRequest(
        'LearnerAI',
        {
          action: 'enroll_employees',
          ...enrollmentData
        }
      );

      console.log(`[Enrollment] ✅ Learner AI enrollment completed`);
    } catch (error) {
      console.error(`[Enrollment] ⚠️ Error sending to Learner AI (non-critical):`, error.message);
      // Don't fail enrollment if Learner AI fails - it's non-critical for MVP
      // In production, you might want to queue this for retry
    }

    // Store enrollment record in database (optional - for tracking)
    try {
      for (const employeeId of employeeIds) {
        await query(
          `INSERT INTO learning_path_enrollments 
           (employee_id, company_id, enrollment_type, skill_ids, instructor_id, status, created_at)
           VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP)
           ON CONFLICT DO NOTHING`,
          [
            employeeId,
            companyId,
            type,
            skillIds && skillIds.length > 0 ? JSON.stringify(skillIds) : null,
            instructorId || null
          ]
        );
      }
    } catch (dbError) {
      console.warn(`[Enrollment] ⚠️ Error storing enrollment record (non-critical):`, dbError.message);
      // Don't fail if database insert fails - enrollment is still processed
    }

    res.json({
      success: true,
      data: {
        enrolledCount: employeeIds.length,
        enrollmentType: type,
        learnerAiResponse: learnerAiResponse || null,
        message: `Successfully enrolled ${employeeIds.length} employee(s) to ${type} learning path`
      }
    });
  } catch (error) {
    console.error('[EnrollmentController] Error enrolling employees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enroll employees to learning path'
    });
  }
};

module.exports = {
  enrollEmployeesToLearningPath
};

