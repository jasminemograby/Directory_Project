// Script to clear employees by email (for testing/debugging)
const { query } = require('../config/database');
require('dotenv').config();

async function clearEmployeesByEmail(emails) {
  try {
    console.log('Connecting to database...');
    
    // Test connection
    const testResult = await query('SELECT NOW()');
    console.log('✅ Database connected:', testResult.rows[0].now);

    if (!Array.isArray(emails) || emails.length === 0) {
      console.error('Please provide an array of email addresses to delete');
      process.exit(1);
    }

    console.log(`\nDeleting employees with emails: ${emails.join(', ')}`);

    for (const email of emails) {
      const normalizedEmail = email.trim().toLowerCase();
      
      // Check if employee exists
      const checkResult = await query(
        `SELECT id, name, email, company_id FROM employees WHERE LOWER(TRIM(email)) = $1`,
        [normalizedEmail]
      );

      if (checkResult.rows.length === 0) {
        console.log(`⚠️  Employee with email ${email} not found`);
        continue;
      }

      const employee = checkResult.rows[0];
      console.log(`\nFound employee: ${employee.name} (${employee.email})`);
      console.log(`  ID: ${employee.id}`);
      console.log(`  Company ID: ${employee.company_id}`);

      // Delete related data first (cascade should handle this, but let's be explicit)
      console.log(`  Deleting related data...`);
      
      // Delete external data links
      await query('DELETE FROM external_data_links WHERE employee_id = $1', [employee.id]);
      console.log(`    ✓ External data links deleted`);

      // Delete OAuth tokens
      await query('DELETE FROM oauth_tokens WHERE employee_id = $1', [employee.id]);
      console.log(`    ✓ OAuth tokens deleted`);

      // Delete external data raw
      await query('DELETE FROM external_data_raw WHERE employee_id = $1', [employee.id]);
      console.log(`    ✓ External data raw deleted`);

      // Delete notifications (if any)
      await query('DELETE FROM notifications WHERE user_email = $1', [employee.email]);
      console.log(`    ✓ Notifications deleted`);

      // Delete employee
      await query('DELETE FROM employees WHERE id = $1', [employee.id]);
      console.log(`  ✅ Employee deleted successfully`);
    }

    console.log('\n✅ All specified employees deleted');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Get emails from command line arguments
const emails = process.argv.slice(2);

if (emails.length === 0) {
  console.log('Usage: node clear-employees-by-email.js <email1> <email2> ...');
  console.log('Example: node clear-employees-by-email.js test@example.com hr@example.com');
  process.exit(1);
}

clearEmployeesByEmail(emails);

