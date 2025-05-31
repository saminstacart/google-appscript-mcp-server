/**
 * OAuth authentication helper for Google Apps Script API
 */

import 'dotenv/config';
import { google } from 'googleapis';
import { createServer } from 'http';
import open from 'open';
import { URL } from 'url';
import { createConnection } from 'net';

// Configuration - Comprehensive scopes for all Google APIs
const SCOPES = [
  // Google Apps Script API - Full access
  'https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/script.projects.readonly',
  'https://www.googleapis.com/auth/script.deployments',
  'https://www.googleapis.com/auth/script.deployments.readonly',
  'https://www.googleapis.com/auth/script.metrics',
  'https://www.googleapis.com/auth/script.processes',
  'https://www.googleapis.com/auth/script.webapp.deploy',
  
  // Google Drive API - For file operations
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  
  // Google Sheets API
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  
  // Google Docs API
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  
  // Gmail API
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  
  // Google Calendar API
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.readonly',
  
  // Google Cloud APIs
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/cloud-platform.read-only',
  
  // Universal access for other Google services
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

const REDIRECT_URI = 'http://localhost:3001/oauth/callback';
const PORT = 3001;

// Token storage (in production, use a secure database)
let tokens = null;

/**
 * Finds an available port starting from the given port
 * @param {number} startPort - Port to start checking from
 * @returns {Promise<number>} Available port number
 */
async function findAvailablePort(startPort = PORT) {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
    
    server.on('error', () => {
      findAvailablePort(startPort + 1).then(resolve);
    });
  });
}

/**
 * Creates and configures OAuth2 client
 * @returns {OAuth2Client} Configured OAuth2 client
 */
function createOAuth2Client() {
  const clientId = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing required OAuth credentials: GOOGLE_APP_SCRIPT_API_CLIENT_ID and GOOGLE_APP_SCRIPT_API_CLIENT_SECRET must be set in environment variables');
  }

  console.log('🔐 Creating OAuth2 client...');
  console.log('   - Client ID:', clientId);
  console.log('   - Redirect URI:', REDIRECT_URI);
  console.log('   - Scopes:', SCOPES.length, 'permissions');

  return new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
}

/**
 * Starts OAuth flow with browser automation
 * @returns {Promise<Object>} OAuth tokens
 */
