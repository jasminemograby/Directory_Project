// Company Controller
const { query } = require('../config/database');

/**
 * Get company by ID with statistics
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>}
 */
const getCompanyById = async (companyId) => {
  try {
    console.log(`[getCompanyById] ========== START ==========`);
    console.log(`[getCompanyById] Fetching company with ID: ${companyId}`);
    console.log(`[getCompanyById] Company ID type: ${typeof companyId}`);
    console.log(`[getCompanyById] Company ID length: ${companyId?.length}`);
    
    // First, check if ANY companies exist
    const allCompaniesCheck = await query('SELECT COUNT(*) as count FROM companies');
    console.log(`[getCompanyById] Total companies in DB: ${allCompaniesCheck.rows[0].count}`);
    
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

    console.log(`[getCompanyById] Query executed. Rows returned: ${companyResult.rows.length}`);
    
    if (companyResult.rows.length === 0) {
      console.log(`[getCompanyById] ❌ Company not found with ID: ${companyId}`);
      
      // Debug: Check if company exists with different query
      const debugCheck = await query(
        `SELECT id, name, created_at FROM companies WHERE id::text = $1`,
        [companyId]
      );
      console.log(`[getCompanyById] Debug check (id::text): ${debugCheck.rows.length} rows`);
      
      // Check recent companies
      const recentCompanies = await query(
        'SELECT id, name, created_at FROM companies ORDER BY created_at DESC LIMIT 5'
      );
      console.log(`[getCompanyById] Recent companies in DB:`);
      recentCompanies.rows.forEach(c => {
        console.log(`[getCompanyById]   - ${c.id} | ${c.name} | ${c.created_at}`);
      });
      
      console.log(`[getCompanyById] ========== END (NOT FOUND) ==========`);
      return null;
    }

    console.log(`[getCompanyById] ✅ Company found: ${companyResult.rows[0].id}, name: ${companyResult.rows[0].name}`);

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
    
    // Get HR employee ID from employees table
    let hrEmployeeId = null;
    if (hrSettings.hr_email) {
      const hrEmployeeResult = await query(
        `SELECT id FROM employees 
         WHERE company_id = $1 
         AND LOWER(TRIM(email)) = LOWER(TRIM($2))
         LIMIT 1`,
        [companyId, hrSettings.hr_email]
      );
      if (hrEmployeeResult.rows.length > 0) {
        hrEmployeeId = hrEmployeeResult.rows[0].id;
      }
    }

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

    // Get company settings (exercise_limit, passing_grade, max_test_attempts)
    const settingsResult = await query(
      `SELECT setting_key, setting_value
       FROM company_settings
       WHERE company_id = $1 AND setting_key IN ('exercise_limit', 'passing_grade', 'max_test_attempts', 'max_attempts')`,
      [companyId]
    );

    const settings = {};
    settingsResult.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return {
      ...company,
      hr: {
        id: hrEmployeeId || null,
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
        maxAttempts: settings.max_test_attempts || settings.max_attempts || null,
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
    console.log(`[getCompany] ========== ENDPOINT CALLED ==========`);
    console.log(`[getCompany] Request method: ${req.method}`);
    console.log(`[getCompany] Request URL: ${req.url}`);
    console.log(`[getCompany] Request params:`, req.params);
    console.log(`[getCompany] Request query:`, req.query);
    
    const { id } = req.params;
    console.log(`[getCompany] Extracted company ID: ${id}`);
    console.log(`[getCompany] Company ID type: ${typeof id}`);

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
    console.log(`[getCompanyByHrEmail] ========== ENDPOINT CALLED ==========`);
    console.log(`[getCompanyByHrEmail] Request method: ${req.method}`);
    console.log(`[getCompanyByHrEmail] Request URL: ${req.url}`);
    console.log(`[getCompanyByHrEmail] Request query:`, req.query);
    
    const { hrEmail } = req.query;
    console.log(`[getCompanyByHrEmail] Extracted HR email: ${hrEmail}`);

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

// Check if HR email is already in use (for live validation)
const checkHrEmailAvailability = async (req, res, next) => {
  try {
    const { email } = req.query;
    
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if email exists in company_settings (HR emails)
    const hrCheck = await query(
      `SELECT cs.company_id, c.name as company_name
       FROM company_settings cs
       JOIN companies c ON c.id = cs.company_id
       WHERE cs.setting_key = 'hr_email' 
       AND LOWER(TRIM(cs.setting_value)) = $1
       LIMIT 1`,
      [normalizedEmail]
    );
    
    if (hrCheck.rows.length > 0) {
      return res.json({
        success: true,
        available: false,
        message: 'This email is already registered as HR for a company',
        companyName: hrCheck.rows[0].company_name
      });
    }
    
    // Also check if email exists in employees table (might be registered as employee)
    const employeeCheck = await query(
      `SELECT e.id, e.company_id, c.name as company_name
       FROM employees e
       JOIN companies c ON c.id = e.company_id
       WHERE LOWER(TRIM(e.email)) = $1
       LIMIT 1`,
      [normalizedEmail]
    );
    
    if (employeeCheck.rows.length > 0) {
      return res.json({
        success: true,
        available: false,
        message: 'This email is already registered as an employee',
        companyName: employeeCheck.rows[0].company_name
      });
    }
    
    // Email is available
    return res.json({
      success: true,
      available: true,
      message: 'Email is available'
    });
  } catch (error) {
    console.error('Error checking HR email availability:', error);
    next(error);
  }
};

module.exports = {
  checkHrEmailAvailability,
  getCompanyById,
  getCompany,
  getCompanyIdByHrEmail,
  getCompanyByHrEmail,
};


