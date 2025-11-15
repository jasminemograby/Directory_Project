// Profile Controller - Handles all profile-related requests
const { query } = require('../config/database');
const valuePropositionService = require('../services/valuePropositionService');
const mockSkillsEngineService = require('../services/mockSkillsEngineService');
const mockCourseBuilderService = require('../services/mockCourseBuilderService');
const mockContentStudioService = require('../services/mockContentStudioService');
const profileVisibilityService = require('../services/profileVisibilityService');
const { sendRequest } = require('../services/microserviceIntegrationService');
const axios = require('axios'); // For external microservice calls (legacy - will be replaced)

/**
 * Get complete employee profile with all sections
 */
const getEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const viewerEmployeeId = req.employeeId || req.user?.id; // From middleware or auth

    // Check profile visibility (RBAC) if viewer is authenticated
    if (viewerEmployeeId) {
      const visibilityCheck = await profileVisibilityService.canViewProfile(viewerEmployeeId, employeeId);
      if (!visibilityCheck.allowed) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view this profile',
          reason: visibilityCheck.reason
        });
      }
    }

    // Get basic employee data
    const employeeResult = await query(
      `SELECT id, name, email, role, type, "current_role", target_role, value_proposition, 
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
    const sanitizedRole = employee.role && employee.role.toLowerCase() === 'postgres' ? null : employee.role;
    const sanitizedCurrentRole = employee.current_role || sanitizedRole || null;
    employee.role = sanitizedRole;
    employee.current_role = sanitizedCurrentRole;

    // Get value proposition (generate if not exists)
    let valueProposition = employee.value_proposition;
    if (!valueProposition && employee.current_role && employee.target_role) {
      valueProposition = await valuePropositionService.getValueProposition(employeeId);
    }

    // Get relevance score from Skills Engine (with fallback to mock)
    let relevanceScoreData = null;
    try {
      const payload = {
        employee_id: employeeId,
        employee_type: employee.type,
        current_role: employee.current_role,
        target_role: employee.target_role,
        fields: ['relevance_score']
      };
      
      const response = await sendRequest('SkillsEngine', payload);
      
      if (response.payload) {
        const parsedPayload = typeof response.payload === 'string' 
          ? JSON.parse(response.payload) 
          : response.payload;
        
        if (parsedPayload.relevance_score) {
          relevanceScoreData = parsedPayload.relevance_score;
        } else if (parsedPayload.score !== undefined) {
          relevanceScoreData = parsedPayload;
        }
      }
    } catch (error) {
      console.warn('[ProfileController] Error fetching relevance score, using mock data:', error.message);
    }
    
    // Fallback to mock if no data received
    if (!relevanceScoreData) {
      relevanceScoreData = await mockSkillsEngineService.getRelevanceScore(
        employeeId,
        employee.current_role,
        employee.target_role
      );
    }
    const relevanceScore = relevanceScoreData?.score || null;

    // Get competencies/skills from Skills Engine (with fallback to mock)
    let competencies = null;
    try {
      const payload = {
        employee_id: employeeId,
        employee_type: employee.type,
        fields: ['competencies', 'normalized_skills']
      };
      
      const response = await sendRequest('SkillsEngine', payload);
      
      if (response.payload) {
        const parsedPayload = typeof response.payload === 'string' 
          ? JSON.parse(response.payload) 
          : response.payload;
        
        if (parsedPayload.competencies) {
          competencies = parsedPayload.competencies;
        } else if (parsedPayload.normalized_skills) {
          // Convert normalized_skills to competencies format if needed
          competencies = { competencies: parsedPayload.normalized_skills };
        }
      }
    } catch (error) {
      console.warn('[ProfileController] Error fetching competencies, using mock data:', error.message);
    }
    
    // Fallback to mock if no data received
    if (!competencies) {
      competencies = await mockSkillsEngineService.getNormalizedSkills(
        employeeId,
        employee.type
      );
    }

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
          role: sanitizedRole,
          profileStatus: employee.profile_status,
          companyId: employee.company_id
        },
        career: {
          currentRole: sanitizedCurrentRole,
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
  // Use microserviceIntegrationService with fallback to mock data
  try {
    const payload = {
      learner_id: employeeId,
      fields: ['completed_courses']
    };
    
    const response = await sendRequest('CourseBuilder', payload);
    
    // Parse response payload
    let courses = [];
    if (response.payload) {
      const parsedPayload = typeof response.payload === 'string' 
        ? JSON.parse(response.payload) 
        : response.payload;
      
      // Handle different response structures
      if (Array.isArray(parsedPayload)) {
        courses = parsedPayload;
      } else if (parsedPayload.completed_courses && Array.isArray(parsedPayload.completed_courses)) {
        courses = parsedPayload.completed_courses;
      } else if (parsedPayload.courses && Array.isArray(parsedPayload.courses)) {
        courses = parsedPayload.courses;
      }
    }
    
    // If using fallback, ensure courses have employee_id
    if (response.source && response.source.includes('fallback')) {
      courses = courses.map(course => ({
        ...course,
        learner_id: employeeId
      }));
    }
    
    return courses;
  } catch (error) {
    console.warn('[ProfileController] Error fetching completed courses, using mock data:', error.message);
    // Fallback to mock service
    return await mockCourseBuilderService.getCompletedCourses(employeeId);
  }
};

/**
 * Get team hierarchy for Team Leader
 * Returns teams and employees under the team leader
 */
const getTeamHierarchy = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get employee's team and verify they are a team manager
    const employeeResult = await query(
      `SELECT team_id, company_id, is_manager, manager_type, manager_of_id 
       FROM employees 
       WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const { team_id, company_id, is_manager, manager_type, manager_of_id } = employeeResult.rows[0];

    // Verify employee is a team manager
    if (!is_manager || manager_type !== 'team_manager') {
      return res.status(403).json({
        success: false,
        error: 'Employee is not a team manager'
      });
    }

    const effectiveTeamId = manager_of_id || team_id;

    if (!effectiveTeamId) {
      return res.json({
        success: true,
        data: {
          hierarchy: null,
          message: 'Employee is not assigned to a team'
        }
      });
    }
    
    // Verify manager_of_id matches team_id (if set)
    if (manager_of_id && team_id && manager_of_id !== team_id) {
      return res.status(403).json({
        success: false,
        error: 'Employee is not the manager of this team'
      });
    }

    // Get team details
    const teamResult = await query(
      `SELECT id, name, department_id, manager_id FROM teams WHERE id = $1`,
      [effectiveTeamId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    const team = teamResult.rows[0];
    
    // Verify employee is the manager of this team
    if (team.manager_id && team.manager_id !== employeeId) {
      return res.status(403).json({
        success: false,
        error: 'Employee is not the manager of this team'
      });
    }

    // Get all employees in the team
    const employeesResult = await query(
      `SELECT id, name, email, role, type, "current_role", target_role
       FROM employees 
       WHERE team_id = $1 AND company_id = $2
       ORDER BY name`,
      [team.id, company_id]
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

    // Get employee's department and verify they are a department manager
    const employeeResult = await query(
      `SELECT department_id, company_id, is_manager, manager_type, manager_of_id 
       FROM employees 
       WHERE id = $1`,
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const { department_id, company_id, is_manager, manager_type, manager_of_id } = employeeResult.rows[0];

    // Verify employee is a department manager
    if (!is_manager || manager_type !== 'dept_manager') {
      return res.status(403).json({
        success: false,
        error: 'Employee is not a department manager'
      });
    }

    const effectiveDepartmentId = manager_of_id || department_id;

    if (!effectiveDepartmentId) {
      return res.json({
        success: true,
        data: {
          hierarchy: null,
          message: 'Employee is not assigned to a department'
        }
      });
    }
    
    // Verify manager_of_id matches department_id (if set)
    if (manager_of_id && department_id && manager_of_id !== department_id) {
      return res.status(403).json({
        success: false,
        error: 'Employee is not the manager of this department'
      });
    }

    // Get department details - verify this employee is the manager
    const deptResult = await query(
      `SELECT id, name, manager_id FROM departments WHERE id = $1`,
      [effectiveDepartmentId]
    );

    if (deptResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    const department = deptResult.rows[0];
    
    // Verify employee is the manager of this department
    if (department.manager_id && department.manager_id !== employeeId) {
      return res.status(403).json({
        success: false,
        error: 'Employee is not the manager of this department'
      });
    }

    // Get all teams in the department
    const teamsResult = await query(
      `SELECT id, name FROM teams WHERE department_id = $1 ORDER BY name`,
      [department.id]
    );

    // Get all employees in teams within the department
    const teams = await Promise.all(
      teamsResult.rows.map(async (team) => {
        const employeesResult = await query(
          `SELECT id, name, email, role, type, "current_role", target_role
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
  // Use microserviceIntegrationService with fallback to mock data
  try {
    const payload = {
      learner_id: employeeId,
      fields: ['learning_courses']
    };
    
    const response = await sendRequest('CourseBuilder', payload);
    
    // Parse response payload
    let courses = [];
    if (response.payload) {
      const parsedPayload = typeof response.payload === 'string' 
        ? JSON.parse(response.payload) 
        : response.payload;
      
      if (Array.isArray(parsedPayload)) {
        courses = parsedPayload;
      } else if (parsedPayload.learning_courses && Array.isArray(parsedPayload.learning_courses)) {
        courses = parsedPayload.learning_courses;
      } else if (parsedPayload.courses && Array.isArray(parsedPayload.courses)) {
        courses = parsedPayload.courses;
      }
    }
    
    // If using fallback, ensure courses have employee_id
    if (response.source && response.source.includes('fallback')) {
      courses = courses.map(course => ({
        ...course,
        learner_id: employeeId
      }));
    }
    
    return courses;
  } catch (error) {
    console.warn('[ProfileController] Error fetching learning courses, using mock data:', error.message);
    return await mockCourseBuilderService.getLearningCourses(employeeId);
  }
};

const getAssignedCoursesFromAPI = async (employeeId) => {
  // Get from Course Builder
  // Use microserviceIntegrationService with fallback to mock data
  try {
    const payload = {
      learner_id: employeeId,
      fields: ['assigned_courses']
    };
    
    const response = await sendRequest('CourseBuilder', payload);
    
    // Parse response payload
    let courses = [];
    if (response.payload) {
      const parsedPayload = typeof response.payload === 'string' 
        ? JSON.parse(response.payload) 
        : response.payload;
      
      if (Array.isArray(parsedPayload)) {
        courses = parsedPayload;
      } else if (parsedPayload.assigned_courses && Array.isArray(parsedPayload.assigned_courses)) {
        courses = parsedPayload.assigned_courses;
      } else if (parsedPayload.courses && Array.isArray(parsedPayload.courses)) {
        courses = parsedPayload.courses;
      }
    }
    
    // If using fallback, ensure courses have employee_id
    if (response.source && response.source.includes('fallback')) {
      courses = courses.map(course => ({
        ...course,
        learner_id: employeeId
      }));
    }
    
    return courses;
  } catch (error) {
    console.warn('[ProfileController] Error fetching assigned courses, using mock data:', error.message);
    return await mockCourseBuilderService.getAssignedCourses(employeeId);
  }
};

const getTaughtCoursesFromAPI = async (employeeId) => {
  // Content Studio sends: course_id, course_name, trainer_id, trainer_name, status
  // Only fetch if employee is a trainer
  // Use microserviceIntegrationService with fallback to mock data
  
  // Check if employee is a trainer
  const employeeResult = await query(
    `SELECT type, name FROM employees WHERE id = $1`,
    [employeeId]
  );

  if (employeeResult.rows.length === 0 || 
      (employeeResult.rows[0].type !== 'internal_instructor' && 
       employeeResult.rows[0].type !== 'external_instructor')) {
    return []; // Not a trainer
  }

  try {
    const payload = {
      trainer_id: employeeId,
      fields: ['taught_courses']
    };
    
    const response = await sendRequest('ContentStudio', payload);
    
    // Parse response payload
    let courses = [];
    if (response.payload) {
      const parsedPayload = typeof response.payload === 'string' 
        ? JSON.parse(response.payload) 
        : response.payload;
      
      if (Array.isArray(parsedPayload)) {
        courses = parsedPayload;
      } else if (parsedPayload.taught_courses && Array.isArray(parsedPayload.taught_courses)) {
        courses = parsedPayload.taught_courses;
      } else if (parsedPayload.courses && Array.isArray(parsedPayload.courses)) {
        courses = parsedPayload.courses;
      }
    }
    
    // If using fallback, ensure courses have trainer_id and trainer_name
    if (response.source && response.source.includes('fallback')) {
      courses = courses.map(course => ({
        ...course,
        trainer_id: employeeId,
        trainer_name: employeeResult.rows[0].name
      }));
    } else {
      // Ensure trainer_name is set even from real API
      courses = courses.map(course => ({
        ...course,
        trainer_name: course.trainer_name || employeeResult.rows[0].name
      }));
    }
    
    return courses;
  } catch (error) {
    console.warn('[ProfileController] Error fetching taught courses, using mock data:', error.message);
    const mockCourses = await mockContentStudioService.getTaughtCourses(employeeId);
    // Update trainer_name with actual name
    return mockCourses.map(course => ({
      ...course,
      trainer_id: employeeId,
      trainer_name: employeeResult.rows[0].name
    }));
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

