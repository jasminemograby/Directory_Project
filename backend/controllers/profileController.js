// Profile Controller - Handles all profile-related requests
const { query } = require('../config/database');
const valuePropositionService = require('../services/valuePropositionService');
const axios = require('axios'); // For external microservice calls

/**
 * Get complete employee profile with all sections
 */
const getEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get basic employee data
    const employeeResult = await query(
      `SELECT id, name, email, role, current_role, target_role, value_proposition, 
              profile_status, company_id, created_at, updated_at
       FROM employees WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const employee = employeeResult.rows[0];

    // Get value proposition (generate if not exists)
    let valueProposition = employee.value_proposition;
    if (!valueProposition && employee.current_role && employee.target_role) {
      valueProposition = await valuePropositionService.getValueProposition(employeeId);
    }

    // Get relevance score from Skills Engine (mock for now)
    // TODO: Replace with actual Skills Engine API call
    const relevanceScore = null; // Will be fetched from Skills Engine

    // Get competencies/skills from Skills Engine (mock for now)
    // TODO: Replace with actual Skills Engine API call
    const competencies = null; // Will be fetched from Skills Engine

    // Get courses from external microservices
    const [completedCourses, learningCourses, assignedCourses, taughtCourses] = await Promise.all([
      getCompletedCoursesFromAPI(employeeId),
      getLearningCoursesFromAPI(employeeId),
      getAssignedCoursesFromAPI(employeeId),
      getTaughtCoursesFromAPI(employeeId) // Only if employee is a trainer
    ]);

    res.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          profileStatus: employee.profile_status,
          companyId: employee.company_id
        },
        career: {
          currentRole: employee.current_role || employee.role,
          targetRole: employee.target_role,
          valueProposition: valueProposition,
          relevanceScore: relevanceScore
        },
        competencies: competencies,
        courses: {
          completed: completedCourses,
          learning: learningCourses,
          assigned: assignedCourses,
          taught: taughtCourses
        }
      }
    });
  } catch (error) {
    console.error('[ProfileController] Error getting employee profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee profile'
    });
  }
};

/**
 * Get value proposition for employee
 */
const getValueProposition = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const valueProposition = await valuePropositionService.getValueProposition(employeeId);

    if (!valueProposition) {
      return res.status(404).json({
        success: false,
        error: 'Value proposition not available. Current role and target role must be set.'
      });
    }

    res.json({
      success: true,
      data: {
        valueProposition: valueProposition
      }
    });
  } catch (error) {
    console.error('[ProfileController] Error getting value proposition:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch value proposition'
    });
  }
};

/**
 * Get completed courses from Course Builder
 * Format: feedback, course_id, course_name, learner_id
 */
const getCompletedCourses = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // TODO: Replace with actual Course Builder API call
    // For now, get from database if we have a courses table
    // Course Builder sends: feedback, course_id, course_name, learner_id

    // Mock data structure:
    const mockCourses = []; // Will be replaced with actual API call

    // Try to fetch from Course Builder microservice
    try {
      // const courseBuilderResponse = await fetch(`${COURSE_BUILDER_URL}/api/courses/completed/${employeeId}`);
      // const courses = await courseBuilderResponse.json();
      // For now, return empty array
      res.json({
        success: true,
        data: {
          courses: mockCourses
        }
      });
    } catch (apiError) {
      console.warn('[ProfileController] Course Builder API not available, using fallback');
      res.json({
        success: true,
        data: {
          courses: mockCourses
        }
      });
    }
  } catch (error) {
    console.error('[ProfileController] Error getting completed courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch completed courses'
    });
  }
};

/**
 * Get courses taught by trainer from Content Studio
 * Format: course_id, course_name, trainer_id, trainer_name, status
 */
const getTaughtCourses = async (req, res) => {
  try {
    const { trainerId } = req.params;

    // TODO: Replace with actual Content Studio API call
    // Content Studio sends: course_id, course_name, trainer_id, trainer_name, status

    const mockCourses = []; // Will be replaced with actual API call

    // Try to fetch from Content Studio microservice
    try {
      // const contentStudioResponse = await fetch(`${CONTENT_STUDIO_URL}/api/courses/trainer/${trainerId}`);
      // const courses = await contentStudioResponse.json();
      res.json({
        success: true,
        data: {
          courses: mockCourses
        }
      });
    } catch (apiError) {
      console.warn('[ProfileController] Content Studio API not available, using fallback');
      res.json({
        success: true,
        data: {
          courses: mockCourses
        }
      });
    }
  } catch (error) {
    console.error('[ProfileController] Error getting taught courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch taught courses'
    });
  }
};

/**
 * Get assigned courses (from company learning paths - future feature)
 */
const getAssignedCourses = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // This will be implemented when company profile functionality is complete
    // For now, return empty array
    res.json({
      success: true,
      data: {
        courses: []
      }
    });
  } catch (error) {
    console.error('[ProfileController] Error getting assigned courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assigned courses'
    });
  }
};

/**
 * Get learning courses (currently in progress)
 */
const getLearningCourses = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // TODO: Get from Course Builder or Learning Analytics
    // For now, return empty array
    res.json({
      success: true,
      data: {
        courses: []
      }
    });
  } catch (error) {
    console.error('[ProfileController] Error getting learning courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning courses'
    });
  }
};

// Helper functions - Fetch from external microservices with fallback
const getCompletedCoursesFromAPI = async (employeeId) => {
  // Course Builder sends: feedback, course_id, course_name, learner_id
  const COURSE_BUILDER_URL = process.env.COURSE_BUILDER_URL;
  
  if (!COURSE_BUILDER_URL) {
    console.warn('[ProfileController] COURSE_BUILDER_URL not configured');
    return [];
  }

  try {
    const response = await axios.get(`${COURSE_BUILDER_URL}/api/courses/completed/${employeeId}`, {
      timeout: 5000
    });
    return response.data.courses || [];
  } catch (error) {
    console.warn('[ProfileController] Course Builder API not available, using fallback');
    return [];
  }
};

/**
 * Get team hierarchy for Team Leader
 * Returns teams and employees under the team leader
 */
const getTeamHierarchy = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get employee's team
    const employeeResult = await query(
      `SELECT team_id, company_id FROM employees WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const { team_id, company_id } = employeeResult.rows[0];

    if (!team_id) {
      return res.json({
        success: true,
        data: {
          hierarchy: null,
          message: 'Employee is not assigned to a team'
        }
      });
    }

    // Get team details
    const teamResult = await query(
      `SELECT id, name, department_id FROM teams WHERE id = $1`,
      [team_id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    const team = teamResult.rows[0];

    // Get all employees in the team
    const employeesResult = await query(
      `SELECT id, name, email, role, type, current_role, target_role
       FROM employees 
       WHERE team_id = $1 AND company_id = $2
       ORDER BY name`,
      [team_id, company_id]
    );

    const hierarchy = {
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

    res.json({
      success: true,
      data: {
        hierarchy: hierarchy
      }
    });
  } catch (error) {
    console.error('[ProfileController] Error getting team hierarchy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team hierarchy'
    });
  }
};

/**
 * Get department hierarchy for Department Manager
 * Returns departments, teams, and employees under the department manager
 */
const getDepartmentHierarchy = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get employee's department
    const employeeResult = await query(
      `SELECT department_id, company_id FROM employees WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const { department_id, company_id } = employeeResult.rows[0];

    if (!department_id) {
      return res.json({
        success: true,
        data: {
          hierarchy: null,
          message: 'Employee is not assigned to a department'
        }
      });
    }

    // Get department details
    const deptResult = await query(
      `SELECT id, name FROM departments WHERE id = $1`,
      [department_id]
    );

    if (deptResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    const department = deptResult.rows[0];

    // Get all teams in the department
    const teamsResult = await query(
      `SELECT id, name FROM teams WHERE department_id = $1 ORDER BY name`,
      [department_id]
    );

    // Get all employees in teams within the department
    const teams = await Promise.all(
      teamsResult.rows.map(async (team) => {
        const employeesResult = await query(
          `SELECT id, name, email, role, type, current_role, target_role
           FROM employees 
           WHERE team_id = $1 AND company_id = $2
           ORDER BY name`,
          [team.id, company_id]
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

    const hierarchy = {
      id: department.id,
      name: department.name,
      type: 'Department',
      teams: teams
    };

    res.json({
      success: true,
      data: {
        hierarchy: hierarchy
      }
    });
  } catch (error) {
    console.error('[ProfileController] Error getting department hierarchy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department hierarchy'
    });
  }
};

const getLearningCoursesFromAPI = async (employeeId) => {
  // Get from Course Builder or Learning Analytics
  const COURSE_BUILDER_URL = process.env.COURSE_BUILDER_URL;
  
  if (!COURSE_BUILDER_URL) {
    return [];
  }

  try {
    const response = await axios.get(`${COURSE_BUILDER_URL}/api/courses/learning/${employeeId}`, {
      timeout: 5000
    });
    return response.data.courses || [];
  } catch (error) {
    console.warn('[ProfileController] Course Builder API not available for learning courses');
    return [];
  }
};

const getAssignedCoursesFromAPI = async (employeeId) => {
  // This will be implemented when company profile functionality is complete
  // For now, return empty array
  return [];
};

const getTaughtCoursesFromAPI = async (employeeId) => {
  // Content Studio sends: course_id, course_name, trainer_id, trainer_name, status
  // Only fetch if employee is a trainer
  const CONTENT_STUDIO_URL = process.env.CONTENT_STUDIO_URL;
  
  // Check if employee is a trainer
  const employeeResult = await query(
    `SELECT type FROM employees WHERE id = $1`,
    [employeeId]
  );

  if (employeeResult.rows.length === 0 || 
      (employeeResult.rows[0].type !== 'internal_instructor' && 
       employeeResult.rows[0].type !== 'external_instructor')) {
    return []; // Not a trainer
  }

  if (!CONTENT_STUDIO_URL) {
    console.warn('[ProfileController] CONTENT_STUDIO_URL not configured');
    return [];
  }

  try {
    const response = await axios.get(`${CONTENT_STUDIO_URL}/api/courses/trainer/${employeeId}`, {
      timeout: 5000
    });
    return response.data.courses || [];
  } catch (error) {
    console.warn('[ProfileController] Content Studio API not available, using fallback');
    return [];
  }
};

module.exports = {
  getEmployeeProfile,
  getValueProposition,
  getCompletedCourses,
  getTaughtCourses,
  getAssignedCourses,
  getLearningCourses,
  getTeamHierarchy,
  getDepartmentHierarchy
};

