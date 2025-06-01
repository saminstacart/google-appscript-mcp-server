/**
 * OAuth Authentication Helper for MCP Tools
 * Provides easy access to OAuth tokens with automatic refresh
 */

import { TokenManager } from './tokenManager.js';

/**
 * Get a valid OAuth access token for Google Apps Script API
 * This function handles token loading, validation, and refresh automatically
 * 
 * @param {string} clientId - OAuth client ID (from environment or config)
 * @param {string} clientSecret - OAuth client secret (from environment or config)
 * @returns {Promise<string>} Valid access token
 * @throws {Error} If no tokens are stored or refresh fails
 */
export async function getOAuthAccessToken(clientId, clientSecret) {
  if (!clientId || !clientSecret) {
    throw new Error('OAuth client ID and client secret are required. Please check your environment variables.');
  }

  const tokenManager = new TokenManager();
  
  try {
    const accessToken = await tokenManager.getValidAccessToken(clientId, clientSecret);
    return accessToken;
  } catch (error) {
    if (error.message.includes('No tokens found')) {
      throw new Error(
        'No OAuth tokens found. Please run the OAuth setup first:\n' +
        '  node oauth-setup.js\n\n' +
        'This will guide you through the OAuth authentication process and securely store your tokens.'
      );
    }
    
    if (error.message.includes('Token refresh failed')) {
      throw new Error(
        'Failed to refresh OAuth token. This might happen if:\n' +
        '  - Your OAuth credentials have been revoked\n' +
        '  - Your client secret has changed\n' +
        '  - There are network connectivity issues\n\n' +
        'Please try running the OAuth setup again:\n' +
        '  node oauth-setup.js --force'
      );
    }
    
    throw error;
  }
}

/**
 * Create Authorization header for Google API requests
 * 
 * @param {string} clientId - OAuth client ID
 * @param {string} clientSecret - OAuth client secret
 * @returns {Promise<Object>} Authorization headers object
 */
export async function getAuthHeaders(clientId, clientSecret) {
  const accessToken = await getOAuthAccessToken(clientId, clientSecret);
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Check if OAuth tokens are available and valid
 * 
 * @returns {boolean} True if tokens are available
 */
export function hasOAuthTokens() {
  const tokenManager = new TokenManager();
  return tokenManager.hasStoredTokens();
}

/**
 * Get token information for debugging/status
 * 
 * @returns {Object} Token status information
 */
export function getTokenStatus() {
  const tokenManager = new TokenManager();
  return tokenManager.getTokenInfo();
}

/**
 * Clear stored OAuth tokens (for logout/reset)
 */
export function clearOAuthTokens() {
  const tokenManager = new TokenManager();
  tokenManager.clearTokens();
}

export default {
  getOAuthAccessToken,
  getAuthHeaders,
  hasOAuthTokens,
  getTokenStatus,
  clearOAuthTokens
};
