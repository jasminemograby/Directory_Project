// Profile Enrichment Service - Processes raw external data through Gemini AI
const { query } = require('../config/database');
const geminiService = require('./geminiService');

/**
 * Get raw external data for an employee (only unprocessed)
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<Object>} Combined raw data from all providers
 */
const getRawExternalData = async (employeeId) => {
  try {
    const result = await query(
      `SELECT provider, data, processed 
       FROM external_data_raw 
       WHERE employee_id = $1 AND processed = false
       ORDER BY fetched_at DESC`,
      [employeeId]
    );

    const rawData = {
      linkedin: null,
      github: null
    };

    result.rows.forEach(row => {
      try {
        const parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        rawData[row.provider] = parsedData;
      } catch (parseError) {
        console.error(`Error parsing ${row.provider} data for employee ${employeeId}:`, parseError.message);
      }
    });

    return rawData;
  } catch (error) {
    console.error('Error fetching raw external data:', error.message);
    throw error;
  }
};

/**
 * Get processed data for an employee
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<Object>} Processed data (bio, projects, skills)
 */
const getProcessedData = async (employeeId) => {
  try {
    // Get processed bio
    const processedResult = await query(
      `SELECT bio, processed_at 
       FROM external_data_processed 
       WHERE employee_id = $1`,
      [employeeId]
    );

    // Get projects
    const projectsResult = await query(
      `SELECT id, title, summary, source, created_at 
       FROM projects 
       WHERE employee_id = $1 
       ORDER BY created_at DESC`,
      [employeeId]
    );

    // Get skills (normalized from Skills Engine - will be added in F006)
    const skillsResult = await query(
      `SELECT id, skill_name, skill_type, source 
       FROM skills 
       WHERE employee_id = $1 
       ORDER BY created_at DESC`,
      [employeeId]
    );

    return {
      bio: processedResult.rows[0]?.bio || null,
      processedAt: processedResult.rows[0]?.processed_at || null,
      projects: projectsResult.rows.map(p => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        source: p.source,
        createdAt: p.created_at
      })),
      skills: skillsResult.rows.map(s => ({
        id: s.id,
        name: s.skill_name,
        type: s.skill_type,
        source: s.source
      }))
    };
  } catch (error) {
    console.error('Error fetching processed data:', error.message);
    throw error;
  }
};

/**
 * Enrich employee profile with AI-generated bio and projects
 * Process flow: Raw data → Gemini AI → Processed data → Mark as processed
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<Object>} Enriched profile data (bio and projects)
 */
const enrichProfile = async (employeeId) => {
  try {
    console.log(`[Enrichment] Starting profile enrichment for employee: ${employeeId}`);

    // Step 1: Get raw external data (only unprocessed)
    const rawData = await getRawExternalData(employeeId);

    // Check if we have any data to process
    const hasData = rawData.linkedin || rawData.github;
    if (!hasData) {
      console.log(`[Enrichment] No unprocessed raw data found for employee ${employeeId}`);
      return {
        bio: null,
        projects: [],
        skills: []
      };
    }

    console.log(`[Enrichment] Found raw data - LinkedIn: ${!!rawData.linkedin}, GitHub: ${!!rawData.github}`);

    // Step 2: Send to Gemini API securely (with input validation and sanitization)
    console.log(`[Enrichment] Sending data to Gemini API for processing...`);
    const [bio, projects] = await Promise.all([
      geminiService.generateBio(rawData),
      geminiService.identifyProjects(rawData)
    ]);

    console.log(`[Enrichment] Gemini processing complete - Bio: ${!!bio}, Projects: ${projects?.length || 0}`);

    // Step 3: Store processed data in external_data_processed table
    if (bio) {
      await query(
        `INSERT INTO external_data_processed (employee_id, bio, processed_at, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (employee_id) 
         DO UPDATE SET bio = $2, updated_at = CURRENT_TIMESTAMP, processed_at = CURRENT_TIMESTAMP`,
        [employeeId, bio]
      );
      console.log(`[Enrichment] Bio stored in external_data_processed`);
    }

    // Step 4: Store projects in projects table (cleaned and processed)
    if (projects && projects.length > 0) {
      // Delete existing projects from this enrichment source (to avoid duplicates)
      await query(
        `DELETE FROM projects WHERE employee_id = $1 AND source = 'gemini_ai'`,
        [employeeId]
      );

      // Insert new processed projects
      for (const project of projects) {
        // Sanitize project data (remove any potentially unsafe content)
        const cleanTitle = (project.title || '').trim().substring(0, 255);
        const cleanSummary = (project.summary || '').trim().substring(0, 5000);
        
        if (cleanTitle) {
          await query(
            `INSERT INTO projects (employee_id, title, summary, source, created_at)
             VALUES ($1, $2, $3, 'gemini_ai', CURRENT_TIMESTAMP)`,
            [employeeId, cleanTitle, cleanSummary]
          );
        }
      }
      console.log(`[Enrichment] ${projects.length} projects stored`);
    }

    // Step 5: Update employee profile with bio (for backward compatibility)
    if (bio) {
      await query(
        `UPDATE employees 
         SET bio = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [bio, employeeId]
      );
    }

    // Step 6: Mark raw data as processed (processed = true)
    await query(
      `UPDATE external_data_raw 
       SET processed = true, updated_at = CURRENT_TIMESTAMP 
       WHERE employee_id = $1 AND processed = false`,
      [employeeId]
    );
    console.log(`[Enrichment] Raw data marked as processed`);

    return {
      bio: bio || null,
      projects: projects || [],
      skills: [] // Skills will come from Skills Engine in F006
    };
  } catch (error) {
    console.error('[Enrichment] Error enriching profile:', error.message);
    throw error;
  }
};

/**
 * Check if employee has unprocessed external data
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<boolean>} True if unprocessed data exists
 */
const hasUnprocessedData = async (employeeId) => {
  try {
    const result = await query(
      `SELECT COUNT(*) as count 
       FROM external_data_raw 
       WHERE employee_id = $1 AND processed = false`,
      [employeeId]
    );

    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error('Error checking unprocessed data:', error.message);
    return false;
  }
};

module.exports = {
  getRawExternalData,
  getProcessedData,
  enrichProfile,
  hasUnprocessedData
};

