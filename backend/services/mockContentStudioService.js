// Mock Content Studio Service - Returns trainer course data
// This will be replaced with actual Content Studio API calls when ready

/**
 * Get courses taught by a trainer (mock data)
 * Content Studio sends: course_id, course_name, trainer_id, trainer_name, status
 */
const getTaughtCourses = async (trainerId) => {
  // Mock taught courses
  const mockCourses = [
    {
      course_id: 'taught-1',
      course_name: 'React Fundamentals',
      trainer_id: trainerId,
      trainer_name: 'Trainer Name', // Will be replaced with actual name
      status: 'active',
      students_count: 25,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      last_updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
    },
    {
      course_id: 'taught-2',
      course_name: 'JavaScript Advanced Patterns',
      trainer_id: trainerId,
      trainer_name: 'Trainer Name',
      status: 'active',
      students_count: 18,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
      last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      course_id: 'taught-3',
      course_name: 'Node.js Backend Development',
      trainer_id: trainerId,
      trainer_name: 'Trainer Name',
      status: 'archived',
      students_count: 32,
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
      last_updated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return mockCourses;
};

module.exports = {
  getTaughtCourses
};

