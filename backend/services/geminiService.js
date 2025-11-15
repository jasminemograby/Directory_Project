// Gemini AI Service for Profile Enrichment
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Use v1beta API for gemini-2.0-flash (tested and confirmed working)
// v1 API has gemini-2.5-flash, but v1beta has more options
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';
// Use gemini-2.0-flash (confirmed working with v1beta API)
// CRITICAL: If you have GEMINI_MODEL in Railway Variables, remove it or set it to 'gemini-2.0-flash'
// The old 'gemini-pro' model no longer exists and will cause 404 errors
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Log the actual model being used (for debugging)
console.log(`[Gemini] Initialized with model: ${GEMINI_MODEL}, API base: ${GEMINI_API_BASE}`);
if (process.env.GEMINI_MODEL) {
  console.log(`[Gemini] ⚠️  Using GEMINI_MODEL from environment: ${process.env.GEMINI_MODEL}`);
} else {
  console.log(`[Gemini] Using default model: ${GEMINI_MODEL}`);
}

// Check API key on startup
if (!GEMINI_API_KEY) {
  console.error('[Gemini] ⚠️  WARNING: GEMINI_API_KEY is not set! Gemini features will not work.');
} else {
  // Log first 10 chars of API key for verification (not the full key for security)
  const keyPreview = GEMINI_API_KEY.substring(0, 10) + '...';
  console.log(`[Gemini] API Key configured: ${keyPreview} (length: ${GEMINI_API_KEY.length})`);
}

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
 * Generate professional bio from raw external data or custom prompt
 * @param {Object} rawData - Combined raw data from LinkedIn and GitHub, OR object with customPrompt
 * @returns {Promise<string>} AI-generated short professional bio
 */
