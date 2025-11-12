// Script to clear all data for a company (employees, departments, teams)
// Usage: node backend/scripts/clear-company-data.js [company_id]

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not found in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.SUPABASE_URL ? { rejectUnauthorized: false } : false,
});

async function clearCompanyData(companyId = null) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('🗑️  Clearing company data...\n');
    
    // Get company ID
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const latestCompany = await client.query(
        `SELECT id, name FROM companies ORDER BY created_at DESC LIMIT 1`
      );
      if (latestCompany.rows.length === 0) {
        console.log('❌ No companies found');
        return;
      }
      targetCompanyId = latestCompany.rows[0].id;
      console.log(`📋 Using latest company: ${latestCompany.rows[0].name} (${targetCompanyId})\n`);
    } else {
      const companyInfo = await client.query(
        `SELECT name FROM companies WHERE id = $1`,
        [targetCompanyId]
      );
      if (companyInfo.rows.length === 0) {
        console.log(`❌ Company with ID ${targetCompanyId} not found`);
        return;
      }
      console.log(`📋 Clearing data for company: ${companyInfo.rows[0].name} (${targetCompanyId})\n`);
    }
    
    // Count existing data
    const employeesCount = await client.query(
      `SELECT COUNT(*) as count FROM employees WHERE company_id = $1`,
      [targetCompanyId]
    );
    const departmentsCount = await client.query(
      `SELECT COUNT(*) as count FROM departments WHERE company_id = $1`,
      [targetCompanyId]
    );
    const teamsCount = await client.query(
      `SELECT COUNT(*) as count FROM teams WHERE department_id IN (SELECT id FROM departments WHERE company_id = $1)`,
      [targetCompanyId]
    );
    
    console.log(`📊 Current data count:`);
    console.log(`   Employees: ${employeesCount.rows[0].count}`);
    console.log(`   Departments: ${departmentsCount.rows[0].count}`);
    console.log(`   Teams: ${teamsCount.rows[0].count}\n`);
    
    if (employeesCount.rows[0].count === '0' && departmentsCount.rows[0].count === '0') {
      console.log('✅ No data to clear');
      await client.query('COMMIT');
      return;
    }
    
    // Delete in correct order (teams -> departments -> employees)
    console.log('🗑️  Deleting teams...');
    const teamsDeleted = await client.query(
      `DELETE FROM teams WHERE department_id IN (SELECT id FROM departments WHERE company_id = $1)`,
      [targetCompanyId]
    );
    console.log(`   ✅ Deleted ${teamsDeleted.rowCount} teams`);
    
    console.log('🗑️  Deleting departments...');
    const deptsDeleted = await client.query(
      `DELETE FROM departments WHERE company_id = $1`,
      [targetCompanyId]
    );
    console.log(`   ✅ Deleted ${deptsDeleted.rowCount} departments`);
    
    console.log('🗑️  Deleting employees...');
    const employeesDeleted = await client.query(
      `DELETE FROM employees WHERE company_id = $1`,
      [targetCompanyId]
    );
    console.log(`   ✅ Deleted ${employeesDeleted.rowCount} employees`);
    
    await client.query('COMMIT');
    console.log('\n✅ All company data cleared successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

const companyId = process.argv[2] || null;
clearCompanyData(companyId);