async function startOAuthFlow() {
  console.log('🚀 Starting OAuth flow...');
  
  const oAuth2Client = createOAuth2Client();
  
  return new Promise(async (resolve, reject) => {
    try {
      // Use the exact port that matches Google Cloud Console configuration
      const callbackPort = PORT; // Must match Google Cloud Console redirect URI
      
      console.log(`🌐 Starting OAuth callback server on port ${callbackPort}`);
      console.log(`🔗 Redirect URI: ${REDIRECT_URI}`);
      
      // Create temporary HTTP server for OAuth callback
      const server = createServer(async (req, res) => {
        console.log('📥 OAuth callback received:', req.url);
        
        try {
          const url = new URL(req.url, `http://localhost:${callbackPort}`);
          
          if (url.pathname === '/oauth/callback') {
            const code = url.searchParams.get('code');
            const error = url.searchParams.get('error');
            
            if (error) {
              console.error('❌ OAuth error:', error);
              res.writeHead(400, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
                    <h2 style="color: #dc3545;">❌ Authentication Failed</h2>
                    <p>Error: ${error}</p>
                    <p>You can close this window.</p>
                  </body>
                </html>
              `);
              server.close();
              reject(new Error(`OAuth error: ${error}`));
              return;
            }
            
            if (!code) {
              console.error('❌ No authorization code received');
              res.writeHead(400, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
                    <h2 style="color: #dc3545;">❌ No Authorization Code</h2>
                    <p>No authorization code received from Google.</p>
                    <p>You can close this window.</p>
                  </body>
                </html>
              `);
              server.close();
              reject(new Error('No authorization code received'));
              return;
            }
            
            console.log('🔄 Exchanging authorization code for tokens...');
            console.log('🔑 Authorization code:', code.substring(0, 20) + '...');
            
            try {
              const { tokens: newTokens } = await oAuth2Client.getToken(code);
              tokens = newTokens;
              
              console.log('✅ Token exchange successful!');
              console.log('🎟️ Token details:');
              console.log('   - Access token:', newTokens.access_token ? '✅ Received' : '❌ Missing');
              console.log('   - Refresh token:', newTokens.refresh_token ? '✅ Received' : '❌ Missing');
              console.log('   - Token type:', newTokens.token_type || 'Not specified');
              console.log('   - Expires in:', newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : 'No expiry');
              console.log('   - Scope:', newTokens.scope || 'Not specified');
              
              // Success response
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
                    <h2 style="color: #28a745;">✅ Authentication Successful!</h2>
                    <p>You have been successfully authenticated with Google Apps Script API.</p>
                    <p><strong>Access Token:</strong> ${newTokens.access_token ? 'Received ✅' : 'Missing ❌'}</p>
                    <p><strong>Refresh Token:</strong> ${newTokens.refresh_token ? 'Received ✅' : 'Missing ❌'}</p>
                    <p><strong>You can now close this window and return to your application.</strong></p>
                    <script>
                      setTimeout(() => {
                        window.close();
                      }, 5000);
                    </script>
                  </body>
                </html>
              `);
              
              server.close();
              resolve(newTokens);
              
            } catch (tokenError) {
              console.error('❌ Error exchanging code for tokens:', tokenError);
              res.writeHead(500, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
                    <h2 style="color: #dc3545;">❌ Token Exchange Failed</h2>
                    <p>Failed to exchange authorization code for tokens.</p>
                    <pre style="text-align: left; background: #f8f9fa; padding: 20px;">${tokenError.message}</pre>
                    <p>You can close this window.</p>
                  </body>
                </html>
                `);
              server.close();
              reject(tokenError);
            }
          } else {
            // Handle other paths
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          }
        } catch (err) {
          console.error('❌ Server error:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          server.close();
          reject(err);
        }
      });

      // Start server on the specific port
      server.listen(callbackPort, () => {
        console.log(`🌐 OAuth callback server started on port ${callbackPort}`);
        
        // Generate authorization URL
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
          prompt: 'consent'
        });
        
        console.log('🔗 Opening OAuth URL in browser...');
        console.log('📋 OAuth URL:', authUrl);
        
        // Open browser
        open(authUrl).catch(err => {
          console.error('❌ Failed to open browser:', err);
          console.log('🔗 Please manually open this URL in your browser:');
          console.log(authUrl);
        });
      });

      // Handle server errors
      server.on('error', (err) => {
        console.error('❌ Server error:', err);
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${callbackPort} is already in use. Please close other applications using this port or update your Google Cloud Console redirect URI to use a different port.`));
        } else {
          reject(err);
        }
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('OAuth flow timed out after 5 minutes'));
      }, 5 * 60 * 1000);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Gets an OAuth access token using refresh token or starting OAuth flow
 * @returns {Promise<string>} Access token
 */
export async function getOAuthAccessToken() {
  console.log('🔐 Getting OAuth access token...');
  
  const clientId = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN;

  if (!clientId || !clientSecret) {
    throw new Error('Missing required OAuth credentials: GOOGLE_APP_SCRIPT_API_CLIENT_ID and GOOGLE_APP_SCRIPT_API_CLIENT_SECRET must be set in environment variables');
  }

  try {
    // Try to use refresh token first
    if (refreshToken && refreshToken !== 'your_refresh_token_here') {
      console.log('🔄 Using refresh token to get access token...');
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        const errorDetails = {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          error: errorData.error,
          error_description: errorData.error_description,
          error_uri: errorData.error_uri
        };
        console.error('❌ Refresh token failed:', errorDetails);
        console.log('🔄 Refresh token expired or invalid, starting new OAuth flow...');
        
        // If refresh token fails, start new OAuth flow
        const newTokens = await startOAuthFlow();
        tokens = newTokens;
        return newTokens.access_token;
      }

      const tokenData = await tokenResponse.json();
      console.log('✅ Access token refreshed successfully');
      return tokenData.access_token;
    } else {
      console.log('🔄 No valid refresh token found, starting OAuth flow...');
      
      // No refresh token, start interactive OAuth flow
      const newTokens = await startOAuthFlow();
      tokens = newTokens;
      
      // Suggest updating .env file with refresh token
      if (newTokens.refresh_token) {
        console.log('💡 Suggestion: Update your .env file with the refresh token for future use:');
        console.log(`GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=${newTokens.refresh_token}`);
      }
      
      return newTokens.access_token;
    }
  } catch (error) {
    console.error('❌ OAuth authentication error:', error);
    throw new Error(`OAuth authentication failed: ${error.message}`);
  }
}

/**
 * Helper function to get authorization headers for API requests
 * @returns {Promise<Object>} Headers object with Authorization
 */
export async function getAuthHeaders() {
  console.log('📋 Creating authorization headers...');
  const accessToken = await getOAuthAccessToken();
  
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  
  console.log('✅ Authorization headers created successfully');
  return headers;
}

/**
 * Manually trigger OAuth flow (useful for testing)
 * @returns {Promise<Object>} OAuth tokens
 */
export async function manualOAuthFlow() {
  console.log('🔄 Starting manual OAuth flow...');
  return await startOAuthFlow();
}

/**
 * Check if we have valid tokens
 * @returns {boolean} True if tokens are available
 */
export function hasValidTokens() {
  const refreshToken = process.env.GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN;
  return tokens || (refreshToken && refreshToken !== 'your_refresh_token_here');
}

/**
 * Clear stored tokens (logout)
 */
export function clearTokens() {
  console.log('🚪 Clearing stored tokens...');
  tokens = null;
  console.log('✅ Tokens cleared successfully');
}

/**
 * Get current token information (for debugging)
 * @returns {Object|null} Current token info (access token hidden for security)
 */
export function getTokenInfo() {
  if (!tokens) {
    return null;
  }
  
  return {
    hasAccessToken: !!tokens.access_token,
    hasRefreshToken: !!tokens.refresh_token,
    tokenType: tokens.token_type,
    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    scope: tokens.scope
  };
}
