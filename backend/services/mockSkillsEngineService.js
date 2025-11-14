// Mock Skills Engine Service - Returns structured competencies/skills
// This will be replaced with actual Skills Engine API calls when ready

/**
 * Get normalized skills for an employee (mock data)
 * Returns hierarchical structure: competencies -> nested competencies -> skills
 */
const getNormalizedSkills = async (employeeId, employeeType = 'regular') => {
  // Mock data structure based on employee type
  const mockSkills = {
    regular: {
      competencies: [
        {
          id: 'comp-1',
          name: 'Software Development',
          level: 'intermediate',
          verified: false,
          nestedCompetencies: [
            {
              id: 'nested-1',
              name: 'Frontend Development',
              level: 'intermediate',
              verified: false,
              skills: [
                { id: 'skill-1', name: 'React', level: 'intermediate', verified: false },
                { id: 'skill-2', name: 'JavaScript', level: 'advanced', verified: true },
                { id: 'skill-3', name: 'CSS', level: 'intermediate', verified: false }
              ]
            },
            {
              id: 'nested-2',
              name: 'Backend Development',
              level: 'beginner',
              verified: false,
              skills: [
                { id: 'skill-4', name: 'Node.js', level: 'beginner', verified: false },
                { id: 'skill-5', name: 'Express', level: 'beginner', verified: false }
              ]
            }
          ],
          skills: [
            { id: 'skill-6', name: 'Git', level: 'intermediate', verified: true },
            { id: 'skill-7', name: 'Agile', level: 'beginner', verified: false }
          ]
        },
        {
          id: 'comp-2',
          name: 'Quality Assurance',
          level: 'beginner',
          verified: false,
          nestedCompetencies: [],
          skills: [
            { id: 'skill-8', name: 'Manual Testing', level: 'beginner', verified: false },
            { id: 'skill-9', name: 'Test Planning', level: 'beginner', verified: false }
          ]
        }
      ]
    },
    trainer: {
      competencies: [
        {
          id: 'comp-3',
          name: 'Software Development',
          level: 'advanced',
          verified: true,
          nestedCompetencies: [
            {
              id: 'nested-3',
              name: 'Frontend Development',
              level: 'advanced',
              verified: true,
              skills: [
                { id: 'skill-10', name: 'React', level: 'advanced', verified: true },
                { id: 'skill-11', name: 'JavaScript', level: 'expert', verified: true },
                { id: 'skill-12', name: 'TypeScript', level: 'advanced', verified: true }
              ]
            }
          ],
          skills: [
            { id: 'skill-13', name: 'Git', level: 'advanced', verified: true },
            { id: 'skill-14', name: 'CI/CD', level: 'intermediate', verified: true }
          ]
        },
        {
          id: 'comp-4',
          name: 'Teaching & Training',
          level: 'intermediate',
          verified: true,
          nestedCompetencies: [],
          skills: [
            { id: 'skill-15', name: 'Course Design', level: 'intermediate', verified: true },
            { id: 'skill-16', name: 'Technical Training', level: 'intermediate', verified: true }
          ]
        }
      ]
    }
  };

  // Return skills based on employee type
  const skills = employeeType === 'internal_instructor' || employeeType === 'external_instructor' 
    ? mockSkills.trainer 
    : mockSkills.regular;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return skills;
};

/**
 * Get relevance score for an employee (mock data)
 * Relevance Score = required skills - current verified skills
 */
const getRelevanceScore = async (employeeId, currentRole, targetRole) => {
  // Mock relevance score calculation
  // In real implementation, this would come from Skills Engine
  const baseScore = 75; // Base score
  const randomVariation = Math.floor(Math.random() * 20) - 10; // ±10 variation
  
  const score = Math.max(0, Math.min(100, baseScore + randomVariation));
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  return {
    score: score,
    maxScore: 100,
    percentage: score,
    requiredSkills: 15,
    verifiedSkills: Math.floor(score / 100 * 15),
    missingSkills: Math.ceil((100 - score) / 100 * 15)
  };
};

/**
 * Request skill verification (mock - will be replaced with actual Skills Engine call)
 */
const requestSkillVerification = async (employeeId, skillIds) => {
  // Mock - in real implementation, this would trigger Skills Engine verification process
  console.log(`[MockSkillsEngine] Skill verification requested for employee ${employeeId}, skills:`, skillIds);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    verificationId: `verify-${Date.now()}`,
    message: 'Skill verification request submitted. Assessment will be sent shortly.'
  };
};

module.exports = {
  getNormalizedSkills,
  getRelevanceScore,
  requestSkillVerification
};

