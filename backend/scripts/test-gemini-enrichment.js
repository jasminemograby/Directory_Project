// Test Gemini enrichment manually
// Usage: node backend/scripts/test-gemini-enrichment.js <employeeId>

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const profileEnrichmentService = require('../services/profileEnrichmentService');

async function testEnrichment(employeeId) {
  console.log('🧪 Testing Gemini Enrichment for employee:', employeeId);
  console.log('═══════════════════════════════════════════════════════\n');

  // Check GEMINI_API_KEY
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.error('💡 Make sure it\'s set in Railway environment variables');
    process.exit(1);
  }
  console.log('✅ GEMINI_API_KEY found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
  console.log('');

  try {
    console.log('🔄 Starting enrichment...');
    const result = await profileEnrichmentService.enrichProfile(employeeId);
    
    console.log('\n✅ Enrichment completed!');
    console.log('Results:');
    console.log('  - Bio:', result.bio ? `✅ (${result.bio.length} chars)` : '❌');
    console.log('  - Projects:', result.projects ? `✅ (${result.projects.length} projects)` : '❌');
    console.log('  - Skills:', result.skills ? `✅ (${result.skills.length} skills)` : '❌');
    
    if (result.bio) {
      console.log('\n📝 Bio preview:');
      console.log(result.bio.substring(0, 200) + '...');
    }
    
    if (result.projects && result.projects.length > 0) {
      console.log('\n📦 Projects:');
      result.projects.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.title}`);
        console.log(`     ${p.summary?.substring(0, 60)}...`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Enrichment failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
  
  process.exit(0);
}

const employeeId = process.argv[2];

if (!employeeId) {
  console.error('❌ Please provide employee ID:');
  console.error('   node backend/scripts/test-gemini-enrichment.js <employeeId>');
  process.exit(1);
}

testEnrichment(employeeId);

