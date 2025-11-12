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

// Log connection string (without password) only in development
if (connectionString && process.env.NODE_ENV === 'development') {
  const maskedConnection = connectionString.replace(/:[^:@]+@/, ':****@');
  console.log('Database connection string:', maskedConnection);
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
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

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

