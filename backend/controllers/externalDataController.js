// External Data Collection Controller
const linkedInService = require('../services/linkedInService');
const githubService = require('../services/githubService');
const { query } = require('../config/database');

/**
 * Initiate LinkedIn OAuth flow
 * GET /api/external/linkedin/authorize/:employeeId
 */
const initiateLinkedInAuth = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    // Verify employee exists
    const employeeResult = await query(
      'SELECT id, name, email FROM employees WHERE id = $1',
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Generate authorization URL
    const authUrl = linkedInService.getAuthorizationUrl(employeeId);
    
    res.json({
      success: true,
      data: {
        authorization_url: authUrl,
        employee_id: employeeId
      }
    });
  } catch (error) {
    console.error('Error initiating LinkedIn auth:', error.message);
    next(error);
  }
};

/**
 * Handle LinkedIn OAuth callback
 * GET /api/external/linkedin/callback?code=...&state=...
 */
const handleLinkedInCallback = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=missing_code`);
    }

    // Extract employee ID from state (state format: base64(employeeId:randomHex))
    let employeeId = null;
    if (state) {
      try {
        const decoded = Buffer.from(state, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        if (parts.length === 2) {
          employeeId = parts[0]; // First part is employeeId
        }
      } catch (error) {
        console.error('Error decoding state:', error.message);
      }
    }

    if (!employeeId) {
      console.error('[LinkedIn Callback] Invalid state - employeeId not found');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=invalid_state`);
    }

    console.log(`[LinkedIn Callback] Processing OAuth for employee: ${employeeId}`);

    // Exchange code for token
    try {
      await linkedInService.exchangeCodeForToken(code, employeeId);
      console.log(`[LinkedIn Callback] ✅ Token exchange successful for employee: ${employeeId}`);
    } catch (tokenError) {
      console.error('[LinkedIn Callback] ❌ Token exchange failed:', tokenError.message);
      if (tokenError.response) {
        console.error('[LinkedIn Callback] LinkedIn API response:', JSON.stringify(tokenError.response.data, null, 2));
      }
      throw tokenError; // Re-throw to be caught by outer catch
    }

    // Automatically fetch LinkedIn data after successful token exchange
    try {
      console.log(`[LinkedIn Callback] Automatically fetching LinkedIn profile data for employee: ${employeeId}`);
      await linkedInService.fetchProfileData(employeeId);
      console.log(`[LinkedIn Callback] ✅ LinkedIn data fetched and stored successfully`);
    } catch (fetchError) {
      console.warn('[LinkedIn Callback] ⚠️ Failed to fetch LinkedIn data automatically (non-critical):', fetchError.message);
      // Don't fail the callback if data fetch fails - user can fetch manually later
    }

    // Redirect to frontend success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log(`[LinkedIn Callback] Redirecting to: ${frontendUrl}/profile?linkedin=connected&employeeId=${employeeId}`);
    res.redirect(`${frontendUrl}/profile?linkedin=connected&employeeId=${employeeId}`);
  } catch (error) {
    console.error('[LinkedIn Callback] ❌ Error handling LinkedIn callback:', error.message);
    console.error('[LinkedIn Callback] Error stack:', error.stack);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const errorMessage = error.message || 'Unknown error occurred';
    res.redirect(`${frontendUrl}/profile?error=${encodeURIComponent(errorMessage)}`);
  }
};

/**
 * Fetch LinkedIn data for employee
 * GET /api/external/linkedin/data/:employeeId
 */
const fetchLinkedInData = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    const data = await linkedInService.fetchProfileData(employeeId);

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching LinkedIn data:', error.message);
    next(error);
  }
};

/**
 * Initiate GitHub OAuth flow
 * GET /api/external/github/authorize/:employeeId
 */
