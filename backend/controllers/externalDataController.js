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
    // Get employeeId from multiple sources (fallback pattern)
    const employeeId = req.params.employeeId || 
                       req.query.employeeId || 
                       req.headers['x-employee-id'] ||
                       (req.user && req.user.employeeId) ||
                       (req.session && req.session.employeeId);
    
    const { mode } = req.query || {};
    
    console.log(`[LinkedIn Auth] Initiating OAuth - Request details:`, {
      employeeId,
      mode,
      paramsEmployeeId: req.params.employeeId,
      queryEmployeeId: req.query.employeeId,
      headerEmployeeId: req.headers['x-employee-id'],
      userEmployeeId: req.user?.employeeId,
      sessionEmployeeId: req.session?.employeeId,
      method: req.method,
      url: req.url,
      headers: Object.keys(req.headers)
    });
    
    if (!employeeId) {
      console.error('[LinkedIn Auth] ❌ No employee ID found in request');
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required. Please ensure you are logged in and the employee ID is provided.'
      });
    }

    // Verify employee exists
    const employeeResult = await query(
      'SELECT id, name, email FROM employees WHERE id = $1',
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      console.error(`[LinkedIn Auth] ❌ Employee not found: ${employeeId}`);
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    console.log(`[LinkedIn Auth] ✅ Employee verified: ${employeeResult.rows[0].name} (${employeeResult.rows[0].email})`);

    // Check if there's an existing token - if so, disconnect first to ensure fresh OAuth
    const existingToken = await query(
      `SELECT id, provider FROM oauth_tokens WHERE employee_id = $1 AND provider = 'linkedin'`,
      [employeeId]
    );
    
    if (existingToken.rows.length > 0) {
      console.log(`[LinkedIn Auth] Found existing token for employee ${employeeId}, deleting to force fresh OAuth`);
      await query(
        `DELETE FROM oauth_tokens WHERE employee_id = $1 AND provider = 'linkedin'`,
        [employeeId]
      );
      // Also delete raw data to ensure fresh fetch
      await query(
        `DELETE FROM external_data_raw WHERE employee_id = $1 AND provider = 'linkedin'`,
        [employeeId]
      );
      console.log(`[LinkedIn Auth] ✅ Existing token and raw data deleted`);
    }
    
    // Generate authorization URL
    const authUrl = linkedInService.getAuthorizationUrl(employeeId);
    console.log(`[LinkedIn Auth] Generated auth URL: ${authUrl.substring(0, 150)}...`);
    console.log(`[LinkedIn Auth] Full redirect URI: ${process.env.LINKEDIN_REDIRECT_URI || 'using default'}`);
    
    // If mode=redirect (or Accept header prefers HTML), redirect immediately to LinkedIn
    const prefersRedirect = mode === 'redirect' || req.accepts(['html', 'json']) === 'html';
    console.log(`[LinkedIn Auth] Prefers redirect: ${prefersRedirect} (mode=${mode}, accepts=${req.accepts(['html', 'json'])})`);
    
    if (prefersRedirect) {
      console.log(`[LinkedIn Auth] Redirecting to LinkedIn OAuth: ${authUrl}`);
      return res.redirect(authUrl);
    }
    
    res.json({
      success: true,
      data: {
        authorization_url: authUrl,
        employee_id: employeeId
      }
    });
  } catch (error) {
    console.error('[LinkedIn Auth] Error initiating LinkedIn auth:', error.message);
    console.error('[LinkedIn Auth] Error stack:', error.stack);
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
      
      // Check if both LinkedIn and GitHub are connected - if so, trigger enrichment
      const tokensCheck = await query(
        `SELECT provider FROM oauth_tokens WHERE employee_id = $1 AND provider IN ('linkedin', 'github')`,
        [employeeId]
      );
      const hasLinkedIn = tokensCheck.rows.some(r => r.provider === 'linkedin');
      const hasGitHub = tokensCheck.rows.some(r => r.provider === 'github');
      
      if (hasLinkedIn && hasGitHub) {
        console.log(`[LinkedIn Callback] Both LinkedIn and GitHub connected - triggering automatic enrichment`);
        try {
          const profileEnrichmentService = require('../services/profileEnrichmentService');
          await profileEnrichmentService.enrichProfile(employeeId);
          console.log(`[LinkedIn Callback] ✅ Automatic enrichment completed`);
        } catch (enrichError) {
          console.warn('[LinkedIn Callback] ⚠️ Enrichment failed (non-critical):', enrichError.message);
        }
      }
    } catch (fetchError) {
      console.warn('[LinkedIn Callback] ⚠️ Failed to fetch LinkedIn data automatically (non-critical):', fetchError.message);
      // Don't fail the callback if data fetch fails - user can fetch manually later
    }

    // Redirect to frontend success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/profile/${employeeId}?linkedin=connected`;
    console.log(`[LinkedIn Callback] Redirecting to: ${redirectUrl}`);
    res.redirect(redirectUrl);
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
    const { mode } = req.query || {};
    
    console.log(`[GitHub Auth] Initiating OAuth for employee: ${employeeId}, mode: ${mode}`);
    
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

    // Check if there's an existing token - if so, disconnect first to ensure fresh OAuth
    const existingToken = await query(
      `SELECT id, provider FROM oauth_tokens WHERE employee_id = $1 AND provider = 'github'`,
      [employeeId]
    );
    
    if (existingToken.rows.length > 0) {
      console.log(`[GitHub Auth] Found existing token for employee ${employeeId}, deleting to force fresh OAuth`);
      await query(
        `DELETE FROM oauth_tokens WHERE employee_id = $1 AND provider = 'github'`,
        [employeeId]
      );
      // Also delete raw data to ensure fresh fetch
      await query(
        `DELETE FROM external_data_raw WHERE employee_id = $1 AND provider = 'github'`,
        [employeeId]
      );
      console.log(`[GitHub Auth] ✅ Existing token and raw data deleted`);
    }

    // Build base URL dynamically for redirect URI fallback (works across environments)
    const requestBaseUrl = `${req.protocol}://${req.get('host')}`;
    console.log(`[GitHub Auth] Request base URL: ${requestBaseUrl}`);

    // Generate authorization URL
    const authUrl = githubService.getAuthorizationUrl(employeeId, {
      baseUrl: requestBaseUrl
    });
    console.log(`[GitHub Auth] Generated auth URL: ${authUrl.substring(0, 150)}...`);

    // If mode=redirect (or Accept header prefers HTML), redirect immediately to GitHub
    const prefersRedirect = mode === 'redirect' || req.accepts(['html', 'json']) === 'html';
    console.log(`[GitHub Auth] Prefers redirect: ${prefersRedirect} (mode=${mode}, accepts=${req.accepts(['html', 'json'])})`);
    
    if (prefersRedirect) {
      console.log(`[GitHub Auth] Redirecting to GitHub OAuth: ${authUrl}`);
      return res.redirect(authUrl);
    }
    
    res.json({
      success: true,
      data: {
        authorization_url: authUrl,
        employee_id: employeeId
      }
    });
  } catch (error) {
    console.error('[GitHub Auth] Error initiating GitHub auth:', error.message);
    console.error('[GitHub Auth] Error stack:', error.stack);
    if (error.message && error.message.includes('GitHub Client ID not configured')) {
      return res.status(503).json({
        success: false,
        error: 'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in the backend environment.'
      });
    }
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

    // Check if there's an existing token - if so, disconnect first to ensure fresh OAuth
    const existingToken = await query(
      `SELECT id, provider FROM oauth_tokens WHERE employee_id = $1 AND provider = 'github'`,
      [employeeId]
    );
    
    if (existingToken.rows.length > 0) {
      console.log(`[GitHub Callback] Found existing token for employee ${employeeId}, deleting to force fresh OAuth`);
      await query(
        `DELETE FROM oauth_tokens WHERE employee_id = $1 AND provider = 'github'`,
        [employeeId]
      );
      // Also delete raw data to ensure fresh fetch
      await query(
        `DELETE FROM external_data_raw WHERE employee_id = $1 AND provider = 'github'`,
        [employeeId]
      );
      console.log(`[GitHub Callback] ✅ Existing token and raw data deleted`);
    }

    // Exchange code for token
    await githubService.exchangeCodeForToken(code, employeeId);
    console.log(`[GitHub Callback] ✅ Token exchange successful for employee: ${employeeId}`);

    // Automatically fetch GitHub data after successful token exchange
    try {
      console.log(`[GitHub Callback] Automatically fetching GitHub profile data for employee: ${employeeId}`);
      await githubService.fetchProfileData(employeeId);
      console.log(`[GitHub Callback] ✅ GitHub data fetched and stored successfully`);
      
      // Check if both LinkedIn and GitHub are connected - if so, trigger enrichment
      const tokensCheck = await query(
        `SELECT provider FROM oauth_tokens WHERE employee_id = $1 AND provider IN ('linkedin', 'github')`,
        [employeeId]
      );
      const hasLinkedIn = tokensCheck.rows.some(r => r.provider === 'linkedin');
      const hasGitHub = tokensCheck.rows.some(r => r.provider === 'github');
      
      if (hasLinkedIn && hasGitHub) {
        console.log(`[GitHub Callback] Both LinkedIn and GitHub connected - triggering automatic enrichment`);
        try {
          const profileEnrichmentService = require('../services/profileEnrichmentService');
          await profileEnrichmentService.enrichProfile(employeeId);
          console.log(`[GitHub Callback] ✅ Automatic enrichment completed`);
        } catch (enrichError) {
          console.warn('[GitHub Callback] ⚠️ Enrichment failed (non-critical):', enrichError.message);
        }
      }
    } catch (fetchError) {
      console.warn('[GitHub Callback] ⚠️ Failed to fetch GitHub data automatically (non-critical):', fetchError.message);
      // Don't fail the callback if data fetch fails - user can fetch manually later
    }

    // Redirect to frontend success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/profile/${employeeId}?github=connected`;
    console.log(`[GitHub Callback] Redirecting to: ${redirectUrl}`);
    res.redirect(redirectUrl);
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
    // Check if we have raw data (either from current fetch OR already stored)
    let enrichmentResult = null;
    const hasRawData = results.linkedin || results.github;
    
    // Also check if there's unprocessed raw data already in the database
    const rawDataCheck = await query(
      `SELECT COUNT(*) as count 
       FROM external_data_raw 
       WHERE employee_id = $1 AND processed = false`,
      [employeeId]
    );
    const hasUnprocessedRawData = parseInt(rawDataCheck.rows[0].count, 10) > 0;
    
    if (hasRawData || hasUnprocessedRawData) {
      try {
        console.log(`[Collect] Starting automatic Gemini enrichment for employee: ${employeeId}`);
        console.log(`[Collect] Has raw data from fetch: ${hasRawData}, Has unprocessed raw data in DB: ${hasUnprocessedRawData}`);
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
      console.log('[Collect] ⚠️ No data to enrich (no LinkedIn or GitHub data fetched or stored)');
    }

    res.json({
      success: true,
      data: results,
      enrichment: enrichmentResult,
      message: enrichmentResult && !enrichmentResult.error 
        ? 'Profile enriched successfully. Waiting for HR approval.'
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

    console.log(`[Disconnect] Disconnecting ${provider} for employee: ${employeeId}`);

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

    console.log(`[Disconnect] Token deletion result: ${deleteResult.rows.length} row(s) deleted`);

    // Also delete raw data to ensure fresh fetch on reconnect
    const rawDataDeleteResult = await query(
      `DELETE FROM external_data_raw 
       WHERE employee_id = $1 AND provider = $2
       RETURNING id`,
      [employeeId, provider]
    );

    console.log(`[Disconnect] Raw data deletion result: ${rawDataDeleteResult.rows.length} row(s) deleted`);

    // Also delete processed data to ensure fresh enrichment
    const processedDataDeleteResult = await query(
      `DELETE FROM external_data_processed 
       WHERE employee_id = $1
       RETURNING id`,
      [employeeId]
    );

    console.log(`[Disconnect] Processed data deletion result: ${processedDataDeleteResult.rows.length} row(s) deleted`);

    // Also delete projects from this provider
    const projectsDeleteResult = await query(
      `DELETE FROM projects 
       WHERE employee_id = $1 AND source LIKE '%${provider}%'
       RETURNING id`,
      [employeeId]
    );

    console.log(`[Disconnect] Projects deletion result: ${projectsDeleteResult.rows.length} row(s) deleted`);

    if (deleteResult.rows.length === 0) {
      console.log(`[Disconnect] ⚠️ No token found, but continuing with cleanup`);
    }

    res.json({
      success: true,
      message: `${provider} disconnected successfully`,
      deleted: {
        tokens: deleteResult.rows.length,
        rawData: rawDataDeleteResult.rows.length,
        processedData: processedDataDeleteResult.rows.length,
        projects: projectsDeleteResult.rows.length
      }
    });
  } catch (error) {
    console.error('[Disconnect] ❌ Error disconnecting provider:', error.message);
    console.error('[Disconnect] Error stack:', error.stack);
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

