// Script to clear ALL employees from the database (for testing/debugging)
// Usage: node backend/scripts/clear-all-employees.js [--confirm]

const { query } = require('../config/database');
require('dotenv').config();

async function clearAllEmployees() {
  try {
    console.log('Connecting to database...');
    
    // Test connection
    const testResult = await query('SELECT NOW()');
    console.log('✅ Database connected:', testResult.rows[0].now);

    // Check if --confirm flag is provided
    const args = process.argv.slice(2);
    const confirmed = args.includes('--confirm');

    if (!confirmed) {
      console.log('\n⚠️  WARNING: This will delete ALL employees from the database!');
      console.log('   This includes:');
      console.log('   - All employee records');
      console.log('   - All external data links');
      console.log('   - All OAuth tokens');
      console.log('   - All external data raw');
      console.log('   - All notifications');
      console.log('\n   To proceed, run: node clear-all-employees.js --confirm\n');
      process.exit(1);
    }

    console.log('\n🗑️  Starting deletion of ALL employees...\n');

    // Count employees before deletion
    const countResult = await query('SELECT COUNT(*) as count FROM employees');
    const totalEmployees = parseInt(countResult.rows[0].count, 10);
    console.log(`📊 Found ${totalEmployees} employees to delete\n`);

    if (totalEmployees === 0) {
      console.log('✅ No employees to delete');
      process.exit(0);
    }

    // Delete in correct order (to avoid foreign key violations)
    console.log('🗑️  Deleting related data...\n');

    // 1. Delete external data links
    console.log('   Deleting external data links...');
    const linksResult = await query('DELETE FROM external_data_links');
    console.log(`   ✅ Deleted ${linksResult.rowCount} external data links`);

    // 2. Delete OAuth tokens
    console.log('   Deleting OAuth tokens...');
    const tokensResult = await query('DELETE FROM oauth_tokens');
    console.log(`   ✅ Deleted ${tokensResult.rowCount} OAuth tokens`);

    // 3. Delete external data raw
    console.log('   Deleting external data raw...');
    const rawDataResult = await query('DELETE FROM external_data_raw');
    console.log(`   ✅ Deleted ${rawDataResult.rowCount} external data raw records`);

    // 4. Delete notifications (by employee email)
    console.log('   Deleting notifications...');
    // Get all employee emails first
    const employeesResult = await query('SELECT DISTINCT email FROM employees');
    const emails = employeesResult.rows.map(row => row.email);
    
    if (emails.length > 0) {
      // Delete notifications for each email (using recipient_email column)
      let deletedCount = 0;
      for (const email of emails) {
        const result = await query('DELETE FROM notifications WHERE recipient_email = $1', [email]);
        deletedCount += result.rowCount;
      }
      console.log(`   ✅ Deleted ${deletedCount} notifications for ${emails.length} employee emails`);
    } else {
      console.log('   ℹ️  No employee emails found for notifications');
    }

    // 5. Clear manager references in departments and teams
    console.log('\n   Clearing manager references...');
    const deptManagerResult = await query('UPDATE departments SET manager_id = NULL WHERE manager_id IS NOT NULL');
    console.log(`   ✅ Cleared ${deptManagerResult.rowCount} department manager references`);
    
    const teamManagerResult = await query('UPDATE teams SET manager_id = NULL WHERE manager_id IS NOT NULL');
    console.log(`   ✅ Cleared ${teamManagerResult.rowCount} team manager references`);
    
    // 6. Clear decision_maker references in companies
    const decisionMakerResult = await query('UPDATE companies SET decision_maker_id = NULL WHERE decision_maker_id IS NOT NULL');
    console.log(`   ✅ Cleared ${decisionMakerResult.rowCount} company decision maker references`);

    // 7. Delete employees (this will cascade to other tables if foreign keys are set up)
    console.log('\n   Deleting employees...');
    const employeesResult2 = await query('DELETE FROM employees');
    console.log(`   ✅ Deleted ${employeesResult2.rowCount} employees`);

    // Verify deletion
    const verifyResult = await query('SELECT COUNT(*) as count FROM employees');
    const remainingEmployees = parseInt(verifyResult.rows[0].count, 10);

    if (remainingEmployees === 0) {
      console.log('\n✅ All employees deleted successfully!');
      console.log(`   Total deleted: ${totalEmployees} employees`);
    } else {
      console.log(`\n⚠️  Warning: ${remainingEmployees} employees still remain`);
      console.log('   This might be due to foreign key constraints');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

clearAllEmployees();

