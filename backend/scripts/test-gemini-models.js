// Test script to check which Gemini models are available
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDqDjF-Rfs85H3SBDE3_-JbTX2JxJmMcOQ';

async function listAvailableModels() {
  console.log('🔍 Checking available Gemini models...\n');
  
  // Try v1 API
  try {
    console.log('📡 Trying v1 API...');
    const v1Response = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );
    console.log('✅ v1 API - Available models:');
    v1Response.data.models?.forEach(model => {
      console.log(`  - ${model.name} (${model.supportedGenerationMethods?.join(', ') || 'N/A'})`);
    });
  } catch (error) {
    console.error('❌ v1 API Error:', error.response?.data || error.message);
  }
  
  console.log('\n');
  
  // Try v1beta API
  try {
    console.log('📡 Trying v1beta API...');
    const v1betaResponse = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    console.log('✅ v1beta API - Available models:');
    v1betaResponse.data.models?.forEach(model => {
      console.log(`  - ${model.name} (${model.supportedGenerationMethods?.join(', ') || 'N/A'})`);
    });
  } catch (error) {
    console.error('❌ v1beta API Error:', error.response?.data || error.message);
  }
  
  console.log('\n');
  
  // Try specific models
  const modelsToTest = [
    { name: 'gemini-pro', api: 'v1' },
    { name: 'gemini-1.5-flash', api: 'v1beta' },
    { name: 'gemini-1.5-pro', api: 'v1beta' },
    { name: 'gemini-1.5-flash-latest', api: 'v1beta' },
    { name: 'gemini-2.0-flash', api: 'v1beta' },
  ];
  
  console.log('🧪 Testing specific models...\n');
  for (const model of modelsToTest) {
    try {
      const apiBase = model.api === 'v1' 
        ? 'https://generativelanguage.googleapis.com/v1'
        : 'https://generativelanguage.googleapis.com/v1beta';
      
      const testResponse = await axios.post(
        `${apiBase}/models/${model.name}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: 'Say hello' }]
          }]
        },
        { timeout: 5000 }
      );
      
      if (testResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(`✅ ${model.name} (${model.api}) - WORKS!`);
      } else {
        console.log(`⚠️  ${model.name} (${model.api}) - Response but no text`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ ${model.name} (${model.api}) - NOT FOUND (404)`);
      } else {
        console.log(`❌ ${model.name} (${model.api}) - ERROR: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  }
}

listAvailableModels().catch(console.error);

