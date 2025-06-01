#!/usr/bin/env node

/**
 * OAuth Setup Script for Google Apps Script API
 * This script helps you obtain and securely store OAuth tokens
 * Enhanced with detailed logging for debugging and monitoring
 */

import 'dotenv/config';
import { manualOAuthFlow } from './lib/oauth-helper.js';
import { TokenManager } from './lib/tokenManager.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os';

// Enhanced logging utilities
const log = {
  info: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️  ${msg}`);
    if (data) console.log(`[${timestamp}] 📊 Data:`, data);
  },
  success: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ ${msg}`);
    if (data) console.log(`[${timestamp}] 📊 Data:`, data);
  },
  error: (msg, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ${msg}`);
    if (error) {
      console.error(`[${timestamp}] 🐛 Error details:`, error.message);
      if (error.stack) console.error(`[${timestamp}] 📚 Stack trace:`, error.stack);
    }
  },
  warn: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️  ${msg}`);
    if (data) console.warn(`[${timestamp}] 📊 Data:`, data);
  },
  debug: (msg, data = null) => {
    if (process.env.DEBUG || process.argv.includes('--debug')) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🔍 DEBUG: ${msg}`);
      if (data) console.log(`[${timestamp}] 🔍 DEBUG Data:`, JSON.stringify(data, null, 2));
    }
  },
  step: (step, total, msg) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🚀 Step ${step}/${total}: ${msg}`);
  },
  separator: () => {
    console.log('═'.repeat(80));
  },
  subseparator: () => {
    console.log('─'.repeat(60));
  }
};

// Performance timing utility
class Timer {
  constructor(name) {
    this.name = name;
    this.start = Date.now();
    log.debug(`Timer started: ${name}`);
  }
  
  lap(description) {
    const elapsed = Date.now() - this.start;
    log.debug(`Timer ${this.name} - ${description}: ${elapsed}ms`);
    return elapsed;
  }
  
  end(description = 'completed') {
    const elapsed = Date.now() - this.start;
    log.info(`Timer ${this.name} ${description} in ${elapsed}ms`);
    return elapsed;
  }
}

// System information logging
function logSystemInfo() {
  log.separator();
  log.info('📋 System Information');
  log.subseparator();
  
  const systemInfo = {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    workingDirectory: process.cwd(),
    scriptPath: fileURLToPath(import.meta.url),
    arguments: process.argv.slice(2),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };
  
  Object.entries(systemInfo).forEach(([key, value]) => {
    log.info(`  ${key}: ${value}`);
  });
  
  log.subseparator();
}

// Environment validation with detailed logging
function validateEnvironment() {
  const timer = new Timer('Environment Validation');
  log.step(1, 8, 'Validating environment configuration');
  
  const envVars = {
    'GOOGLE_APP_SCRIPT_API_CLIENT_ID': process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID,
    'GOOGLE_APP_SCRIPT_API_CLIENT_SECRET': process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET,
    'GOOGLE_APP_SCRIPT_API_REDIRECT_URI': process.env.GOOGLE_APP_SCRIPT_API_REDIRECT_URI
  };
  
  log.debug('Environment variables loaded:', {
    hasClientId: !!envVars.GOOGLE_APP_SCRIPT_API_CLIENT_ID,
    hasClientSecret: !!envVars.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET,
    hasRedirectUri: !!envVars.GOOGLE_APP_SCRIPT_API_REDIRECT_URI,
    clientIdLength: envVars.GOOGLE_APP_SCRIPT_API_CLIENT_ID?.length || 0,
    clientSecretLength: envVars.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET?.length || 0
  });
  
  const validation = {
    hasClientId: !!envVars.GOOGLE_APP_SCRIPT_API_CLIENT_ID && 
                 envVars.GOOGLE_APP_SCRIPT_API_CLIENT_ID !== 'your_client_id_here',
    hasClientSecret: !!envVars.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET && 
                     envVars.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET !== 'your_client_secret_here',
    hasRedirectUri: !!envVars.GOOGLE_APP_SCRIPT_API_REDIRECT_URI
  };
  
  log.info('Environment validation results:', validation);
  
  if (!validation.hasClientId) {
    log.error('Missing or invalid CLIENT_ID in environment');
    throw new Error('GOOGLE_APP_SCRIPT_API_CLIENT_ID is required');
  }
  
  if (!validation.hasClientSecret) {
    log.error('Missing or invalid CLIENT_SECRET in environment');
    throw new Error('GOOGLE_APP_SCRIPT_API_CLIENT_SECRET is required');
  }
  
  if (!validation.hasRedirectUri) {
    log.warn('No REDIRECT_URI specified, using default');
  }
  
  timer.end();
  log.success('Environment validation completed successfully');
  return envVars;
}

