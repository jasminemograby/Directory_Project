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

// Log connection string (without password) - development only
if (connectionString && process.env.NODE_ENV === 'development') {
  const maskedConnection = connectionString.replace(/:[^:@]+@/, ':****@');
  console.log('Database connection string:', maskedConnection);
} else if (!connectionString) {
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
  if (process.env.NODE_ENV === 'development') {
    console.log('Database connected successfully');
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit in production - let the app handle errors gracefully
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

// Test connection on startup (with retry for Railway/Supabase)
(async () => {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Wait a bit before first attempt (Railway needs time to establish connection)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      const testResult = await pool.query('SELECT NOW()');
      if (process.env.NODE_ENV === 'development') {
        console.log('Database connection test successful:', testResult.rows[0].now);
      }
      return; // Success, exit
    } catch (error) {
      if (i === maxRetries - 1) {
        // Last attempt failed - log but don't crash (connection might work later)
        console.warn('Database connection test failed after retries:', error.message);
        console.warn('The app will continue - connection will be tested on first query.');
      } else if (process.env.NODE_ENV === 'development') {
        console.log(`Database connection test attempt ${i + 1} failed, retrying...`);
      }
    }
  }
})();

// Query helper function with retry logic for connection issues
const query = async (text, params, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (error) {
      // Check if it's a connection error that might be retryable
      const isConnectionError = 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ENOTFOUND' || 
        error.code === 'ECONNRESET' ||
        error.message?.includes('Connection terminated') ||
        error.message?.includes('timeout') ||
        error.message?.includes('Connection pool');
      
      // If it's a connection error and we have retries left, wait and retry
      if (isConnectionError && attempt < retries) {
        const delay = (attempt + 1) * 1000; // 1s, 2s, etc.
        console.warn(`Database connection error (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`, {
          code: error.code,
          message: error.message
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue; // Retry
      }
      
      // Log error and throw
      console.error('Database query error', { 
        error: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        attempt: attempt + 1
      });
      throw error;
    }
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    console.log('[TRANSACTION] Starting transaction...');
    await client.query('BEGIN');
    console.log('[TRANSACTION] Transaction BEGIN successful');
    
    const result = await callback(client);
    
    console.log('[TRANSACTION] Callback completed, committing...');
    await client.query('COMMIT');
    console.log('[TRANSACTION] Transaction COMMIT successful');
    
    return result;
  } catch (error) {
    console.error('[TRANSACTION] Error in transaction, rolling back...', error.message);
    try {
      await client.query('ROLLBACK');
      console.log('[TRANSACTION] Rollback successful');
    } catch (rollbackError) {
      console.error('[TRANSACTION] Rollback error:', rollbackError.message);
    }
    throw error;
  } finally {
    client.release();
    console.log('[TRANSACTION] Client released back to pool');
  }
};

module.exports = {
  pool,
  query,
  transaction,
};

