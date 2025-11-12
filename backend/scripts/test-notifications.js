// Test Notifications API
require('dotenv').config();
const { query, pool } = require('../config/database');

// Helper function with retry logic
async function queryWithRetry(text, params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await query(text, params);
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      console.log(`   Retry attempt ${i + 1}/${maxRetries - 1}...`);
    }
  }
}

async function testNotifications() {
  try {
    console.log('🔔 Testing Notifications API...\n');
    
    // Wait a bit for connection to stabilize
    console.log('⏳ Waiting for connection to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 1: Get all notifications
    console.log('1️⃣ Getting all notifications...');
    const allNotifications = await queryWithRetry(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10'
    );
    console.log(`   Found ${allNotifications.rows.length} notifications\n`);

    if (allNotifications.rows.length > 0) {
      allNotifications.rows.forEach((notif, index) => {
        console.log(`   Notification ${index + 1}:`);
        console.log(`     ID: ${notif.id}`);
        console.log(`     Type: ${notif.type}`);
        console.log(`     Recipient: ${notif.recipient_email}`);
        console.log(`     Status: ${notif.status}`);
        console.log(`     Read: ${notif.read_at ? 'Yes' : 'No'}`);
        console.log(`     Created: ${notif.created_at}`);
        console.log(`     Message: ${notif.message?.substring(0, 100)}...`);
        console.log('');
      });
    }

    // Test 2: Get unread count for a specific email
    console.log('2️⃣ Getting unread count...');
    const testEmail = process.env.TEST_HR_EMAIL || 'hr@example.com';
    
    // First check if read_at column exists
    console.log('   Checking if read_at column exists...');
    let columnCheck;
    try {
      columnCheck = await queryWithRetry(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'read_at'
      `);
    } catch (error) {
      console.log(`   ⚠️  Could not check read_at column: ${error.message}\n`);
      columnCheck = { rows: [] };
    }
    
    if (columnCheck.rows.length > 0) {
      console.log(`   ✅ read_at column exists: ${columnCheck.rows[0].data_type}`);
      
      // Try to get unread count
      try {
        const unreadCount = await queryWithRetry(
          'SELECT COUNT(*) as count FROM notifications WHERE recipient_email = $1 AND read_at IS NULL',
          [testEmail]
        );
        console.log(`   Unread count for ${testEmail}: ${unreadCount.rows[0].count}\n`);
      } catch (error) {
        console.log(`   ⚠️  Could not get unread count: ${error.message}\n`);
      }
    } else {
      console.log(`   ❌ read_at column does NOT exist - need to add it!`);
      console.log(`   Run the migration: database/migrations/add_read_at_to_notifications.sql\n`);
    }

    // Test 3: Get notifications by recipient
    console.log('3️⃣ Getting notifications for specific recipient...');
    let recipientNotifications;
    try {
      // Try with read_at first
      recipientNotifications = await queryWithRetry(
        `SELECT id, type, recipient_email, read_at, created_at 
         FROM notifications 
         WHERE recipient_email = $1 
         ORDER BY created_at DESC 
         LIMIT 5`,
        [testEmail]
      );
    } catch (error) {
      // If read_at doesn't exist, try without it
      console.log(`   ⚠️  Query with read_at failed, trying without it...`);
      recipientNotifications = await queryWithRetry(
        `SELECT id, type, recipient_email, created_at 
         FROM notifications 
         WHERE recipient_email = $1 
         ORDER BY created_at DESC 
         LIMIT 5`,
        [testEmail]
      );
    }
    console.log(`   Found ${recipientNotifications.rows.length} notifications for ${testEmail}\n`);

    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Error testing notifications:', error.message);
    console.error(error.stack);
  } finally {
    // Close database connection pool
    try {
      await pool.end();
      console.log('\n🔌 Database connection closed.');
    } catch (closeError) {
      console.error('Error closing database connection:', closeError.message);
    }
    process.exit(0);
  }
}

testNotifications();

