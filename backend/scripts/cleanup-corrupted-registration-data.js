// Script to clean up corrupted registration data
// Run this to remove employees/companies created by failed registration attempts
const { query } = require('../config/database');
require('dotenv').config();

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
    const employeeCheck = await query(
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

      // Remove employees from the corrupted company
      const deleteResult = await query(
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
    const orphanedEmployees = await query(
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

      const deleteOrphaned = await query(
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
    const staleCompanies = await query(
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
        const employeesCount = await query(
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

