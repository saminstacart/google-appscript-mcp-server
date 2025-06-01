#!/usr/bin/env node

/**
 * Test script to verify MCP server tools are working with OAuth
 */

import { discoverTools } from './lib/tools.js';

async function testMCPTools() {
  console.log('🔍 Testing MCP Server Tools with OAuth...');
  console.log('═'.repeat(60));
  
  try {
    // Discover all available tools
    console.log('📋 Step 1: Discovering available tools...');
    const tools = await discoverTools();
    console.log(`✅ Found ${tools.length} tools`);
    
    // Find the get-content tool
    const getContentTool = tools.find(tool => 
      tool.definition.function.name === 'script_projects_get_content'
    );
    
    if (!getContentTool) {
      console.error('❌ script_projects_get_content tool not found!');
      console.log('Available tools:');
      tools.forEach(tool => {
        console.log(`  - ${tool.definition.function.name}`);
      });
      return;
    }
    
    console.log('✅ Found script_projects_get_content tool');
    
    // Test the tool with your script ID
    console.log('📋 Step 2: Testing script content fetch...');
    const scriptId = '1fSY7y3Rh84FsgJmrFIMm4AUOV3mPgelLRvZ4Dahrv68zyDzX-cGbeYjn';
    
    console.log(`🔍 Fetching content for script: ${scriptId}`);
    const result = await getContentTool.function({ scriptId });
    
    if (result.error) {
      console.error('❌ Error fetching content:', result.error);
    } else {
      console.log('✅ Successfully fetched script content!');
      console.log('📊 Content summary:');
      console.log(`  - Script ID: ${result.scriptId}`);
      console.log(`  - Number of files: ${result.files?.length || 0}`);
      
      if (result.files) {
        result.files.forEach((file, index) => {
          console.log(`  - File ${index + 1}: ${file.name} (${file.type})`);
        });
      }
      
      console.log('\n📄 Full content:');
      console.log(JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testMCPTools();
