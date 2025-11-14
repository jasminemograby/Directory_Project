// LinkedIn OAuth and Data Collection Service
const axios = require('axios');
const { query } = require('../config/database');
const crypto = require('crypto');

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/external/linkedin/callback`;
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

/**
 * Generate OAuth authorization URL for LinkedIn
 * @param {string} employeeId - Employee UUID (will be encoded in state)
 * @param {string} state - Optional state parameter for CSRF protection
 * @returns {string} Authorization URL
 */
const getAuthorizationUrl = (employeeId, state = null) => {
  if (!LINKEDIN_CLIENT_ID) {
    throw new Error('LinkedIn Client ID not configured');
  }

  if (!employeeId) {
    throw new Error('Employee ID is required for OAuth flow');
  }

  // Encode employeeId in state for callback (base64 encode for safety)
  // Format: employeeId:randomHex (for CSRF protection)
  const randomHex = crypto.randomBytes(16).toString('hex');
  const stateParam = state || Buffer.from(`${employeeId}:${randomHex}`).toString('base64');
  
  // LinkedIn OAuth scopes - minimal permissions for profile data
  const scopes = [
    'r_liteprofile',      // Basic profile info (deprecated, but still used)
    'r_emailaddress',     // Email address
    'r_basicprofile',     // Basic profile
    'openid',             // OpenID Connect
    'profile',            // Profile information
    'email'               // Email address
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    state: stateParam,
    scope: scopes
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from LinkedIn
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<{access_token: string, refresh_token?: string, expires_in: number}>}
 */
const exchangeCodeForToken = async (code, employeeId) => {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    throw new Error('LinkedIn credentials not configured');
  }

  try {
    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000
      }
    );

    if (response.data && response.data.access_token) {
      // Store token in database
      const expiresAt = response.data.expires_in
        ? new Date(Date.now() + response.data.expires_in * 1000)
        : null;

      await query(
        `INSERT INTO oauth_tokens (employee_id, provider, access_token, refresh_token, token_type, expires_at, scope, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         ON CONFLICT (employee_id, provider) 
         DO UPDATE SET 
           access_token = EXCLUDED.access_token,
           refresh_token = EXCLUDED.refresh_token,
           token_type = EXCLUDED.token_type,
           expires_at = EXCLUDED.expires_at,
           scope = EXCLUDED.scope,
           updated_at = CURRENT_TIMESTAMP`,
        [
          employeeId,
          'linkedin',
          response.data.access_token,
          response.data.refresh_token || null,
          response.data.token_type || 'Bearer',
          expiresAt,
          response.data.scope || null
        ]
      );

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in
      };
    }

    throw new Error('Failed to get LinkedIn access token');
  } catch (error) {
    console.error('Error exchanging LinkedIn code for token:', error.message);
    if (error.response) {
      console.error('LinkedIn API error status:', error.response.status);
      console.error('LinkedIn API error data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

/**
 * Get valid access token for employee (refresh if needed)
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<string>} Valid access token
 */
const getValidAccessToken = async (employeeId) => {
  try {
    const result = await query(
      `SELECT access_token, refresh_token, expires_at 
       FROM oauth_tokens 
       WHERE employee_id = $1 AND provider = 'linkedin'`,
      [employeeId]
    );

    if (result.rows.length === 0) {
      throw new Error('No LinkedIn token found for employee');
    }

    const token = result.rows[0];
    const now = new Date();
    const expiresAt = token.expires_at ? new Date(token.expires_at) : null;

    // If token is still valid, return it
    if (!expiresAt || expiresAt > now) {
      return token.access_token;
    }

    // Token expired, try to refresh
    if (token.refresh_token) {
      return await refreshAccessToken(employeeId, token.refresh_token);
    }

    throw new Error('LinkedIn token expired and no refresh token available');
  } catch (error) {
    console.error('Error getting valid LinkedIn access token:', error.message);
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
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    throw new Error('LinkedIn credentials not configured');
  }

  try {
    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000
      }
    );

    if (response.data && response.data.access_token) {
      const expiresAt = response.data.expires_in
        ? new Date(Date.now() + response.data.expires_in * 1000)
        : null;

      await query(
        `UPDATE oauth_tokens 
         SET access_token = $1, 
             refresh_token = COALESCE($2, refresh_token),
             expires_at = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE employee_id = $4 AND provider = 'linkedin'`,
        [
          response.data.access_token,
          response.data.refresh_token || null,
          expiresAt,
          employeeId
        ]
      );

      return response.data.access_token;
    }

    throw new Error('Failed to refresh LinkedIn access token');
  } catch (error) {
    console.error('Error refreshing LinkedIn access token:', error.message);
    throw error;
  }
};

/**
 * Fetch LinkedIn profile data
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<Object>} LinkedIn profile data
 */
const fetchProfileData = async (employeeId) => {
  try {
    const accessToken = await getValidAccessToken(employeeId);

    // LinkedIn API v2 endpoints
    const [profileResponse, emailResponse] = await Promise.all([
      // Get basic profile
      axios.get(`${LINKEDIN_API_BASE}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }).catch(() => null), // Fallback if endpoint fails
      
      // Get email (if available)
      axios.get(`${LINKEDIN_API_BASE}/emailAddress?q=members&projection=(elements*(handle~))`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }).catch(() => null) // Optional, may not be available
    ]);

    const profileData = {
      provider: 'linkedin',
      fetched_at: new Date().toISOString(),
      profile: profileResponse?.data || null,
      email: emailResponse?.data || null
    };

    // Store raw data in database (per-user)
    console.log(`[LinkedIn] Storing raw data for employee: ${employeeId}`);
    
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
      [employeeId, 'linkedin', JSON.stringify(profileData)]
    );

    if (insertResult.rows.length > 0) {
      console.log(`[LinkedIn] ✅ Raw data stored for employee: ${employeeId}, record ID: ${insertResult.rows[0].id}`);
    } else {
      console.warn(`[LinkedIn] ⚠️ Raw data insert returned no rows for employee: ${employeeId}`);
    }

    return profileData;
  } catch (error) {
    console.error('Error fetching LinkedIn profile data:', error.message);
    // Don't throw - return empty data instead (graceful degradation)
    return {
      provider: 'linkedin',
      fetched_at: new Date().toISOString(),
      profile: null,
      email: null,
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

