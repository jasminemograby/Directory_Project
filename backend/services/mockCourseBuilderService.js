// Mock Course Builder Service - Returns course data
// This will be replaced with actual Course Builder API calls when ready

/**
 * Get completed courses for an employee (mock data)
 * Course Builder sends: feedback, course_id, course_name, learner_id
 */
const getCompletedCourses = async (employeeId) => {
  // Mock completed courses
  const mockCourses = [
    {
      course_id: 'course-1',
      course_name: 'Introduction to React',
      learner_id: employeeId,
      feedback: 'Great course! Learned a lot about React hooks and state management.',
      completed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      test_attempts: 2,
      final_grade: 85
    },
    {
      course_id: 'course-2',
      course_name: 'Advanced JavaScript',
      learner_id: employeeId,
      feedback: 'Excellent content. The async/await section was particularly helpful.',
      completed_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      test_attempts: 1,
      final_grade: 92
    },
    {
      course_id: 'course-3',
      course_name: 'Node.js Fundamentals',
      learner_id: employeeId,
      feedback: 'Good introduction to Node.js. Would like more advanced topics.',
      completed_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      test_attempts: 3,
      final_grade: 78
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return mockCourses;
};

/**
 * Get learning courses (currently in progress) for an employee
 */
const getLearningCourses = async (employeeId) => {
  // Mock learning courses
  const mockCourses = [
    {
      course_id: 'course-4',
      course_name: 'TypeScript Mastery',
      learner_id: employeeId,
      progress: 45,
      started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      last_accessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      course_id: 'course-5',
      course_name: 'Database Design',
      learner_id: employeeId,
      progress: 20,
      started_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      last_accessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return mockCourses;
};

/**
 * Get assigned courses (not yet started) for an employee
 */
const getAssignedCourses = async (employeeId) => {
  // Mock assigned courses
  const mockCourses = [
    {
      course_id: 'course-6',
      course_name: 'API Design Best Practices',
      learner_id: employeeId,
      assigned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      assigned_by: 'HR Manager',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    },
    {
      course_id: 'course-7',
      course_name: 'Security Fundamentals',
      learner_id: employeeId,
      assigned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      assigned_by: 'Department Manager',
      due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days from now
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return mockCourses;
};

module.exports = {
  getCompletedCourses,
  getLearningCourses,
  getAssignedCourses
};

