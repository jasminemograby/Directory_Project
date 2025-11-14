// Script to apply database migrations automatically
// This script applies all migrations in the database/migrations folder

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

// Get database connection string
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_CONNECTION_POOLER_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL or SUPABASE_CONNECTION_POOLER_URL not found in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.SUPABASE_URL ? { rejectUnauthorized: false } : false,
});

async function applyMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migrations...\n');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get all migration files
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Apply in alphabetical order

    console.log(`📁 Found ${files.length} migration file(s)\n`);

    for (const file of files) {
      // Check if migration already applied
      const checkResult = await client.query(
        'SELECT filename FROM schema_migrations WHERE filename = $1',
        [file]
      );

      if (checkResult.rows.length > 0) {
        console.log(`⏭️  Skipping ${file} (already applied)`);
        continue;
      }

      console.log(`📝 Applying ${file}...`);

      // Read and execute migration file
      const migrationSQL = fs.readFileSync(
        path.join(migrationsDir, file),
        'utf8'
      );

      // Execute migration in a transaction
      await client.query('BEGIN');
      try {
        await client.query(migrationSQL);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`✅ Successfully applied ${file}\n`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error applying migrations:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations
applyMigrations();

