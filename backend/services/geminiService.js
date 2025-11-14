// Gemini AI Service for Profile Enrichment
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Use v1 API (v1beta doesn't support gemini-1.5 models)
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1';
// Use gemini-1.5-pro or gemini-1.5-flash (gemini-pro is deprecated)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Sanitize input data to prevent injection attacks
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return '';
  // Remove potentially dangerous characters and limit length
  return text
    .replace(/[<>\"']/g, '') // Remove HTML/script tags
    .substring(0, 10000) // Limit length
    .trim();
};

/**
 * Validate and sanitize raw data before sending to Gemini
 * @param {Object} rawData - Raw data object
 * @returns {Object} Sanitized data
 */
const sanitizeRawData = (rawData) => {
  const sanitized = {};
  
  if (rawData.linkedin?.profile) {
    const linkedIn = rawData.linkedin.profile;
    sanitized.linkedin = {
      profile: {
        localizedFirstName: sanitizeInput(linkedIn.localizedFirstName),
        localizedLastName: sanitizeInput(linkedIn.localizedLastName),
        headline: sanitizeInput(linkedIn.headline),
        summary: sanitizeInput(linkedIn.summary),
        positions: linkedIn.positions?.values?.map(pos => ({
          title: sanitizeInput(pos.title),
          companyName: sanitizeInput(pos.companyName),
          description: sanitizeInput(pos.description)
        })) || []
      }
    };
  }
  
  if (rawData.github?.profile || rawData.github?.repositories) {
    sanitized.github = {
      profile: rawData.github.profile ? {
        name: sanitizeInput(rawData.github.profile.name || ''),
        login: sanitizeInput(rawData.github.profile.login || ''),
        bio: sanitizeInput(rawData.github.profile.bio || ''),
        company: sanitizeInput(rawData.github.profile.company || ''),
        location: sanitizeInput(rawData.github.profile.location || ''),
        blog: sanitizeInput(rawData.github.profile.blog || ''),
        public_repos: rawData.github.profile.public_repos || 0,
        followers: rawData.github.profile.followers || 0,
        following: rawData.github.profile.following || 0
      } : null,
      repositories: (rawData.github.repositories || []).map(repo => ({
        name: sanitizeInput(repo.name || ''),
        description: sanitizeInput(repo.description || ''),
        language: sanitizeInput(repo.language || ''),
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        created_at: repo.created_at || '',
        updated_at: repo.updated_at || ''
      })).slice(0, 20) // Limit to 20 repos for security
    };
  }
  
  return sanitized;
};

/**
 * Generate professional bio from raw external data
 * @param {Object} rawData - Combined raw data from LinkedIn and GitHub
 * @returns {Promise<string>} AI-generated short professional bio
 */
const generateBio = async (rawData) => {
  if (!GEMINI_API_KEY) {
    console.warn('[Gemini] API key not configured, skipping bio generation');
    return null;
  }

  try {
    // Sanitize input data for security
    const sanitizedData = sanitizeRawData(rawData);
    
    // Prepare context from sanitized raw data
    const linkedInData = sanitizedData.linkedin?.profile || {};
    const githubData = sanitizedData.github?.profile || {};
    const githubRepos = sanitizedData.github?.repositories || [];

    // Build context string - include all available data, even if minimal
    let context = '';
    let hasAnyData = false;
    
    if (linkedInData.localizedFirstName || linkedInData.localizedLastName) {
      context += `Name: ${linkedInData.localizedFirstName || ''} ${linkedInData.localizedLastName || ''}\n`;
      hasAnyData = true;
    }
    
    if (linkedInData.headline) {
      context += `Headline: ${linkedInData.headline}\n`;
      hasAnyData = true;
    }
    
    if (linkedInData.summary) {
      context += `Summary: ${linkedInData.summary}\n`;
      hasAnyData = true;
    }
    
    // GitHub profile data - include all available fields
    if (githubData.name) {
      context += `GitHub Name: ${githubData.name}\n`;
      hasAnyData = true;
    }
    
    if (githubData.login) {
      context += `GitHub Username: ${githubData.login}\n`;
      hasAnyData = true;
    }
    
    if (githubData.bio) {
      context += `GitHub Bio: ${githubData.bio}\n`;
      hasAnyData = true;
    }
    
    if (githubData.company) {
      context += `GitHub Company: ${githubData.company}\n`;
      hasAnyData = true;
    }
    
    if (githubData.location) {
      context += `GitHub Location: ${githubData.location}\n`;
      hasAnyData = true;
    }
    
    if (githubData.public_repos !== undefined) {
      context += `GitHub Public Repositories: ${githubData.public_repos}\n`;
      hasAnyData = true;
    }
    
    // GitHub repositories - include more details
    if (githubRepos.length > 0) {
      context += `GitHub Repositories (${githubRepos.length}):\n`;
      githubRepos.slice(0, 10).forEach(repo => {
        context += `- ${repo.name}: ${repo.description || 'No description'} (${repo.language || 'No language'}, ${repo.stargazers_count || 0} stars, ${repo.forks_count || 0} forks)\n`;
      });
      hasAnyData = true;
    } else if (githubData.public_repos === 0) {
      // User has GitHub account but no public repos
      context += `GitHub: User has a GitHub account with 0 public repositories.\n`;
      hasAnyData = true;
    }

    // Log what we're sending to Gemini
    console.log(`[Gemini] Context for bio generation:`, {
      hasLinkedIn: !!rawData.linkedin,
      hasGitHub: !!rawData.github,
      githubName: githubData.name,
      githubLogin: githubData.login,
      githubBio: githubData.bio,
      reposCount: githubRepos.length,
      contextLength: context.length
    });

    if (!hasAnyData && !context.trim()) {
      console.warn('[Gemini] No data available for bio generation');
      return null;
    }

    // Call Gemini API securely
    // Improved prompt that works even with minimal data
    const prompt = `You are a professional bio writer. Based on the following information about a person, generate a short, professional bio (2-3 sentences, maximum 200 words).

IMPORTANT: Even if the information is limited, create a professional bio based on what is available. If there are no projects or repositories, focus on the person's profile information, username, or general professional presence.

Information available:
${context}

Generate a professional bio that:
- Is 2-3 sentences long
- Uses a professional, friendly tone
- Highlights any available professional information, skills, or interests
- If information is limited, create a general professional bio based on the username/profile
- Does NOT include phrases like "limited information" or "not much data available"

Generate ONLY the bio text, without any additional commentary, labels, or explanations.`;

    console.log(`[Gemini] Calling API: ${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`);
    const response = await axios.post(
      `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: sanitizeInput(prompt) // Sanitize prompt itself
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const bio = response.data.candidates[0].content.parts[0].text.trim();
      // Sanitize output before returning
      return sanitizeInput(bio);
    }

    // Check for safety blocks
    if (response.data?.candidates?.[0]?.safetyRatings) {
      const blocked = response.data.candidates[0].safetyRatings.some(
        rating => rating.blocked === true
      );
      if (blocked) {
        console.warn('[Gemini] Bio generation blocked due to safety concerns');
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('[Gemini] Error generating bio:', error.message);
    if (error.response) {
      console.error('[Gemini] API Error Status:', error.response.status);
      console.error('[Gemini] API Error Data:', JSON.stringify(error.response.data, null, 2));
      console.error('[Gemini] API URL:', error.config?.url);
    }
    // Don't throw - return null for graceful degradation
    return null;
  }
};

/**
 * Identify and summarize projects from raw external data
 * @param {Object} rawData - Combined raw data from LinkedIn and GitHub
 * @returns {Promise<Array>} Array of project objects with title and summary
 */
const identifyProjects = async (rawData) => {
  if (!GEMINI_API_KEY) {
    console.warn('[Gemini] API key not configured, skipping project identification');
    return [];
  }

  try {
    // Sanitize input data for security
    const sanitizedData = sanitizeRawData(rawData);
    
    const linkedInData = sanitizedData.linkedin?.profile || {};
    const githubRepos = sanitizedData.github?.repositories || [];

    // Build context
    let context = '';
    
    if (linkedInData.positions?.values) {
      context += 'LinkedIn Positions:\n';
      linkedInData.positions.values.forEach(pos => {
        context += `- ${pos.title} at ${pos.companyName || 'Unknown'}: ${pos.description || 'No description'}\n`;
      });
    }
    
    if (githubRepos.length > 0) {
      context += '\nGitHub Repositories:\n';
      githubRepos.slice(0, 20).forEach(repo => {
        context += `- ${repo.name}: ${repo.description || 'No description'} (${repo.language || 'Unknown language'})\n`;
      });
    }

    if (!context.trim()) {
      console.warn('No data available for project identification');
      return [];
    }

    // Call Gemini API securely
    // Improved prompt that works even with minimal data
    const prompt = `You are a project analyst. Based on the following professional information, identify and summarize key projects, repositories, or work experiences.

IMPORTANT: 
- If there are GitHub repositories, analyze them and create project summaries
- If there are LinkedIn positions, extract projects from work experience
- If information is limited, create 1-2 general project summaries based on available data
- Even if there are no repositories, you can create a project summary based on the profile information

For each project, provide:
1. A clear project title
2. A brief summary (1-2 sentences, maximum 100 words)

Information available:
${context}

Return the results as a JSON array of objects with "title" and "summary" fields. 
- If you find projects/repositories, create summaries for them
- If information is limited, create 1-2 general professional projects based on the profile
- Minimum: 1 project, Maximum: 10 projects

Example format:
[
  {"title": "Project Name", "summary": "Brief description"},
  {"title": "Another Project", "summary": "Brief description"}
]

Return ONLY the JSON array, no additional text or explanations.`;

    const response = await axios.post(
      `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: sanitizeInput(prompt) // Sanitize prompt itself
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = response.data.candidates[0].content.parts[0].text.trim();
      
      // Try to extract JSON from response (might have markdown code blocks)
      let jsonText = text;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      try {
        const projects = JSON.parse(jsonText);
        if (Array.isArray(projects)) {
          // Sanitize each project before returning
          return projects
            .filter(p => p.title && p.summary)
            .map(p => ({
              title: sanitizeInput(p.title),
              summary: sanitizeInput(p.summary)
            }))
            .slice(0, 10); // Limit to 10 projects
        }
      } catch (parseError) {
        console.error('[Gemini] Error parsing projects response:', parseError.message);
        console.error('[Gemini] Response text:', text.substring(0, 500)); // Log only first 500 chars
      }
    }

    // Check for safety blocks
    if (response.data?.candidates?.[0]?.safetyRatings) {
      const blocked = response.data.candidates[0].safetyRatings.some(
        rating => rating.blocked === true
      );
      if (blocked) {
        console.warn('[Gemini] Project identification blocked due to safety concerns');
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error('[Gemini] Error identifying projects:', error.message);
    if (error.response) {
      console.error('[Gemini] API Error Status:', error.response.status);
      console.error('[Gemini] API Error Data:', JSON.stringify(error.response.data, null, 2));
      console.error('[Gemini] API URL:', error.config?.url);
    }
    // Don't throw - return empty array for graceful degradation
    return [];
  }
};

module.exports = {
  generateBio,
  identifyProjects
};

