// Mock Data Service - Provides mock data for features not yet integrated from other microservices

export const mockDataService = {
  // Mock employee profile data
  getEmployeeProfile: (employeeId) => ({
    currentRole: 'JavaScript Developer',
    targetRole: 'Senior Full-Stack Developer',
    valueProposition: 'Experienced JavaScript developer with strong foundation in modern web technologies, seeking to advance to senior full-stack role through continued learning and skill development.',
    relevanceScore: 75,
    competencies: [
      {
        name: 'Data Science',
        nested_competencies: [
          {
            name: 'Data Analysis',
            nested_competencies: [
              {
                name: 'Data Processing',
                skills: [
                  { name: 'Python', verified: false },
                  { name: 'SQL', verified: false }
                ]
              },
              {
                name: 'Data Visualization',
                skills: [
                  { name: 'Power BI', verified: false },
                  { name: 'Tableau', verified: false }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'Web Development',
        nested_competencies: [
          {
            name: 'Frontend',
            skills: [
              { name: 'React', verified: true },
              { name: 'JavaScript', verified: true },
              { name: 'TypeScript', verified: false }
            ]
          },
          {
            name: 'Backend',
            skills: [
              { name: 'Node.js', verified: true },
              { name: 'Express', verified: false }
            ]
          }
        ]
      }
    ],
    assignedCourses: [
      { name: 'Advanced React Patterns', description: 'Learn advanced React patterns and best practices' },
      { name: 'Node.js Best Practices', description: 'Master Node.js development patterns' }
    ],
    learningCourses: [
      { name: 'Full-Stack Development', progress: 65, description: 'Comprehensive full-stack course' }
    ],
    completedCourses: [
      { 
        name: 'JavaScript Fundamentals', 
        feedback: 'Excellent progress! Strong understanding of core concepts.',
        completedAt: '2024-10-15'
      }
    ]
  }),

  // Mock trainer data
  getTrainerProfile: (employeeId) => ({
    trainerStatus: 'Active',
    aiEnabled: true,
    publicPublishEnabled: false,
    coursesTaught: [
      { name: 'Introduction to React', students: 25, status: 'Active' },
      { name: 'JavaScript Basics', students: 40, status: 'Completed' }
    ]
  }),

  // Mock company data
  getCompanyProfile: (companyId) => ({
    name: 'Example Company',
    industry: 'Technology',
    departments: 3,
    teams: 8,
    employees: 45,
    autoApproval: false,
    decisionMakers: [
      { name: 'John Doe', email: 'john@example.com', role: 'CTO' }
    ]
  })
};

