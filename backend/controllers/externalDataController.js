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
    await linkedInService.exchangeCodeForToken(code, employeeId);

    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?linkedin=connected&employeeId=${employeeId}`);
  } catch (error) {
    console.error('Error handling LinkedIn callback:', error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?error=${encodeURIComponent(error.message)}`);
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

    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?github=connected&employeeId=${employeeId}`);
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

    // Check which external links exist for this employee
    const linksResult = await query(
      `SELECT link_type, url FROM external_data_links 
       WHERE employee_id = $1 AND link_type IN ('linkedin', 'github')`,
      [employeeId]
    );

    const results = {
      linkedin: null,
      github: null
    };

    // Fetch LinkedIn data if link exists
    const linkedInLink = linksResult.rows.find(r => r.link_type === 'linkedin');
    if (linkedInLink) {
      try {
        results.linkedin = await linkedInService.fetchProfileData(employeeId);
      } catch (error) {
        console.error('Error fetching LinkedIn data:', error.message);
        results.linkedin = { error: error.message };
      }
    }

    // Fetch GitHub data if link exists
    const githubLink = linksResult.rows.find(r => r.link_type === 'github');
    if (githubLink) {
      try {
        results.github = await githubService.fetchProfileData(employeeId);
      } catch (error) {
        console.error('Error fetching GitHub data:', error.message);
        results.github = { error: error.message };
      }
    }

    // Process data through Gemini AI (enrichment)
    let enrichmentResult = null;
    if (results.linkedin || results.github) {
      try {
        const profileEnrichmentService = require('../services/profileEnrichmentService');
        enrichmentResult = await profileEnrichmentService.enrichProfile(employeeId);
        console.log('[Collect] Profile enrichment completed');
      } catch (error) {
        console.error('[Collect] Error enriching profile:', error.message);
        // Don't fail the entire request if enrichment fails
        enrichmentResult = { error: error.message };
      }
    }

    res.json({
      success: true,
      data: results,
      enrichment: enrichmentResult
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

module.exports = {
  initiateLinkedInAuth,
  handleLinkedInCallback,
  fetchLinkedInData,
  initiateGitHubAuth,
  handleGitHubCallback,
  fetchGitHubData,
  collectAllData,
  getProcessedData
};

