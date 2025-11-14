// Script to clean up corrupted registration data
// Run this to remove employees/companies created by failed registration attempts
const { Pool } = require('pg');
require('dotenv').config();

// Create a dedicated connection pool for this script
// Use direct connection instead of the shared pool for better reliability
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
  max: 1, // Use single connection for script
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
        const delay = (attempt + 1) * 2000; // 2s, 4s, 6s, etc.
        console.log(`   ⚠️  Connection error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
};

/**
 * Clean up corrupted registration data
 * Removes:
 * - Employees with email yasmin_hitfield@hotmail.com from company 274f0a5a-8930-4060-a3da-e6553baeab85
 * - Any other orphaned employees from failed registrations
 */
const cleanupCorruptedData = async () => {
  try {
    console.log('🔍 Starting cleanup of corrupted registration data...\n');

    // 1. Find and remove specific corrupted employee
    const corruptedEmail = 'yasmin_hitfield@hotmail.com';
    const corruptedCompanyId = '274f0a5a-8930-4060-a3da-e6553baeab85';

    console.log(`📋 Step 1: Checking for employee with email: ${corruptedEmail}`);
    const employeeCheck = await queryWithRetry(
      `SELECT id, name, email, company_id, created_at 
       FROM employees 
       WHERE LOWER(TRIM(email)) = $1`,
      [corruptedEmail.toLowerCase()]
    );

    if (employeeCheck.rows.length > 0) {
      console.log(`   Found ${employeeCheck.rows.length} employee(s) with this email:`);
      employeeCheck.rows.forEach(emp => {
        console.log(`   - ID: ${emp.id}, Name: ${emp.name}, Company: ${emp.company_id}, Created: ${emp.created_at}`);
      });

      // First, check if this employee is a decision_maker for any company
      // If so, we need to remove that reference first
      console.log(`   Checking for foreign key constraints...`);
      const decisionMakerCheck = await queryWithRetry(
        `SELECT id, name, decision_maker_id 
         FROM companies 
         WHERE decision_maker_id IN (
           SELECT id FROM employees 
           WHERE LOWER(TRIM(email)) = $1 AND company_id = $2
         )`,
        [corruptedEmail.toLowerCase(), corruptedCompanyId]
      );

      if (decisionMakerCheck.rows.length > 0) {
        console.log(`   ⚠️  Found ${decisionMakerCheck.rows.length} company/companies using this employee as decision_maker`);
        for (const comp of decisionMakerCheck.rows) {
          console.log(`   - Company: ${comp.name} (ID: ${comp.id})`);
          // Remove decision_maker reference
          await queryWithRetry(
            `UPDATE companies SET decision_maker_id = NULL WHERE id = $1`,
            [comp.id]
          );
          console.log(`   ✅ Removed decision_maker reference from company ${comp.id}`);
        }
      }

      // Also check if employee is a department or team manager
      const managerCheck = await queryWithRetry(
        `SELECT 'department' as type, id, name, manager_id 
         FROM departments 
         WHERE manager_id IN (
           SELECT id FROM employees 
           WHERE LOWER(TRIM(email)) = $1 AND company_id = $2
         )
         UNION ALL
         SELECT 'team' as type, id, name, manager_id 
         FROM teams 
         WHERE manager_id IN (
           SELECT id FROM employees 
           WHERE LOWER(TRIM(email)) = $1 AND company_id = $2
         )`,
        [corruptedEmail.toLowerCase(), corruptedCompanyId]
      );

      if (managerCheck.rows.length > 0) {
        console.log(`   ⚠️  Found ${managerCheck.rows.length} department(s)/team(s) using this employee as manager`);
        for (const mgr of managerCheck.rows) {
          if (mgr.type === 'department') {
            await queryWithRetry(
              `UPDATE departments SET manager_id = NULL WHERE id = $1`,
              [mgr.id]
            );
            console.log(`   ✅ Removed manager from department ${mgr.name} (ID: ${mgr.id})`);
          } else {
            await queryWithRetry(
              `UPDATE teams SET manager_id = NULL WHERE id = $1`,
              [mgr.id]
            );
            console.log(`   ✅ Removed manager from team ${mgr.name} (ID: ${mgr.id})`);
          }
        }
      }

      // Now safe to delete the employee
      const deleteResult = await queryWithRetry(
        `DELETE FROM employees 
         WHERE LOWER(TRIM(email)) = $1 
         AND company_id = $2
         RETURNING id, name, email`,
        [corruptedEmail.toLowerCase(), corruptedCompanyId]
      );

      if (deleteResult.rows.length > 0) {
        console.log(`   ✅ Deleted ${deleteResult.rows.length} employee(s) from corrupted company`);
        deleteResult.rows.forEach(emp => {
          console.log(`      - Deleted: ${emp.name} (${emp.email})`);
        });
      } else {
        console.log(`   ⚠️  No employees found in the specified company`);
      }
    } else {
      console.log(`   ℹ️  No employees found with email: ${corruptedEmail}`);
    }

    // 2. Find orphaned employees (employees without valid company)
    console.log(`\n📋 Step 2: Checking for orphaned employees...`);
    const orphanedEmployees = await queryWithRetry(
      `SELECT e.id, e.name, e.email, e.company_id, e.created_at
       FROM employees e
       LEFT JOIN companies c ON e.company_id = c.id
       WHERE c.id IS NULL`
    );

    if (orphanedEmployees.rows.length > 0) {
      console.log(`   Found ${orphanedEmployees.rows.length} orphaned employee(s):`);
      orphanedEmployees.rows.forEach(emp => {
        console.log(`   - ID: ${emp.id}, Name: ${emp.name}, Email: ${emp.email}, Company ID: ${emp.company_id}`);
      });

      const deleteOrphaned = await queryWithRetry(
        `DELETE FROM employees 
         WHERE company_id NOT IN (SELECT id FROM companies)
         RETURNING id, name, email`
      );

      if (deleteOrphaned.rows.length > 0) {
        console.log(`   ✅ Deleted ${deleteOrphaned.rows.length} orphaned employee(s)`);
      }
    } else {
      console.log(`   ℹ️  No orphaned employees found`);
    }

    // 3. Find companies with verification_status = 'pending' that are old (more than 24 hours)
    console.log(`\n📋 Step 3: Checking for stale pending companies...`);
    const staleCompanies = await queryWithRetry(
      `SELECT id, name, domain, verification_status, created_at
       FROM companies
       WHERE verification_status = 'pending'
       AND created_at < NOW() - INTERVAL '24 hours'`
    );

    if (staleCompanies.rows.length > 0) {
      console.log(`   Found ${staleCompanies.rows.length} stale pending company/companies:`);
      staleCompanies.rows.forEach(comp => {
        console.log(`   - ID: ${comp.id}, Name: ${comp.name}, Created: ${comp.created_at}`);
      });

      // Check if they have employees
      for (const comp of staleCompanies.rows) {
        const employeesCount = await queryWithRetry(
          `SELECT COUNT(*) as count FROM employees WHERE company_id = $1`,
          [comp.id]
        );
        const count = parseInt(employeesCount.rows[0].count, 10);
        
        if (count > 0) {
          console.log(`   ⚠️  Company ${comp.id} has ${count} employee(s) - skipping deletion`);
        } else {
          console.log(`   ℹ️  Company ${comp.id} has no employees - can be safely deleted if needed`);
        }
      }
    } else {
      console.log(`   ℹ️  No stale pending companies found`);
    }

    // 4. Summary
    console.log(`\n✅ Cleanup completed successfully!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Checked for corrupted employee: ${corruptedEmail}`);
    console.log(`   - Checked for orphaned employees`);
    console.log(`   - Checked for stale pending companies`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    // Close the connection pool
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
};

// Run cleanup if called directly
if (require.main === module) {
  cleanupCorruptedData()
    .then(() => {
      console.log('\n✅ Cleanup script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Cleanup script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupCorruptedData };

