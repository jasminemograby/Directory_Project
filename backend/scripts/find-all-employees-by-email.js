// Script to find all employees by email(s) - useful for debugging
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
 * Find all employees by email(s)
 * Usage: node find-all-employees-by-email.js email1@example.com email2@example.com
 */
const findEmployeesByEmails = async () => {
  try {
    const emails = process.argv.slice(2);
    
    if (emails.length === 0) {
      console.log('Usage: node find-all-employees-by-email.js email1@example.com email2@example.com');
      console.log('Or provide emails as comma-separated: email1@example.com,email2@example.com');
      process.exit(1);
    }

    // Handle comma-separated emails
    const emailList = emails.flatMap(email => email.split(',').map(e => e.trim()));

    console.log(`🔍 Searching for employees with ${emailList.length} email(s)...\n`);

    const normalizedEmails = emailList.map(e => e.toLowerCase().trim());
    
    const result = await queryWithRetry(
      `SELECT e.id, e.name, e.email, e.company_id, e.created_at, c.name as company_name
       FROM employees e
       LEFT JOIN companies c ON e.company_id = c.id
       WHERE LOWER(TRIM(e.email)) = ANY($1::text[])
       ORDER BY e.created_at DESC`,
      [normalizedEmails]
    );

    if (result.rows.length === 0) {
      console.log(`✅ No employees found with these email(s):`);
      emailList.forEach(email => console.log(`   - ${email}`));
    } else {
      console.log(`⚠️  Found ${result.rows.length} employee(s) with these email(s):\n`);
      result.rows.forEach(emp => {
        console.log(`   Email: ${emp.email}`);
        console.log(`   - ID: ${emp.id}`);
        console.log(`   - Name: ${emp.name}`);
        console.log(`   - Company: ${emp.company_name || 'N/A'} (${emp.company_id})`);
        console.log(`   - Created: ${emp.created_at}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  findEmployeesByEmails()
    .then(() => {
      console.log('\n✅ Search completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Search failed:', error);
      process.exit(1);
    });
}

module.exports = { findEmployeesByEmails };

