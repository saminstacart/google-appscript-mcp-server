// Test script to verify MCP version creation works
import { apiTool } from './tools/google-app-script-api/apps-script-api/script-projects-versions-create.js';

const scriptId = '1fSY7y3Rh84FsgJmrFIMm4AUOV3mPgelLRvZ4Dahrv68zyDzX-cGbeYjn';

async function testVersionCreation() {
  console.log('🧪 Testing MCP version creation...');
  
  try {
    const result = await apiTool.function({
      scriptId: scriptId,
      description: 'Test version creation via MCP tools'
    });
    
    console.log('✅ Version creation result:', JSON.stringify(result, null, 2));
    
    if (result.versionNumber) {
      console.log('🎉 Version created successfully!');
      console.log(`📊 Version Number: ${result.versionNumber}`);
    } else {
      console.log('❌ Version creation failed:', result);
    }
    
  } catch (error) {
    console.error('💥 Error during version creation:', error);
  }
}

testVersionCreation();