// File system operations with detailed logging
function validateEnvFile() {
  const timer = new Timer('Env File Validation');
  log.step(2, 8, 'Validating .env file');
  
  const envPath = '.env';
  let envContent = '';
  
  try {
    log.debug(`Reading .env file from: ${envPath}`);
    envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim() && !line.trim().startsWith('#'));
    
    log.success('Successfully read .env file', {
      totalLines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      fileSize: envContent.length
    });
    
    // Analyze .env file content
    const envAnalysis = {
      hasClientId: envContent.includes('GOOGLE_APP_SCRIPT_API_CLIENT_ID='),
      hasClientSecret: envContent.includes('GOOGLE_APP_SCRIPT_API_CLIENT_SECRET='),
      hasRedirectUri: envContent.includes('GOOGLE_APP_SCRIPT_API_REDIRECT_URI='),
      hasComments: envContent.includes('#'),
      hasPlaceholders: envContent.includes('your_client_id_here') || envContent.includes('your_client_secret_here')
    };
    
    log.debug('Env file analysis:', envAnalysis);
    
    if (envAnalysis.hasPlaceholders) {
      log.warn('Found placeholder values in .env file - these need to be replaced with actual credentials');
    }
    
  } catch (error) {
    log.error('Failed to read .env file', error);
    log.info('Expected .env file location:', process.cwd() + '/.env');
    log.info('Please create .env file with required credentials');
    throw error;
  }
  
  timer.end();
  return envContent;
}

// Token management with detailed logging
function analyzeExistingTokens(tokenManager) {
  const timer = new Timer('Token Analysis');
  log.step(3, 8, 'Analyzing existing tokens');
  
  try {
    const tokenInfo = tokenManager.getTokenInfo();
    
    log.debug('Token analysis started');
    log.info('Token information retrieved:', {
      hasTokens: tokenInfo.hasTokens,
      location: tokenInfo.location,
      savedAt: tokenInfo.savedAt,
      expiresAt: tokenInfo.expiresAt,
      status: tokenInfo.status,
      isExpired: tokenInfo.isExpired
    });
    
    if (tokenInfo.hasTokens) {
      log.success('Found existing tokens');
      
      if (tokenInfo.isExpired) {
        log.warn('Existing tokens are expired');
      } else {
        log.success('Existing tokens are still valid');
      }
        // Additional token validation
      try {
        const tokenData = tokenManager.loadTokens();
        if (tokenData) {
          log.debug('Token data structure validation:', {
            hasAccessToken: !!tokenData.access_token,
            hasRefreshToken: !!tokenData.refresh_token,
            hasTokenType: !!tokenData.token_type,
            hasScope: !!tokenData.scope,
            expiresIn: tokenData.expires_in
          });
        }
      } catch (tokenError) {
        log.warn('Could not validate token data structure', tokenError);
      }
    } else {
      log.info('No existing tokens found');
    }
    
    timer.end();
    return tokenInfo;
    
  } catch (error) {
    log.error('Failed to analyze existing tokens', error);
    timer.end();
    throw error;
  }
}

