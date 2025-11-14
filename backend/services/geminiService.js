// Gemini AI Service for Profile Enrichment
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
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
        name: sanitizeInput(rawData.github.profile.name),
        login: sanitizeInput(rawData.github.profile.login),
        bio: sanitizeInput(rawData.github.profile.bio)
      } : null,
      repositories: (rawData.github.repositories || []).map(repo => ({
        name: sanitizeInput(repo.name),
        description: sanitizeInput(repo.description),
        language: sanitizeInput(repo.language)
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

    // Build context string
    let context = '';
    
    if (linkedInData.localizedFirstName || linkedInData.localizedLastName) {
      context += `Name: ${linkedInData.localizedFirstName || ''} ${linkedInData.localizedLastName || ''}\n`;
    }
    
    if (linkedInData.headline) {
      context += `Headline: ${linkedInData.headline}\n`;
    }
    
    if (linkedInData.summary) {
      context += `Summary: ${linkedInData.summary}\n`;
    }
    
    if (githubData.bio) {
      context += `GitHub Bio: ${githubData.bio}\n`;
    }
    
    if (githubRepos.length > 0) {
      context += `GitHub Repositories (${githubRepos.length}):\n`;
      githubRepos.slice(0, 10).forEach(repo => {
        context += `- ${repo.name}: ${repo.description || 'No description'}\n`;
      });
    }

    if (!context.trim()) {
      console.warn('No data available for bio generation');
      return null;
    }

    // Call Gemini API securely
    const prompt = `Based on the following professional information, generate a short, professional bio (2-3 sentences, maximum 200 words). Focus on professional experience, skills, and achievements. Write in a professional tone.

${context}

Generate only the bio text, without any additional commentary or labels.`;

    const response = await axios.post(
      `${GEMINI_API_BASE}/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
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
    const prompt = `Based on the following professional information, identify and summarize key projects. For each project, provide:
1. A clear project title
2. A brief summary (1-2 sentences, maximum 100 words)

Focus on significant projects, repositories, or work experiences that demonstrate skills and achievements.

${context}

Return the results as a JSON array of objects with "title" and "summary" fields. Example format:
[
  {"title": "Project Name", "summary": "Brief description"},
  {"title": "Another Project", "summary": "Brief description"}
]

Return ONLY the JSON array, no additional text.`;

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
    // Don't throw - return empty array for graceful degradation
    return [];
  }
};

module.exports = {
  generateBio,
  identifyProjects
};

