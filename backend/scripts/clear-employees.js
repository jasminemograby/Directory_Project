// Script to clear all employees from the database
// Usage: node backend/scripts/clear-employees.js

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

async function clearEmployees() {
  const client = await pool.connect();
  try {
    console.log('Starting to clear employees...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Delete all employees (cascade will handle related records)
    const result = await client.query('DELETE FROM employees RETURNING id, email, name');
    
    console.log(`✅ Deleted ${result.rows.length} employees:`);
    result.rows.forEach((emp, index) => {
      console.log(`  ${index + 1}. ${emp.name} (${emp.email})`);
    });
    
    // Also clear departments and teams (optional - uncomment if needed)
    // const deptResult = await client.query('DELETE FROM departments RETURNING id, name');
    // console.log(`✅ Deleted ${deptResult.rows.length} departments`);
    // const teamResult = await client.query('DELETE FROM teams RETURNING id, name');
    // console.log(`✅ Deleted ${teamResult.rows.length} teams`);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ All employees cleared successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error clearing employees:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

clearEmployees();

