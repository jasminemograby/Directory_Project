// Script to check GitHub → Gemini flow
// Usage: node backend/scripts/check-github-gemini-flow.js <employeeId>

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query } = require('../config/database');

async function checkFlow(employeeId) {
  console.log('🔍 Checking GitHub → Gemini Flow for employee:', employeeId);
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Check OAuth token
    console.log('1️⃣ Checking OAuth Token...');
    const tokenResult = await query(
      `SELECT provider, created_at, expires_at 
       FROM oauth_tokens 
       WHERE employee_id = $1 AND provider = 'github'`,
      [employeeId]
    );
    
    if (tokenResult.rows.length === 0) {
      console.log('❌ No GitHub token found');
      return;
    }
    console.log('✅ GitHub token found:', {
      created: tokenResult.rows[0].created_at,
      expires: tokenResult.rows[0].expires_at
    });
    console.log('');

    // Step 2: Check raw data
    console.log('2️⃣ Checking Raw Data (external_data_raw)...');
    const rawDataResult = await query(
      `SELECT provider, processed, fetched_at, 
              LENGTH(data::text) as data_size
       FROM external_data_raw 
       WHERE employee_id = $1 AND provider = 'github'`,
      [employeeId]
    );
    
    if (rawDataResult.rows.length === 0) {
      console.log('❌ No raw GitHub data found');
      console.log('💡 Try calling: POST /api/external/collect/' + employeeId);
      return;
    }
    
    const rawData = rawDataResult.rows[0];
    console.log('✅ Raw data found:', {
      processed: rawData.processed,
      fetched_at: rawData.fetched_at,
      data_size: rawData.data_size + ' bytes'
    });
    
    // Show sample of raw data
    const fullRawData = await query(
      `SELECT data FROM external_data_raw 
       WHERE employee_id = $1 AND provider = 'github'`,
      [employeeId]
    );
    if (fullRawData.rows.length > 0) {
      const parsed = typeof fullRawData.rows[0].data === 'string' 
        ? JSON.parse(fullRawData.rows[0].data) 
        : fullRawData.rows[0].data;
      console.log('📦 Raw data sample:', {
        profile: parsed.profile ? {
          login: parsed.profile.login,
          name: parsed.profile.name,
          bio: parsed.profile.bio?.substring(0, 50) + '...'
        } : null,
        repositories_count: parsed.repositories?.length || 0
      });
    }
    console.log('');

    // Step 3: Check processed data
    console.log('3️⃣ Checking Processed Data (external_data_processed)...');
    const processedResult = await query(
      `SELECT bio, processed_at, updated_at 
       FROM external_data_processed 
       WHERE employee_id = $1`,
      [employeeId]
    );
    
    if (processedResult.rows.length === 0) {
      console.log('❌ No processed data found');
      console.log('💡 This means Gemini enrichment has not run yet');
      console.log('💡 Try calling: POST /api/external/collect/' + employeeId);
      console.log('💡 Or check Railway logs for enrichment errors');
    } else {
      const processed = processedResult.rows[0];
      console.log('✅ Processed data found:', {
        has_bio: !!processed.bio,
        bio_length: processed.bio ? processed.bio.length : 0,
        processed_at: processed.processed_at
      });
      if (processed.bio) {
        console.log('📝 Bio preview:', processed.bio.substring(0, 100) + '...');
      }
    }
    console.log('');

    // Step 4: Check projects
    console.log('4️⃣ Checking Projects...');
    const projectsResult = await query(
      `SELECT id, title, summary, source, created_at 
       FROM projects 
       WHERE employee_id = $1 AND source = 'gemini_ai'
       ORDER BY created_at DESC`,
      [employeeId]
    );
    
    if (projectsResult.rows.length === 0) {
      console.log('❌ No projects found');
    } else {
      console.log(`✅ Found ${projectsResult.rows.length} projects:`);
      projectsResult.rows.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title}`);
        console.log(`      Summary: ${p.summary?.substring(0, 60)}...`);
      });
    }
    console.log('');

    // Step 5: Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 Summary:');
    console.log(`   Token: ${tokenResult.rows.length > 0 ? '✅' : '❌'}`);
    console.log(`   Raw Data: ${rawDataResult.rows.length > 0 ? '✅' : '❌'}`);
    console.log(`   Raw Processed: ${rawData?.processed ? '✅' : '❌'}`);
    console.log(`   Processed Data: ${processedResult.rows.length > 0 ? '✅' : '❌'}`);
    console.log(`   Projects: ${projectsResult.rows.length} found`);
    console.log('═══════════════════════════════════════════════════════');

    // Recommendations
    if (rawDataResult.rows.length > 0 && !rawData.processed) {
      console.log('\n💡 Recommendation: Raw data exists but not processed');
      console.log('   Call: POST /api/external/collect/' + employeeId);
    } else if (rawDataResult.rows.length === 0) {
      console.log('\n💡 Recommendation: No raw data found');
      console.log('   Make sure GitHub is connected and call: POST /api/external/collect/' + employeeId);
    } else if (processedResult.rows.length === 0 && rawData.processed) {
      console.log('\n💡 Recommendation: Raw data marked as processed but no processed data found');
      console.log('   Check Railway logs for Gemini API errors');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// Get employee ID from command line or use test
const employeeId = process.argv[2] || process.env.TEST_EMPLOYEE_ID;

if (!employeeId) {
  console.error('❌ Please provide employee ID:');
  console.error('   node backend/scripts/check-github-gemini-flow.js <employeeId>');
  console.error('\nOr set TEST_EMPLOYEE_ID in .env');
  process.exit(1);
}

checkFlow(employeeId);

