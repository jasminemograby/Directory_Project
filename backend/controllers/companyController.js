// Company Controller
const { query } = require('../config/database');

/**
 * Get company by ID with statistics
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>}
 */
const getCompanyById = async (companyId) => {
  try {
    // Get company basic info
    const companyResult = await query(
      `SELECT 
        c.id,
        c.name,
        c.industry,
        c.domain,
        c.verification_status,
        c.learning_path_approval_policy,
        c.primary_kpi,
        c.created_at,
        c.updated_at
       FROM companies c
       WHERE c.id = $1`,
      [companyId]
    );

    if (companyResult.rows.length === 0) {
      return null;
    }

    const company = companyResult.rows[0];

    // Get HR info from company_settings
    const hrSettingsResult = await query(
      `SELECT setting_key, setting_value
       FROM company_settings
       WHERE company_id = $1 AND setting_key IN ('hr_name', 'hr_email', 'hr_role')`,
      [companyId]
    );

    const hrSettings = {};
    hrSettingsResult.rows.forEach(row => {
      hrSettings[row.setting_key] = row.setting_value;
    });

    // Get statistics
    const [departmentsCount, teamsCount, employeesCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM departments WHERE company_id = $1', [companyId]),
      query(
        `SELECT COUNT(*) as count 
         FROM teams t
         JOIN departments d ON t.department_id = d.id
         WHERE d.company_id = $1`,
        [companyId]
      ),
      query('SELECT COUNT(*) as count FROM employees WHERE company_id = $1', [companyId]),
    ]);

    // Get company settings (exercise_limit, passing_grade, max_attempts)
    const settingsResult = await query(
      `SELECT setting_key, setting_value
       FROM company_settings
       WHERE company_id = $1 AND setting_key IN ('exercise_limit', 'passing_grade', 'max_attempts')`,
      [companyId]
    );

    const settings = {};
    settingsResult.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return {
      ...company,
      hr: {
        name: hrSettings.hr_name || null,
        email: hrSettings.hr_email || null,
        role: hrSettings.hr_role || null,
      },
      statistics: {
        departments: parseInt(departmentsCount.rows[0].count, 10),
        teams: parseInt(teamsCount.rows[0].count, 10),
        employees: parseInt(employeesCount.rows[0].count, 10),
      },
      settings: {
        exerciseLimit: settings.exercise_limit || null,
        passingGrade: settings.passing_grade || null,
        maxAttempts: settings.max_attempts || null,
      },
    };
  } catch (error) {
    console.error('Error getting company by ID:', error.message);
    throw error;
  }
};

/**
 * API endpoint: Get company by ID
 */
const getCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`[getCompany] Fetching company with ID: ${id}`);

    const company = await getCompanyById(id);

    if (!company) {
      console.error(`[getCompany] Company not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    console.log(`[getCompany] Company found: ${company.id}, name: ${company.name}`);

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('Error in getCompany:', error.message);
    next(error);
  }
};

/**
 * Get company ID by HR email
 * @param {string} hrEmail - HR email
 * @returns {Promise<string|null>}
 */
const getCompanyIdByHrEmail = async (hrEmail) => {
  try {
    // Normalize email for comparison (case-insensitive)
    const normalizedEmail = hrEmail ? hrEmail.trim().toLowerCase() : null;
    if (!normalizedEmail) {
      console.error('[getCompanyIdByHrEmail] Invalid HR email provided');
      return null;
    }

    console.log(`[getCompanyIdByHrEmail] Looking for company with HR email: ${normalizedEmail}`);
    
    const result = await query(
      `SELECT company_id
       FROM company_settings
       WHERE setting_key = 'hr_email' AND LOWER(TRIM(setting_value)) = $1
       LIMIT 1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      console.log(`[getCompanyIdByHrEmail] No company found for HR email: ${normalizedEmail}`);
      return null;
    }

    const companyId = result.rows[0].company_id;
    console.log(`[getCompanyIdByHrEmail] Found company ID: ${companyId} for HR email: ${normalizedEmail}`);
    return companyId;
  } catch (error) {
    console.error('Error getting company ID by HR email:', error.message);
    throw error;
  }
};

/**
 * API endpoint: Get company by HR email
 */
const getCompanyByHrEmail = async (req, res, next) => {
  try {
    const { hrEmail } = req.query;

    if (!hrEmail) {
      return res.status(400).json({
        success: false,
        error: 'hrEmail query parameter is required',
      });
    }

    const companyId = await getCompanyIdByHrEmail(hrEmail);

    if (!companyId) {
      return res.status(404).json({
        success: false,
        error: 'Company not found for this HR email',
      });
    }

    const company = await getCompanyById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('Error in getCompanyByHrEmail:', error.message);
    next(error);
  }
};

module.exports = {
  getCompanyById,
  getCompany,
  getCompanyIdByHrEmail,
  getCompanyByHrEmail,
};


