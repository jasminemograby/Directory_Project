// Script to check company registration data in the database
// Usage: node backend/scripts/check-company-data.js [company_id]

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Construct connection string
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not found in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.SUPABASE_URL ? { rejectUnauthorized: false } : false,
});

async function checkCompanyData(companyId = null) {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking company data in database...\n');
    
    // Get company ID from argument or find the latest one
    let targetCompanyId = companyId;
    
    if (!targetCompanyId) {
      const latestCompany = await client.query(
        `SELECT id, name, domain, verification_status, learning_path_approval_policy, created_at 
         FROM companies 
         ORDER BY created_at DESC 
         LIMIT 1`
      );
      
      if (latestCompany.rows.length === 0) {
        console.log('❌ No companies found in database');
        return;
      }
      
      targetCompanyId = latestCompany.rows[0].id;
      console.log(`📋 Using latest company: ${latestCompany.rows[0].name} (${targetCompanyId})\n`);
    }
    
    // Get company details
    const companyResult = await client.query(
      `SELECT id, name, industry, domain, verification_status, 
              learning_path_approval_policy, primary_kpi, decision_maker_id, created_at
       FROM companies 
       WHERE id = $1`,
      [targetCompanyId]
    );
    
    if (companyResult.rows.length === 0) {
      console.log(`❌ Company with ID ${targetCompanyId} not found`);
      return;
    }
    
    const company = companyResult.rows[0];
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🏢 COMPANY INFORMATION');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`ID: ${company.id}`);
    console.log(`Name: ${company.name}`);
    console.log(`Industry: ${company.industry || 'N/A'}`);
    console.log(`Domain: ${company.domain || 'N/A'}`);
    console.log(`Verification Status: ${company.verification_status}`);
    console.log(`Learning Path Policy: ${company.learning_path_approval_policy}`);
    console.log(`Primary KPI: ${company.primary_kpi || 'N/A'}`);
    console.log(`Created At: ${company.created_at}`);
    console.log('');
    
    // Get decision maker if exists
    if (company.decision_maker_id) {
      const decisionMaker = await client.query(
        `SELECT name, email FROM employees WHERE id = $1`,
        [company.decision_maker_id]
      );
      if (decisionMaker.rows.length > 0) {
        console.log(`Decision Maker: ${decisionMaker.rows[0].name} (${decisionMaker.rows[0].email})`);
      }
    }
    console.log('');
    
    // Get company settings
    const settingsResult = await client.query(
      `SELECT setting_key, setting_value 
       FROM company_settings 
       WHERE company_id = $1 
       ORDER BY setting_key`,
      [targetCompanyId]
    );
    
    if (settingsResult.rows.length > 0) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('⚙️  ORGANIZATIONAL SETTINGS');
      console.log('═══════════════════════════════════════════════════════');
      settingsResult.rows.forEach(setting => {
        console.log(`${setting.setting_key}: ${setting.setting_value}`);
      });
      console.log('');
    }
    
    // Get departments
    const departmentsResult = await client.query(
      `SELECT d.id, d.name, d.manager_id, 
              e.name as manager_name, e.email as manager_email
       FROM departments d
       LEFT JOIN employees e ON d.manager_id = e.id
       WHERE d.company_id = $1
       ORDER BY d.name`,
      [targetCompanyId]
    );
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📁 DEPARTMENTS (${departmentsResult.rows.length})`);
    console.log('═══════════════════════════════════════════════════════');
    
    if (departmentsResult.rows.length === 0) {
      console.log('No departments found');
    } else {
      for (const dept of departmentsResult.rows) {
        console.log(`\n📁 ${dept.name}`);
        console.log(`   ID: ${dept.id}`);
        if (dept.manager_name) {
          console.log(`   Manager: ${dept.manager_name} (${dept.manager_email})`);
        } else {
          console.log(`   Manager: Not assigned`);
        }
        
        // Get teams for this department
        const teamsResult = await client.query(
          `SELECT t.id, t.name, t.manager_id,
                  e.name as manager_name, e.email as manager_email
           FROM teams t
           LEFT JOIN employees e ON t.manager_id = e.id
           WHERE t.department_id = $1
           ORDER BY t.name`,
          [dept.id]
        );
        
        if (teamsResult.rows.length > 0) {
          console.log(`   Teams (${teamsResult.rows.length}):`);
          teamsResult.rows.forEach(team => {
            console.log(`      - ${team.name}`);
            if (team.manager_name) {
              console.log(`        Manager: ${team.manager_name} (${team.manager_email})`);
            }
          });
        }
      }
    }
    console.log('');
    
    // Get employees
    const employeesResult = await client.query(
      `SELECT e.id, e.name, e.email, e.role, e.target_role, e.type, 
              e.profile_status, e.department_id, e.team_id,
              d.name as department_name, t.name as team_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN teams t ON e.team_id = t.id
       WHERE e.company_id = $1
       ORDER BY e.name`,
      [targetCompanyId]
    );
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`👥 EMPLOYEES (${employeesResult.rows.length})`);
    console.log('═══════════════════════════════════════════════════════');
    
    if (employeesResult.rows.length === 0) {
      console.log('No employees found');
    } else {
      for (let index = 0; index < employeesResult.rows.length; index++) {
        const emp = employeesResult.rows[index];
        console.log(`\n${index + 1}. ${emp.name}`);
        console.log(`   Email: ${emp.email}`);
        console.log(`   Current Role: ${emp.role || 'N/A'}`);
        console.log(`   Target Role: ${emp.target_role || 'N/A'}`);
        console.log(`   Type: ${emp.type}`);
        console.log(`   Profile Status: ${emp.profile_status}`);
        if (emp.department_name) {
          console.log(`   Department: ${emp.department_name}`);
        }
        if (emp.team_name) {
          console.log(`   Team: ${emp.team_name}`);
        }
        
        // Get external links
        const linksResult = await client.query(
          `SELECT link_type, url 
           FROM external_data_links 
           WHERE employee_id = $1`,
          [emp.id]
        );
        
        if (linksResult.rows.length > 0) {
          console.log(`   External Links:`);
          linksResult.rows.forEach(link => {
            if (link.url) {
              console.log(`      - ${link.link_type}: ${link.url}`);
            }
          });
        }
      }
    }
    console.log('');
    
    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Company: ${company.name}`);
    console.log(`Departments: ${departmentsResult.rows.length}`);
    console.log(`Employees: ${employeesResult.rows.length}`);
    console.log(`Settings: ${settingsResult.rows.length}`);
    console.log('═══════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Error checking company data:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Get company ID from command line argument
const companyId = process.argv[2] || null;
checkCompanyData(companyId);