const generateBio = async (rawData) => {
  // Check if this is a custom prompt request (for value proposition)
  if (rawData && rawData.customPrompt) {
    return generateFromCustomPrompt(rawData.customPrompt);
  }
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
    
    // LinkedIn Work Experience (positions) - include detailed experience
    if (linkedInData.positions?.values && linkedInData.positions.values.length > 0) {
      context += `\nWork Experience:\n`;
      linkedInData.positions.values.forEach((pos, index) => {
        context += `${index + 1}. ${pos.title || 'Position'} at ${pos.companyName || 'Company'}`;
        if (pos.timePeriod) {
          context += ` (${pos.timePeriod.start?.year || ''} - ${pos.timePeriod.end?.year || 'Present'})`;
        }
        context += `\n`;
        if (pos.description) {
          context += `   Description: ${pos.description}\n`;
        }
        if (pos.location) {
          context += `   Location: ${pos.location}\n`;
        }
        context += `\n`;
      });
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
    // Improved prompt that includes work experience
    const prompt = `You are a professional bio writer. Based on the following information about a person, generate a short, professional bio (2-3 sentences, maximum 200 words).

IMPORTANT: 
- Include work experience from LinkedIn if available
- Highlight key achievements and professional background
- Even if the information is limited, create a professional bio based on what is available
- If there are no projects or repositories, focus on the person's profile information, work experience, or general professional presence

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
      const status = error.response.status;
      const errorData = error.response.data;
      console.error('[Gemini] API Error Status:', status);
      console.error('[Gemini] API Error Data:', JSON.stringify(errorData, null, 2));
      console.error('[Gemini] API URL:', error.config?.url);
      
      // For critical errors (quota, auth, etc.), throw to trigger fallback
      if (status === 429) {
        console.error('[Gemini] ❌ Quota exceeded (429) - will use fallback');
        throw new Error('Gemini API quota exceeded');
      } else if (status === 401 || status === 403) {
        console.error(`[Gemini] ❌ Authentication error (${status}) - check API key`);
        throw new Error(`Gemini API authentication failed: ${errorData?.error?.message || 'Invalid API key'}`);
      } else if (status >= 500) {
        console.error(`[Gemini] ❌ Server error (${status}) - will use fallback`);
        throw new Error(`Gemini API server error: ${status}`);
      }
    } else if (error.request) {
      console.error('[Gemini] ❌ No response from Gemini API - network error');
      throw new Error('Gemini API network error - no response received');
    }
    
    // For other errors, return null (graceful degradation)
    console.warn('[Gemini] ⚠️  Unknown error, returning null');
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

    // Build context - include all available data
    let context = '';
    let hasAnyData = false;
    
    if (linkedInData.positions?.values && linkedInData.positions.values.length > 0) {
      context += 'LinkedIn Positions:\n';
      linkedInData.positions.values.forEach(pos => {
        context += `- ${pos.title} at ${pos.companyName || 'Unknown'}: ${pos.description || 'No description'}\n`;
      });
      hasAnyData = true;
    }
    
    if (githubRepos.length > 0) {
      context += '\nGitHub Repositories:\n';
      githubRepos.slice(0, 20).forEach(repo => {
        context += `- ${repo.name}: ${repo.description || 'No description'} (${repo.language || 'Unknown language'}, ${repo.stargazers_count || 0} stars, ${repo.forks_count || 0} forks)\n`;
      });
      hasAnyData = true;
    }

    // Log what we're sending to Gemini
    console.log(`[Gemini] Context for project identification:`, {
      hasLinkedIn: !!rawData.linkedin,
      hasGitHub: !!rawData.github,
      reposCount: githubRepos.length,
      contextLength: context.length
    });

    if (!hasAnyData && !context.trim()) {
      console.warn('[Gemini] No data available for project identification');
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
1. A clear project title (short, descriptive)
2. A brief summary (1-2 sentences, maximum 100 words) that includes:
   - What the project does (one-line description)
   - Key technologies or skills used
   - Main achievements or impact (if available)

IMPORTANT:
- Extract projects from GitHub repositories (prioritize repositories with descriptions)
- Extract projects from LinkedIn work experience (if descriptions mention specific projects)
- For each project, provide a one-line summary that explains what it does
- Make summaries concise but informative

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
      const status = error.response.status;
      const errorData = error.response.data;
      console.error('[Gemini] API Error Status:', status);
      console.error('[Gemini] API Error Data:', JSON.stringify(errorData, null, 2));
      console.error('[Gemini] API URL:', error.config?.url);
      
      // For critical errors (quota, auth, etc.), throw to trigger fallback
      if (status === 429) {
        console.error('[Gemini] ❌ Quota exceeded (429) - will use fallback');
        throw new Error('Gemini API quota exceeded');
      } else if (status === 401 || status === 403) {
        console.error(`[Gemini] ❌ Authentication error (${status}) - check API key`);
        throw new Error(`Gemini API authentication failed: ${errorData?.error?.message || 'Invalid API key'}`);
      } else if (status >= 500) {
        console.error(`[Gemini] ❌ Server error (${status}) - will use fallback`);
        throw new Error(`Gemini API server error: ${status}`);
      }
    } else if (error.request) {
      console.error('[Gemini] ❌ No response from Gemini API - network error');
      throw new Error('Gemini API network error - no response received');
    }
    
    // For other errors, return empty array (graceful degradation)
    console.warn('[Gemini] ⚠️  Unknown error, returning empty array');
    return [];
  }
};

/**
 * Generate text from custom prompt (for value proposition, etc.)
 * @param {string} customPrompt - Custom prompt text
 * @returns {Promise<string>} AI-generated text
 */
const generateFromCustomPrompt = async (customPrompt) => {
  if (!GEMINI_API_KEY) {
    console.warn('[Gemini] API key not configured, skipping text generation');
    return null;
  }

  try {
    const sanitizedPrompt = sanitizeInput(customPrompt);

    console.log(`[Gemini] Calling API with custom prompt: ${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`);
    const response = await axios.post(
      `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: sanitizedPrompt
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
      const text = response.data.candidates[0].content.parts[0].text.trim();
      return sanitizeInput(text);
    }

    return null;
  } catch (error) {
    console.error('[Gemini] Error generating from custom prompt:', error.message);
    if (error.response) {
      console.error('[Gemini] API Error Status:', error.response.status);
      console.error('[Gemini] API Error Data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
};

module.exports = {
  generateBio,
  identifyProjects,
  generateFromCustomPrompt
};

