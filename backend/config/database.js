// Database Configuration
const { Pool } = require('pg');
require('dotenv').config();

// Construct connection string for Supabase
let connectionString;
if (process.env.SUPABASE_URL) {
  // Supabase connection - use DATABASE_URL if provided, otherwise construct from Supabase URL
  if (process.env.DATABASE_URL) {
    // Use explicit DATABASE_URL if provided (recommended - get from Supabase dashboard)
    // This should be the Connection Pooler URL or Direct Connection URL from Supabase
    connectionString = process.env.DATABASE_URL;
  } else if (process.env.SUPABASE_CONNECTION_POOLER_URL) {
    // Use connection pooler URL if provided (recommended for production)
    connectionString = process.env.SUPABASE_CONNECTION_POOLER_URL;
  } else {
    // Extract project reference from Supabase URL
    const supabaseUrl = process.env.SUPABASE_URL;
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    if (projectRef && process.env.SUPABASE_DB_PASSWORD) {
      // Try connection pooler first (more reliable)
      // Format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
      // Or direct: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
      
      // Try direct connection first
      connectionString = `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`;
    } else {
      // Fallback - will likely fail, but provides clear error message
      connectionString = `postgresql://postgres@db.${projectRef}.supabase.co:5432/postgres`;
    }
  }
} else {
  // Use DATABASE_URL if Supabase not configured
  connectionString = process.env.DATABASE_URL;
}

// Log connection string (without password) for debugging
if (connectionString) {
  const maskedConnection = connectionString.replace(/:[^:@]+@/, ':****@');
  console.log('Database connection string:', maskedConnection);
  console.log('Database connection source:', 
    process.env.DATABASE_URL ? 'DATABASE_URL' :
    process.env.SUPABASE_CONNECTION_POOLER_URL ? 'SUPABASE_CONNECTION_POOLER_URL' :
    'Constructed from SUPABASE_URL'
  );
} else {
  console.error('ERROR: No database connection string found!');
  console.error('Required: DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.SUPABASE_URL ? { rejectUnauthorized: false } : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Increased timeout for slow connections
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  // Don't exit in production - let the app handle errors gracefully
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

// Test connection on startup
(async () => {
  try {
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', testResult.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
  }
})();

// Query helper function
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error', { 
      error: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError.message);
    }
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
};

