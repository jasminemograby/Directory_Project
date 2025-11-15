// Profile Enrichment Service - Processes raw external data through Gemini AI
const { query, transaction } = require('../config/database');
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
 * Uses TRANSACTION to ensure atomicity - all operations succeed or all rollback
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<Object>} Enriched profile data (bio and projects)
 */
const enrichProfile = async (employeeId) => {
  try {
    console.log(`[Enrichment] Starting profile enrichment for employee: ${employeeId}`);

    // Step 1: Get raw external data (only unprocessed) - OUTSIDE transaction (read-only)
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

    // Step 2: Send to Gemini API securely (with input validation and sanitization) - OUTSIDE transaction
    console.log(`[Enrichment] Sending data to Gemini API for processing...`);
    let bio = null;
    let projects = [];
    
    try {
      [bio, projects] = await Promise.all([
        geminiService.generateBio(rawData),
        geminiService.identifyProjects(rawData)
      ]);
      console.log(`[Enrichment] Gemini processing complete - Bio: ${!!bio}, Projects: ${projects?.length || 0}`);
    } catch (geminiError) {
      console.error(`[Enrichment] ⚠️ Gemini API error (using fallback):`, geminiError.message);
      
      // Fallback: Generate basic bio and projects from raw data if Gemini fails
      if (geminiError.response?.status === 429 || geminiError.message?.includes('quota')) {
        console.log(`[Enrichment] Gemini quota exceeded - using fallback data extraction`);
      }
      
      // Extract basic bio from raw data
      // Try LinkedIn first (usually has better professional info)
      if (rawData.linkedin?.profile) {
        const linkedInProfile = rawData.linkedin.profile;
        const name = `${linkedInProfile.localizedFirstName || linkedInProfile.given_name || ''} ${linkedInProfile.localizedLastName || linkedInProfile.family_name || ''}`.trim();
        const headline = linkedInProfile.headline || '';
        const summary = linkedInProfile.summary || '';
        
        if (name || headline || summary) {
          bio = `${name ? `${name}. ` : ''}${headline ? `${headline}. ` : ''}${summary ? summary.substring(0, 200) : ''}`.trim();
        }
      }
      
      // If no LinkedIn bio, try GitHub
      if (!bio && rawData.github?.profile) {
        const githubProfile = rawData.github.profile;
        const name = githubProfile.name || githubProfile.login || '';
        const githubBio = githubProfile.bio || '';
        
        if (name || githubBio) {
          bio = `${name ? `${name}. ` : ''}${githubBio ? githubBio.substring(0, 200) : ''}`.trim();
        }
      }
      
      // If still no bio, create a minimal one from available data
      if (!bio) {
        if (rawData.linkedin?.profile?.name) {
          bio = `${rawData.linkedin.profile.name}. Professional profile.`;
        } else if (rawData.github?.profile?.login) {
          bio = `GitHub user: ${rawData.github.profile.login}. Technical professional.`;
        } else {
          bio = 'Professional profile information available.';
        }
        console.log(`[Enrichment] Created minimal fallback bio`);
      }
      
      // Extract basic projects from GitHub repos
      if (rawData.github?.repositories && Array.isArray(rawData.github.repositories)) {
        projects = rawData.github.repositories.slice(0, 5).map(repo => ({
          title: repo.name || 'Untitled Project',
          summary: repo.description || `GitHub repository: ${repo.name || 'Unknown'}`,
          source: 'github_fallback'
        }));
      }
      
      // If no projects from GitHub, try to extract from LinkedIn positions
      if (projects.length === 0 && rawData.linkedin?.profile?.positions?.values) {
        projects = rawData.linkedin.profile.positions.values.slice(0, 3).map(pos => ({
          title: pos.title || 'Professional Experience',
          summary: `${pos.title || ''} at ${pos.companyName || 'Company'}. ${pos.description || ''}`.substring(0, 500),
          source: 'linkedin_fallback'
        }));
      }
      
      console.log(`[Enrichment] Fallback data extraction complete - Bio: ${!!bio}, Projects: ${projects?.length || 0}`);
    }

    // Step 3-8: All database operations in TRANSACTION for atomicity
    const result = await transaction(async (client) => {
      // Step 3: Store processed data in external_data_processed table
      if (bio) {
        await client.query(
          `INSERT INTO external_data_processed (employee_id, bio, processed_at, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (employee_id) 
           DO UPDATE SET bio = $2, updated_at = CURRENT_TIMESTAMP, processed_at = CURRENT_TIMESTAMP`,
          [employeeId, bio]
        );
        console.log(`[Enrichment] Bio stored in external_data_processed`);
      }

      // Step 4: Store projects in projects table (cleaned and processed) - BATCH INSERT for efficiency
      if (projects && projects.length > 0) {
        // Determine source - if projects came from fallback (have source field), use it, otherwise use 'gemini_ai'
        // For fallback projects, we want to replace ALL fallback projects, not just from one source
        const projectSource = projects[0]?.source || 'gemini_ai';
        const isFallback = projectSource.includes('fallback');
        
        // Delete existing projects - if fallback, delete all fallback projects; otherwise delete only from this source
        if (isFallback) {
          await client.query(
            `DELETE FROM projects WHERE employee_id = $1 AND source LIKE '%fallback'`,
            [employeeId]
          );
        } else {
          await client.query(
            `DELETE FROM projects WHERE employee_id = $1 AND source = $2`,
            [employeeId, projectSource]
          );
        }

        // Batch insert projects for efficiency (instead of loop)
        const validProjects = projects
          .map(p => ({
            title: (p.title || '').trim().substring(0, 255),
            summary: (p.summary || '').trim().substring(0, 5000),
            source: p.source || projectSource
          }))
          .filter(p => p.title); // Only include projects with valid titles

        if (validProjects.length > 0) {
          // Use batch insert with VALUES clause - each project needs: employee_id, title, summary, source
          const values = validProjects.map((_, i) => {
            const baseIndex = i * 3 + 2; // Start from $2 (employeeId is $1)
            return `($1, $${baseIndex}, $${baseIndex + 1}, $${baseIndex + 2}, CURRENT_TIMESTAMP)`;
          }).join(', ');
          
          const params = [
            employeeId,
            ...validProjects.flatMap(p => [p.title, p.summary, p.source])
          ];

          await client.query(
            `INSERT INTO projects (employee_id, title, summary, source, created_at)
             VALUES ${values}`,
            params
          );
          console.log(`[Enrichment] ${validProjects.length} projects stored (batch insert, source: ${projectSource})`);
        }
      }

      // Step 5: Update employee profile with bio (for backward compatibility)
      if (bio) {
        await client.query(
          `UPDATE employees 
           SET bio = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [bio, employeeId]
        );
      }

      // Step 6: Mark raw data as processed (processed = true) - ALWAYS if we attempted processing
      // Even if bio/projects are empty, we mark as processed to avoid infinite retries
      // The fallback should have extracted something, but if not, we still mark as processed
      await client.query(
        `UPDATE external_data_raw 
         SET processed = true, updated_at = CURRENT_TIMESTAMP 
         WHERE employee_id = $1 AND processed = false`,
        [employeeId]
      );
      console.log(`[Enrichment] Raw data marked as processed (bio: ${!!bio}, projects: ${projects?.length || 0})`);

      // Step 8: Generate value proposition if current_role and target_role exist
      if (bio || (projects && projects.length > 0)) {
        const employeeCheck = await client.query(
          `SELECT "current_role", target_role FROM employees WHERE id = $1`,
          [employeeId]
        );
        
        if (employeeCheck.rows.length > 0) {
          const { current_role, target_role } = employeeCheck.rows[0];
          if (current_role && target_role) {
            try {
              const valuePropositionService = require('./valuePropositionService');
              const valueProposition = await valuePropositionService.generateValueProposition(
                employeeId,
                current_role,
                target_role
              );
              
              if (valueProposition) {
                await client.query(
                  `UPDATE employees SET value_proposition = $1 WHERE id = $2`,
                  [valueProposition, employeeId]
                );
                console.log(`[Enrichment] ✅ Value proposition generated and saved`);
              }
            } catch (vpError) {
              console.warn(`[Enrichment] ⚠️ Error generating value proposition (non-critical):`, vpError.message);
              // Don't fail enrichment if value proposition generation fails
            }
          }
        }
        
        // Step 9: Keep profile as 'pending' after enrichment - HR needs to approve
        // Profile status remains 'pending' until HR manually approves
        console.log(`[Enrichment] ✅ Profile enriched - status remains 'pending' for HR approval`);
      }

      return { bio, projects };
    });

    // Step 7: Send data to Skills Engine for normalization (if we have data) - OUTSIDE transaction (external API)
    let skillsEngineResult = null;
    if (bio || (projects && projects.length > 0)) {
      try {
        console.log(`[Enrichment] Sending data to Skills Engine for normalization...`);
        const microserviceIntegrationService = require('./microserviceIntegrationService');
        const employeeResult = await query(
          `SELECT type, "current_role", target_role FROM employees WHERE id = $1`,
          [employeeId]
        );
        
        if (employeeResult.rows.length > 0) {
          const employee = employeeResult.rows[0];
          const skillsEnginePayload = {
            employee_id: employeeId,
            employee_type: employee.type,
            raw_data: {
              linkedin: rawData.linkedin,
              github: rawData.github,
              bio: bio,
              projects: projects
            },
            fields: ['normalized_skills', 'competencies']
          };
          
          const skillsEngineResponse = await microserviceIntegrationService.sendRequest(
            'SkillsEngine',
            skillsEnginePayload
          );
          
          if (skillsEngineResponse && skillsEngineResponse.payload) {
            const parsedPayload = typeof skillsEngineResponse.payload === 'string'
              ? JSON.parse(skillsEngineResponse.payload)
              : skillsEngineResponse.payload;
            
            skillsEngineResult = parsedPayload;
            console.log(`[Enrichment] ✅ Skills Engine normalization completed`);
          }
        }
      } catch (error) {
        console.error(`[Enrichment] ⚠️ Error sending to Skills Engine (non-critical):`, error.message);
        // Don't fail enrichment if Skills Engine fails - it's non-critical
      }
    }

    return {
      bio: result.bio || null,
      projects: result.projects || [],
      skills: skillsEngineResult?.normalized_skills || skillsEngineResult?.competencies || []
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

