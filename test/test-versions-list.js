#!/usr/bin/env node

import 'dotenv/config';
import { apiTool } from './tools/google-app-script-api/apps-script-api/script-projects-versions-list.js';

async function testVersionsList() {
  const scriptId = '1fSY7y3Rh84FsgJmrFIMm4AUOV3mPgelLRvZ4Dahrv68zyDzX-cGbeYjn';
  
  console.log('📋 Listing versions for script:', scriptId);
  console.log('═'.repeat(80));
  
  try {
    const result = await apiTool.function({ scriptId });
    
    if (result.error) {
      console.log('❌ Error occurred:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('✅ Script versions retrieved successfully:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.versions && result.versions.length > 0) {
        console.log('\n📊 Summary:');
        console.log('Total versions:', result.versions.length);
        console.log('\n📝 Version details:');
        result.versions.forEach((version, index) => {
          console.log(`${index + 1}. Version ${version.versionNumber}`);
          console.log(`   Description: ${version.description || 'No description'}`);
          console.log(`   Created: ${version.createTime || 'Unknown'}`);
          console.log('');
        });
      } else {
        console.log('No versions found for this script.');
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testVersionsList();