// OAuth flow with enhanced logging
async function executeOAuthFlow() {
  const timer = new Timer('OAuth Flow');
  log.step(4, 8, 'Starting OAuth authorization flow');
  
  try {
    log.info('Initiating manual OAuth flow');
    log.debug('OAuth flow configuration:', {
      clientId: process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID?.substring(0, 10) + '...',
      redirectUri: process.env.GOOGLE_APP_SCRIPT_API_REDIRECT_URI,
      scope: 'https://www.googleapis.com/auth/script.projects'
    });
    
    log.info('🌐 Opening browser for OAuth authorization...');
    log.info('📱 Please complete the authorization in your browser');
    log.info('⏳ Waiting for OAuth callback...');
    
    const tokens = await manualOAuthFlow();
    
    log.debug('OAuth flow completed, analyzing response');
    const tokenAnalysis = {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      hasTokenType: !!tokens.token_type,
      hasScope: !!tokens.scope,
      hasExpiresIn: !!tokens.expires_in,
      accessTokenLength: tokens.access_token?.length || 0,
      refreshTokenLength: tokens.refresh_token?.length || 0,
      tokenType: tokens.token_type,
      scope: tokens.scope,
      expiresIn: tokens.expires_in
    };
    
    log.success('OAuth tokens received', tokenAnalysis);
    
    if (!tokens.refresh_token) {
      log.error('No refresh token received - this is required for long-term access');
      throw new Error('Refresh token missing from OAuth response');
    }
    
    timer.end();
    return tokens;
    
  } catch (error) {
    log.error('OAuth flow failed', error);
    timer.end();
    throw error;
  }
}

// Token storage with detailed logging
function saveTokensSecurely(tokenManager, tokens) {
  const timer = new Timer('Token Storage');
  log.step(5, 8, 'Saving tokens securely');
  
  try {
    log.debug('Preparing to save tokens');
    log.info('Token storage location:', tokenManager.getTokenInfo().location);
    
    // Pre-save validation
    const preValidation = {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      tokenManagerReady: !!tokenManager
    };
    
    log.debug('Pre-save validation:', preValidation);
    
    if (!preValidation.hasAccessToken || !preValidation.hasRefreshToken) {
      throw new Error('Invalid token data - missing required tokens');
    }
    
    log.info('💾 Writing tokens to secure storage...');
    tokenManager.saveTokens(tokens);
    
    // Post-save verification
    const verification = tokenManager.getTokenInfo();
    log.success('Tokens saved successfully', {
      location: verification.location,
      hasTokens: verification.hasTokens,
      savedAt: verification.savedAt,
      status: verification.status
    });
      // Additional verification - try to read back the tokens
    try {
      const savedTokens = tokenManager.loadTokens();
      const verificationCheck = {
        canReadBack: !!savedTokens,
        accessTokenMatches: savedTokens?.access_token === tokens.access_token,
        refreshTokenMatches: savedTokens?.refresh_token === tokens.refresh_token
      };
      
      log.debug('Token verification check:', verificationCheck);
      
      if (!verificationCheck.canReadBack) {
        throw new Error('Cannot read back saved tokens');
      }
      
      if (!verificationCheck.accessTokenMatches || !verificationCheck.refreshTokenMatches) {
        log.warn('Saved tokens do not match original tokens');
      } else {
        log.success('Token integrity verified');
      }
      
    } catch (verificationError) {
      log.warn('Could not verify saved tokens', verificationError);
    }
    
    timer.end();
    return verification;
    
  } catch (error) {
    log.error('Failed to save tokens securely', error);
    timer.end();
    throw error;
  }
}

