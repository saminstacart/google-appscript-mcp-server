#!/usr/bin/env node

/**
 * OAuth Setup Script for Google Apps Script API
 * This script helps you obtain a refresh token for your .env file
 */

import 'dotenv/config';
import { manualOAuthFlow } from './lib/oauth-helper.js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🔐 Google Apps Script API OAuth Setup');
console.log('=====================================\n');

async function setupOAuth() {
  console.log('📋 This script will help you set up OAuth authentication for Google Apps Script API.');
  console.log('📝 You need to have your CLIENT_ID and CLIENT_SECRET already configured in .env file.\n');
  
  try {
    // Check if .env file exists and has required credentials
    const envPath = '.env';
    let envContent = '';
    
    try {
      envContent = readFileSync(envPath, 'utf8');
      console.log('✅ Found .env file');
    } catch (error) {
      console.error('❌ No .env file found. Please create one first with your CLIENT_ID and CLIENT_SECRET.');
      console.log('\n📝 Example .env file content:');
      console.log('GOOGLE_APP_SCRIPT_API_CLIENT_ID=your_client_id_here');
      console.log('GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=your_client_secret_here');
      console.log('GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=your_refresh_token_here');
      process.exit(1);
    }
      // Check for required credentials
    const hasClientId = envContent.includes('GOOGLE_APP_SCRIPT_API_CLIENT_ID=') && 
                       !envContent.includes('GOOGLE_APP_SCRIPT_API_CLIENT_ID=your_client_id_here');
    const hasClientSecret = envContent.includes('GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=') && 
                           !envContent.includes('GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=your_client_secret_here');
    
    if (!hasClientId || !hasClientSecret) {
      console.error('❌ Missing CLIENT_ID or CLIENT_SECRET in .env file.');
      console.log('\n🔧 Please update your .env file with valid credentials:');
      console.log('   - GOOGLE_APP_SCRIPT_API_CLIENT_ID=your_actual_client_id');
      console.log('   - GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=your_actual_client_secret');
      console.log('\n📖 See OAUTH_SETUP.md for instructions on obtaining these credentials.');
      process.exit(1);
    }
    
    console.log('✅ Found required credentials in .env file');
    console.log('\n🚀 Starting OAuth flow...');
    console.log('📱 Your browser will open automatically');
    console.log('🔐 Please authorize the application when prompted');
    console.log('⏳ Waiting for authorization...\n');
    
    // Start OAuth flow
    const tokens = await manualOAuthFlow();
    
    if (tokens.refresh_token) {
      console.log('\n🎉 OAuth setup successful!');
      console.log('🔑 Refresh token obtained:', tokens.refresh_token.substring(0, 20) + '...');
      
      // Update .env file with refresh token
      let updatedEnvContent = envContent;
        if (updatedEnvContent.includes('GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=')) {
        // Replace existing refresh token
        updatedEnvContent = updatedEnvContent.replace(
          /GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=.*/,
          `GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=${tokens.refresh_token}`
        );
      } else {
        // Add refresh token
        updatedEnvContent += `\nGOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=${tokens.refresh_token}`;
      }
      
      try {
        writeFileSync(envPath, updatedEnvContent);
        console.log('✅ Updated .env file with refresh token');
      } catch (error) {
        console.error('❌ Failed to update .env file:', error.message);        console.log('\n📝 Please manually add this line to your .env file:');
        console.log(`GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=${tokens.refresh_token}`);
      }
      
      console.log('\n📋 Setup Summary:');
      console.log('   ✅ OAuth flow completed');
      console.log('   ✅ Refresh token obtained');
      console.log('   ✅ .env file updated');
      console.log('\n🎯 Next Steps:');
      console.log('   1. Test the OAuth setup: npm run test-oauth');
      console.log('   2. Use your MCP tools with confidence!');
      console.log('   3. The refresh token will be used automatically for future API calls');
      
    } else {
      console.log('\n⚠️ OAuth completed but no refresh token received.');
      console.log('🔄 You may need to revoke and re-authorize the application.');
      console.log('📖 Check the Google Cloud Console for your OAuth settings.');
    }
    
  } catch (error) {
    console.error('\n❌ OAuth setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify your CLIENT_ID and CLIENT_SECRET are correct');
    console.log('   3. Ensure the redirect URI is registered in Google Cloud Console');
    console.log('   4. Make sure Google Apps Script API is enabled');
    console.log('   5. Try revoking and re-creating your OAuth credentials');
    console.log('\n📖 For detailed setup instructions, see OAUTH_SETUP.md');
    process.exit(1);
  }
}

// Run setup if this script is executed directly
console.log('🔍 Debug: process.argv[1]:', process.argv[1]);
console.log('🔍 Debug: endsWith check:', process.argv[1] && process.argv[1].endsWith('oauth-setup.js'));

if (process.argv[1] && process.argv[1].endsWith('oauth-setup.js')) {
  console.log('🚀 Starting OAuth setup...');
  setupOAuth();
} else {
  console.log('❌ Script not executed directly, skipping setup');
}