const initiateGitHubAuth = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    // Verify employee exists
    const employeeResult = await query(
      'SELECT id, name, email FROM employees WHERE id = $1',
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Generate authorization URL
    const authUrl = githubService.getAuthorizationUrl(employeeId);
    
    res.json({
      success: true,
      data: {
        authorization_url: authUrl,
        employee_id: employeeId
      }
    });
  } catch (error) {
    console.error('Error initiating GitHub auth:', error.message);
    next(error);
  }
};

/**
 * Handle GitHub OAuth callback
 * GET /api/external/github/callback?code=...&state=...
 */
const handleGitHubCallback = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=missing_code`);
    }

    // Extract employee ID from state (state format: base64(employeeId:randomHex))
    let employeeId = null;
    if (state) {
      try {
        const decoded = Buffer.from(state, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        if (parts.length === 2) {
          employeeId = parts[0]; // First part is employeeId
        }
      } catch (error) {
        console.error('Error decoding state:', error.message);
      }
    }

    if (!employeeId) {
      console.error('[GitHub Callback] Invalid state - employeeId not found');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=invalid_state`);
    }

    console.log(`[GitHub Callback] Processing OAuth for employee: ${employeeId}`);

    // Exchange code for token
    await githubService.exchangeCodeForToken(code, employeeId);
    console.log(`[GitHub Callback] ✅ Token exchange successful for employee: ${employeeId}`);

    // Automatically fetch GitHub data after successful token exchange
    try {
      console.log(`[GitHub Callback] Automatically fetching GitHub profile data for employee: ${employeeId}`);
      await githubService.fetchProfileData(employeeId);
      console.log(`[GitHub Callback] ✅ GitHub data fetched and stored successfully`);
    } catch (fetchError) {
      console.warn('[GitHub Callback] ⚠️ Failed to fetch GitHub data automatically (non-critical):', fetchError.message);
      // Don't fail the callback if data fetch fails - user can fetch manually later
    }

    // Redirect to frontend success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/profile?github=connected&employeeId=${employeeId}`);
  } catch (error) {
    console.error('Error handling GitHub callback:', error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Fetch GitHub data for employee
 * GET /api/external/github/data/:employeeId
 */
const fetchGitHubData = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    const data = await githubService.fetchProfileData(employeeId);

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching GitHub data:', error.message);
    next(error);
  }
};

/**
 * Collect all external data for employee and process through Gemini
 * POST /api/external/collect/:employeeId
 */
const collectAllData = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    // Check which OAuth tokens exist for this employee (not external_data_links)
    const tokensResult = await query(
      `SELECT provider FROM oauth_tokens 
       WHERE employee_id = $1 AND provider IN ('linkedin', 'github')`,
      [employeeId]
    );

    const results = {
      linkedin: null,
      github: null
    };

    // Fetch LinkedIn data if token exists
    const hasLinkedInToken = tokensResult.rows.some(r => r.provider === 'linkedin');
    if (hasLinkedInToken) {
      try {
        console.log(`[Collect] Fetching LinkedIn data for employee: ${employeeId}`);
        results.linkedin = await linkedInService.fetchProfileData(employeeId);
        console.log(`[Collect] LinkedIn data fetched successfully`);
      } catch (error) {
        console.error('[Collect] Error fetching LinkedIn data:', error.message);
        results.linkedin = { error: error.message };
      }
    } else {
      console.log(`[Collect] No LinkedIn token found for employee: ${employeeId}`);
    }

    // Fetch GitHub data if token exists
    const hasGitHubToken = tokensResult.rows.some(r => r.provider === 'github');
    if (hasGitHubToken) {
      try {
        console.log(`[Collect] Fetching GitHub data for employee: ${employeeId}`);
        results.github = await githubService.fetchProfileData(employeeId);
        console.log(`[Collect] GitHub data fetched successfully`);
      } catch (error) {
        console.error('[Collect] Error fetching GitHub data:', error.message);
        results.github = { error: error.message };
      }
    } else {
      console.log(`[Collect] No GitHub token found for employee: ${employeeId}`);
    }

    // Process data through Gemini AI (enrichment) - AUTOMATIC after connection
    let enrichmentResult = null;
    if (results.linkedin || results.github) {
      try {
        console.log(`[Collect] Starting automatic Gemini enrichment for employee: ${employeeId}`);
        const profileEnrichmentService = require('../services/profileEnrichmentService');
        enrichmentResult = await profileEnrichmentService.enrichProfile(employeeId);
        console.log('[Collect] ✅ Automatic profile enrichment completed:', {
          hasBio: !!enrichmentResult.bio,
          projectsCount: enrichmentResult.projects?.length || 0,
          skillsCount: enrichmentResult.skills?.length || 0,
          profileAutoApproved: true
        });
      } catch (error) {
        console.error('[Collect] ❌ Error enriching profile:', error.message);
        console.error('[Collect] Error stack:', error.stack);
        // Don't fail the entire request if enrichment fails
        enrichmentResult = { error: error.message };
      }
    } else {
      console.log('[Collect] ⚠️ No data to enrich (no LinkedIn or GitHub data fetched)');
    }

    res.json({
      success: true,
      data: results,
      enrichment: enrichmentResult,
      message: enrichmentResult && !enrichmentResult.error 
        ? 'Profile enriched and approved automatically. You can now view your complete profile.'
        : null
    });
  } catch (error) {
    console.error('Error collecting external data:', error.message);
    next(error);
  }
};

