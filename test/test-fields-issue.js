#!/usr/bin/env node

/**
 * Test the specific fields parameter issue found in the error analysis
 */

import { discoverTools } from './lib/tools.js';
import { logger } from './lib/logger.js';

const REAL_SCRIPT_ID = '1fSY7y3Rh84FsgJmrFIMm4AUOV3mPgelLRvZ4Dahrv68zyDzX-cGbeYjn';

async function testFieldsIssue() {
  console.log('🔍 Testing Specific Fields Parameter Issue\n');
  
  try {
    process.env.LOG_LEVEL = 'trace';
    
    const tools = await discoverTools();
    const processListTool = tools.find(tool => 
      tool.definition?.function?.name === 'script_processes_list'
    );
    
    console.log('🧪 Testing the problematic field that caused 400 error...');
    console.log('❌ This field caused an error: processes(processType,functionName,startTime,duration,status)');
    
    try {
      const result = await processListTool.function({
        scriptId: REAL_SCRIPT_ID,
        fields: 'processes(processType,functionName,startTime,duration,status)',
        pageSize: 3
      });
      console.log('✅ Unexpectedly succeeded!');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('❌ Confirmed error with "status" field:');
      console.log(`   ${error.message}`);
      
      if (error.message.includes('Cannot find matching fields for path')) {
        console.log('\n🔍 The issue is that "status" is not a valid field name.');
        console.log('📝 Let\'s try the correct field name: "processStatus"');
        
        try {
          const correctedResult = await processListTool.function({
            scriptId: REAL_SCRIPT_ID,
            fields: 'processes(processType,functionName,startTime,duration,processStatus)',
            pageSize: 3
          });
          console.log('✅ SUCCESS with corrected field name!');
          console.log(JSON.stringify(correctedResult, null, 2));
        } catch (correctedError) {
          console.log('❌ Still failed with corrected field name:');
          console.log(`   ${correctedError.message}`);
        }
      }
    }
    
    console.log('\n🔍 Testing other potential field name issues...');
    
    const fieldTests = [
      {
        description: 'All available fields',
        fields: 'processes(projectName,functionName,processType,processStatus,userAccessLevel,startTime,duration,runtimeVersion)'
      },
      {
        description: 'With nextPageToken',
        fields: 'processes,nextPageToken'
      },
      {
        description: 'Invalid field name test',
        fields: 'processes(invalidField)'
      },
      {
        description: 'Mixed valid/invalid fields',
        fields: 'processes(functionName,invalidField,processType)'
      }
    ];
    
    for (const test of fieldTests) {
      console.log(`\n📝 Testing: ${test.description}`);
      console.log(`   Fields: ${test.fields}`);
      
      try {
        const result = await processListTool.function({
          scriptId: REAL_SCRIPT_ID,
          fields: test.fields,
          pageSize: 2
        });
        console.log('   ✅ Success');
        console.log(`   📊 Returned ${Object.keys(result).length} top-level keys`);
        if (result.processes) {
          console.log(`   📊 ${result.processes.length} processes returned`);
          if (result.processes[0]) {
            console.log(`   📊 Process fields: ${Object.keys(result.processes[0]).join(', ')}`);
          }
        }
      } catch (error) {
        console.log('   ❌ Error:');
        console.log(`      ${error.message.substring(0, 100)}...`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFieldsIssue().catch(console.error);
