// GitHub OAuth and Data Collection Service
const axios = require('axios');
const { query } = require('../config/database');
const crypto = require('crypto');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_API_BASE = 'https://api.github.com';

const resolveBackendBaseUrl = (overrideBaseUrl = null) => {
  if (overrideBaseUrl) {
    return overrideBaseUrl.replace(/\/$/, '');
  }

  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, '');
  }

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '');
  }

  return 'http://localhost:5000';
};

const resolveRedirectUri = (overrideBaseUrl = null) => {
  if (process.env.GITHUB_REDIRECT_URI) {
    return process.env.GITHUB_REDIRECT_URI;
  }

  const backendBaseUrl = resolveBackendBaseUrl(overrideBaseUrl);
  return `${backendBaseUrl}/api/external/github/callback`;
};

/**
 * Generate OAuth authorization URL for GitHub
 * @param {string} employeeId - Employee UUID (will be encoded in state)
 * @param {string} state - Optional state parameter for CSRF protection
 * @returns {string} Authorization URL
 */
const getAuthorizationUrl = (employeeId, options = {}) => {
  if (!GITHUB_CLIENT_ID) {
    throw new Error('GitHub Client ID not configured');
  }

  if (!employeeId) {
    throw new Error('Employee ID is required for OAuth flow');
  }

  // Encode employeeId in state for callback (base64 encode for safety)
  // Format: employeeId:randomHex (for CSRF protection)
  const randomHex = crypto.randomBytes(16).toString('hex');
  const stateParam = options.state || Buffer.from(`${employeeId}:${randomHex}`).toString('base64');

  const redirectUri = options.redirectUri || resolveRedirectUri(options.baseUrl);
  
  // GitHub OAuth scopes - minimal permissions for profile and public repo data
  const scopes = [
    'read:user',        // Read user profile
    'user:email',        // Read user email
    'public_repo'        // Read public repositories (optional, for project data)
  ].join(' ');

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    state: stateParam,
    scope: scopes
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from GitHub
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<{access_token: string, refresh_token?: string, expires_in?: number}>}
 */
const exchangeCodeForToken = async (code, employeeId) => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('GitHub credentials not configured');
  }

  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data && response.data.access_token) {
      // GitHub tokens don't expire by default, but can be set to expire
      // Store token in database
      const expiresAt = response.data.expires_in
        ? new Date(Date.now() + response.data.expires_in * 1000)
        : null;

      console.log(`[GitHub] Storing OAuth token for employee: ${employeeId}`);

      const result = await query(
        `INSERT INTO oauth_tokens (employee_id, provider, access_token, refresh_token, token_type, expires_at, scope, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         ON CONFLICT (employee_id, provider) 
         DO UPDATE SET 
           access_token = EXCLUDED.access_token,
           refresh_token = EXCLUDED.refresh_token,
           token_type = EXCLUDED.token_type,
           expires_at = EXCLUDED.expires_at,
           scope = EXCLUDED.scope,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id, employee_id, provider, created_at`,
        [
          employeeId,
          'github',
          response.data.access_token,
          response.data.refresh_token || null,
          response.data.token_type || 'Bearer',
          expiresAt,
          response.data.scope || null
        ]
      );

      if (result.rows.length > 0) {
        console.log(`[GitHub] ✅ Token stored successfully for employee: ${employeeId}, token ID: ${result.rows[0].id}`);
      } else {
        console.warn(`[GitHub] ⚠️ Token insert returned no rows for employee: ${employeeId}`);
      }

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in
      };
    }

    throw new Error('Failed to get GitHub access token');
  } catch (error) {
    console.error('Error exchanging GitHub code for token:', error.message);
    if (error.response) {
      console.error('GitHub API error status:', error.response.status);
      console.error('GitHub API error data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

/**
 * Get valid access token for employee
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<string>} Valid access token
 */
const getValidAccessToken = async (employeeId) => {
  try {
    const result = await query(
      `SELECT access_token, refresh_token, expires_at 
       FROM oauth_tokens 
       WHERE employee_id = $1 AND provider = 'github'`,
      [employeeId]
    );

    if (result.rows.length === 0) {
      throw new Error('No GitHub token found for employee');
    }

    const token = result.rows[0];
    const now = new Date();
    const expiresAt = token.expires_at ? new Date(token.expires_at) : null;

    // If token is still valid (or doesn't expire), return it
    if (!expiresAt || expiresAt > now) {
      return token.access_token;
    }

    // Token expired, try to refresh (if refresh token available)
    if (token.refresh_token) {
      return await refreshAccessToken(employeeId, token.refresh_token);
    }

    throw new Error('GitHub token expired and no refresh token available');
  } catch (error) {
    console.error('Error getting valid GitHub access token:', error.message);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 * @param {string} employeeId - Employee UUID
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<string>} New access token
 */
const refreshAccessToken = async (employeeId, refreshToken) => {
  // GitHub doesn't support refresh tokens in the same way as OAuth 2.0
  // For GitHub, tokens typically don't expire unless explicitly set
  // This is a placeholder for future implementation if needed
  throw new Error('GitHub token refresh not implemented - tokens typically do not expire');
};

/**
 * Fetch GitHub profile data
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<Object>} GitHub profile data
 */
const fetchProfileData = async (employeeId) => {
  try {
    const accessToken = await getValidAccessToken(employeeId);

    // GitHub API endpoints
    const [profileResponse, reposResponse, emailsResponse] = await Promise.all([
      // Get user profile
      axios.get(`${GITHUB_API_BASE}/user`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        timeout: 10000
      }).catch(() => null),
      
      // Get public repositories
      axios.get(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=10`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        timeout: 10000
      }).catch(() => null),
      
      // Get user emails
      axios.get(`${GITHUB_API_BASE}/user/emails`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        timeout: 10000
      }).catch(() => null)
    ]);

    const profileData = {
      provider: 'github',
      fetched_at: new Date().toISOString(),
      profile: profileResponse?.data || null,
      repositories: reposResponse?.data || null,
      emails: emailsResponse?.data || null
    };

    // Store raw data in database (per-user)
    console.log(`[GitHub] Storing raw data for employee: ${employeeId}`);
    
    const insertResult = await query(
      `INSERT INTO external_data_raw (employee_id, provider, data, fetched_at, processed, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, false, CURRENT_TIMESTAMP)
       ON CONFLICT (employee_id, provider) 
       DO UPDATE SET 
         data = EXCLUDED.data,
         fetched_at = EXCLUDED.fetched_at,
         processed = false,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, employee_id, provider, fetched_at`,
      [employeeId, 'github', JSON.stringify(profileData)]
    );

    if (insertResult.rows.length > 0) {
      console.log(`[GitHub] ✅ Raw data stored for employee: ${employeeId}, record ID: ${insertResult.rows[0].id}`);
    } else {
      console.warn(`[GitHub] ⚠️ Raw data insert returned no rows for employee: ${employeeId}`);
    }

    return profileData;
  } catch (error) {
    console.error('Error fetching GitHub profile data:', error.message);
    // Don't throw - return empty data instead (graceful degradation)
    return {
      provider: 'github',
      fetched_at: new Date().toISOString(),
      profile: null,
      repositories: null,
      emails: null,
      error: error.message
    };
  }
};

module.exports = {
  getAuthorizationUrl,
  exchangeCodeForToken,
  getValidAccessToken,
  refreshAccessToken,
  fetchProfileData
};