/**
 * Get processed profile data (bio, projects, skills)
 * GET /api/external/processed/:employeeId
 */
const getProcessedData = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    const profileEnrichmentService = require('../services/profileEnrichmentService');
    const processedData = await profileEnrichmentService.getProcessedData(employeeId);

    res.json({
      success: true,
      data: processedData
    });
  } catch (error) {
    console.error('Error fetching processed data:', error.message);
    next(error);
  }
};

/**
 * Check connection status for external providers (without fetching data)
 * GET /api/external/status/:employeeId
 */
const getConnectionStatus = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    // Check if tokens exist in database
    const tokensResult = await query(
      `SELECT provider, expires_at, created_at 
       FROM oauth_tokens 
       WHERE employee_id = $1 AND provider IN ('linkedin', 'github')
       ORDER BY provider`,
      [employeeId]
    );

    const status = {
      linkedin: false,
      github: false
    };

    const now = new Date();
    for (const row of tokensResult.rows) {
      const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
      // Token is valid if it doesn't expire or hasn't expired yet
      const isValid = !expiresAt || expiresAt > now;
      
      if (row.provider === 'linkedin') {
        status.linkedin = isValid;
      } else if (row.provider === 'github') {
        status.github = isValid;
      }
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error checking connection status:', error.message);
    next(error);
  }
};

/**
 * Disconnect external provider (delete token)
 * DELETE /api/external/disconnect/:employeeId/:provider
 */
const disconnectProvider = async (req, res, next) => {
  try {
    const { employeeId, provider } = req.params;

    if (!employeeId || !provider) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID and provider are required'
      });
    }

    if (!['linkedin', 'github'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider. Must be "linkedin" or "github"'
      });
    }

    // Delete token
    const deleteResult = await query(
      `DELETE FROM oauth_tokens 
       WHERE employee_id = $1 AND provider = $2
       RETURNING id`,
      [employeeId, provider]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No connection found for this provider'
      });
    }

    // Also delete raw data (optional - you might want to keep it)
    await query(
      `DELETE FROM external_data_raw 
       WHERE employee_id = $1 AND provider = $2`,
      [employeeId, provider]
    );

    res.json({
      success: true,
      message: `${provider} disconnected successfully`
    });
  } catch (error) {
    console.error('Error disconnecting provider:', error.message);
    next(error);
  }
};

module.exports = {
  initiateLinkedInAuth,
  handleLinkedInCallback,
  fetchLinkedInData,
  initiateGitHubAuth,
  handleGitHubCallback,
  fetchGitHubData,
  collectAllData,
  getProcessedData,
  getConnectionStatus,
  disconnectProvider
};