// Main setup function with comprehensive logging
async function setupOAuth() {
  const mainTimer = new Timer('Complete OAuth Setup');
  
  log.separator();
  log.info('🔐 Google Apps Script API OAuth Setup - Enhanced Logging Version');
  log.separator();
  
  // Log system information
  logSystemInfo();
  
  try {
    log.info('📋 Starting OAuth setup process...');
    log.info('📝 This script will guide you through OAuth authentication setup');
    
    // Initialize token manager
    log.step(0, 8, 'Initializing token manager');
    const tokenManager = new TokenManager();
    log.success('Token manager initialized');
    
    // Handle command line arguments
    const args = process.argv.slice(2);
    log.debug('Command line arguments:', args);
    
    // Handle info command
    if (args.includes('--info')) {
      log.info('📊 Information mode requested');
      const tokenInfo = analyzeExistingTokens(tokenManager);
      
      console.log('\n🔍 Token Information Summary:');
      console.log('═'.repeat(40));
      
      if (tokenInfo.hasTokens) {
        console.log('✅ Status: Tokens found');
        console.log(`📁 Location: ${tokenInfo.location}`);
        console.log(`💾 Saved: ${tokenInfo.savedAt}`);
        console.log(`⏰ Expires: ${tokenInfo.expiresAt}`);
        console.log(`📊 Status: ${tokenInfo.status}`);
        console.log(`🔐 Scope: ${tokenInfo.scope || 'Not specified'}`);
      } else {
        console.log('❌ Status: No tokens found');
        console.log(`📁 Expected location: ${tokenInfo.location}`);
        console.log('\n💡 Run "node oauth-setup.js" to set up OAuth tokens');
      }
      
      mainTimer.end('info command completed');
      process.exit(0);
    }
    
    // Handle clear command
    if (args.includes('--clear')) {
      log.info('🗑️ Clear tokens mode requested');
      const tokenInfo = analyzeExistingTokens(tokenManager);
      
      if (tokenInfo.hasTokens) {
        log.info('Clearing existing tokens...');
        tokenManager.clearTokens();
        log.success('Tokens cleared successfully');
      } else {
        log.info('No tokens found to clear');
      }
      
      mainTimer.end('clear command completed');
      process.exit(0);
    }
    
    // Validate environment
    const envVars = validateEnvironment();
    const envContent = validateEnvFile();
    
    // Analyze existing tokens
    const tokenInfo = analyzeExistingTokens(tokenManager);
    
    // Check if we should proceed with OAuth flow
    if (tokenInfo.hasTokens && !tokenInfo.isExpired && !args.includes('--force')) {
      log.success('Valid tokens already exist');
      console.log('\n✅ You already have valid OAuth tokens stored.');
      console.log('💡 To force new token generation: node oauth-setup.js --force');
      console.log('🗑️ To clear existing tokens: node oauth-setup.js --clear');
      console.log('📊 To view token info: node oauth-setup.js --info');
      
      mainTimer.end('setup skipped - valid tokens exist');
      process.exit(0);
    }
    
    if (tokenInfo.hasTokens && args.includes('--force')) {
      log.warn('Force mode enabled - will replace existing tokens');
    }
    
    // Execute OAuth flow
    const tokens = await executeOAuthFlow();
    
    // Save tokens securely
    const saveResult = saveTokensSecurely(tokenManager, tokens);
    
    // Final verification and success message
    log.step(6, 8, 'Performing final verification');
    const finalVerification = analyzeExistingTokens(tokenManager);
    
    if (finalVerification.hasTokens && !finalVerification.isExpired) {
      log.success('Final verification passed - OAuth setup completed successfully');
    } else {
      log.error('Final verification failed');
      throw new Error('Setup completed but final verification failed');
    }
    
    // Success summary
    log.step(7, 8, 'Generating setup summary');
    log.separator();
    log.success('🎉 OAuth Setup Completed Successfully!');
    log.subseparator();
    
    const summary = {
      tokenLocation: saveResult.location,
      setupDuration: mainTimer.end('setup completed'),
      tokenStatus: finalVerification.status,
      nextSteps: [
        'Test your setup: node test-token-management.js',
        'Run MCP server: node mcpServer.js',
        'Check token info: node oauth-setup.js --info'
      ]
    };
    
    log.info('Setup Summary:', summary);
    
    console.log('\n🎉 Setup Complete! Next Steps:');
    summary.nextSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
    
    log.step(8, 8, 'OAuth setup process completed');
    
  } catch (error) {
    log.error('OAuth setup failed', error);
    
    console.log('\n🔧 Troubleshooting Guide:');
    console.log('════════════════════════');
    console.log('1. 🌐 Check your internet connection');
    console.log('2. 🔑 Verify CLIENT_ID and CLIENT_SECRET are correct');
    console.log('3. 🔗 Ensure redirect URI is registered in Google Cloud Console');
    console.log('4. 🔌 Confirm Google Apps Script API is enabled');
    console.log('5. 🔄 Try revoking and re-creating OAuth credentials');
    console.log('6. 🐛 Enable debug mode: node oauth-setup.js --debug');
    console.log('\n📖 For detailed instructions, see OAUTH_SETUP.md');
    
    mainTimer.end('setup failed');
    process.exit(1);
  }
}

// Error handling and execution
setupOAuth().catch((error) => {
  log.error('💥 Unexpected error during setup', error);
  console.error('\n🚨 Critical Error Details:');
  console.error('Message:', error.message);
  if (error.stack) {
    console.error('Stack:', error.stack);
  }
  process.exit(1);
});