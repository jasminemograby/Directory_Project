// Script to clean up specific employees by email(s)
// This will remove employees regardless of which company they belong to
const { Pool } = require('pg');
require('dotenv').config();

// Create a dedicated connection pool for this script
let connectionString;
if (process.env.SUPABASE_URL) {
  if (process.env.DATABASE_URL) {
    connectionString = process.env.DATABASE_URL;
  } else if (process.env.SUPABASE_CONNECTION_POOLER_URL) {
    connectionString = process.env.SUPABASE_CONNECTION_POOLER_URL;
  } else {
    const supabaseUrl = process.env.SUPABASE_URL;
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectRef && process.env.SUPABASE_DB_PASSWORD) {
      connectionString = `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`;
    } else {
      throw new Error('Missing database connection configuration');
    }
  }
} else {
  connectionString = process.env.DATABASE_URL;
}

if (!connectionString) {
  throw new Error('No database connection string found. Please set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.SUPABASE_URL ? { rejectUnauthorized: false } : false,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Query helper with retry
const queryWithRetry = async (text, params, maxRetries = 5) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    } catch (error) {
      const isConnectionError = 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ENOTFOUND' || 
        error.code === 'ECONNRESET' ||
        error.message?.includes('Connection terminated') ||
        error.message?.includes('timeout');
      
      if (isConnectionError && attempt < maxRetries) {
        const delay = (attempt + 1) * 2000;
        console.log(`   ⚠️  Connection error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
};

/**
 * Clean up employees by email(s)
 * Usage: node cleanup-employees-by-email.js email1@example.com email2@example.com
 */
const cleanupEmployeesByEmails = async () => {
  try {
    const emails = process.argv.slice(2);
    
    if (emails.length === 0) {
      console.log('Usage: node cleanup-employees-by-email.js email1@example.com email2@example.com');
      console.log('Or provide emails as comma-separated: email1@example.com,email2@example.com');
      process.exit(1);
    }

    // Handle comma-separated emails
    const emailList = emails.flatMap(email => email.split(',').map(e => e.trim()));
    const normalizedEmails = emailList.map(e => e.toLowerCase().trim());

    console.log(`🔍 Starting cleanup for ${emailList.length} email(s)...\n`);

    // Step 1: Find all employees with these emails
    console.log(`📋 Step 1: Finding employees with these email(s)...`);
    const employeesResult = await queryWithRetry(
      `SELECT e.id, e.name, e.email, e.company_id, c.name as company_name, e.created_at
       FROM employees e
       LEFT JOIN companies c ON e.company_id = c.id
       WHERE LOWER(TRIM(e.email)) = ANY($1::text[])
       ORDER BY e.created_at DESC`,
      [normalizedEmails]
    );

    if (employeesResult.rows.length === 0) {
      console.log(`   ℹ️  No employees found with these email(s).`);
      console.log(`   ✅ Nothing to clean up!`);
      return;
    }

    console.log(`   ⚠️  Found ${employeesResult.rows.length} employee(s) with these email(s):\n`);
    employeesResult.rows.forEach(emp => {
      console.log(`   - Email: ${emp.email}`);
      console.log(`     ID: ${emp.id}`);
      console.log(`     Name: ${emp.name}`);
      console.log(`     Company: ${emp.company_name || 'N/A'} (${emp.company_id})`);
      console.log(`     Created: ${emp.created_at}`);
      console.log('');
    });

    const employeeIds = employeesResult.rows.map(emp => emp.id);
    console.log(`   Found ${employeeIds.length} employee ID(s) to delete: ${employeeIds.join(', ')}\n`);

    // Step 2: Remove foreign key references
    console.log(`📋 Step 2: Removing foreign key references...`);

    // Remove decision_maker references
    const decisionMakerCheck = await queryWithRetry(
      `SELECT id, name, decision_maker_id 
       FROM companies 
       WHERE decision_maker_id = ANY($1::uuid[])`,
      [employeeIds]
    );

    if (decisionMakerCheck.rows.length > 0) {
      console.log(`   ⚠️  Found ${decisionMakerCheck.rows.length} company/companies using these employees as decision_maker`);
      for (const comp of decisionMakerCheck.rows) {
        await queryWithRetry(
          `UPDATE companies SET decision_maker_id = NULL WHERE id = $1`,
          [comp.id]
        );
        console.log(`   ✅ Removed decision_maker reference from company ${comp.name} (${comp.id})`);
      }
    }

    // Remove department manager references
    const deptManagerCheck = await queryWithRetry(
      `SELECT id, name, manager_id 
       FROM departments 
       WHERE manager_id = ANY($1::uuid[])`,
      [employeeIds]
    );

    if (deptManagerCheck.rows.length > 0) {
      console.log(`   ⚠️  Found ${deptManagerCheck.rows.length} department(s) using these employees as manager`);
      for (const dept of deptManagerCheck.rows) {
        await queryWithRetry(
          `UPDATE departments SET manager_id = NULL WHERE id = $1`,
          [dept.id]
        );
        console.log(`   ✅ Removed manager from department ${dept.name} (${dept.id})`);
      }
    }

    // Remove team manager references
    const teamManagerCheck = await queryWithRetry(
      `SELECT id, name, manager_id 
       FROM teams 
       WHERE manager_id = ANY($1::uuid[])`,
      [employeeIds]
    );

    if (teamManagerCheck.rows.length > 0) {
      console.log(`   ⚠️  Found ${teamManagerCheck.rows.length} team(s) using these employees as manager`);
      for (const team of teamManagerCheck.rows) {
        await queryWithRetry(
          `UPDATE teams SET manager_id = NULL WHERE id = $1`,
          [team.id]
        );
        console.log(`   ✅ Removed manager from team ${team.name} (${team.id})`);
      }
    }

    // Step 3: Delete the employees
    console.log(`\n📋 Step 3: Deleting employees...`);
    const deleteResult = await queryWithRetry(
      `DELETE FROM employees 
       WHERE id = ANY($1::uuid[])
       RETURNING id, name, email`,
      [employeeIds]
    );

    if (deleteResult.rows.length > 0) {
      console.log(`   ✅ Deleted ${deleteResult.rows.length} employee(s):`);
      deleteResult.rows.forEach(emp => {
        console.log(`      - Deleted: ${emp.name} (${emp.email})`);
      });
    } else {
      console.log(`   ⚠️  No employees were deleted (may have been deleted already)`);
    }

    // Summary
    console.log(`\n✅ Cleanup completed successfully!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Checked ${emailList.length} email(s)`);
    console.log(`   - Found ${employeesResult.rows.length} employee(s)`);
    console.log(`   - Deleted ${deleteResult.rows.length} employee(s)`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  cleanupEmployeesByEmails()
    .then(() => {
      console.log('\n✅ Cleanup script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Cleanup script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupEmployeesByEmails };

