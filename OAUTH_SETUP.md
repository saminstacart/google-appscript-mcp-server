# Google Apps Script API OAuth Setup Guide

This guide will help you set up OAuth authentication for the Google Apps Script API MCP server.

## Prerequisites

1. **Google Cloud Project**: You need a Google Cloud Project with Google Apps Script API enabled
2. **OAuth 2.0 Credentials**: You need Client ID and Client Secret from Google Cloud Console
3. **Node.js**: Make sure you have Node.js 16+ installed

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 1.2 Enable Google Apps Script API
1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Apps Script API"
3. Click on it and press **Enable**

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you're in a Google Workspace organization)
   - Fill in the required fields:
     - App name: "Google Apps Script MCP Server"
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes (optional for testing):
     - `https://www.googleapis.com/auth/script.projects`
     - `https://www.googleapis.com/auth/script.projects.readonly`
     - `https://www.googleapis.com/auth/script.deployments.readonly`
     - `https://www.googleapis.com/auth/script.metrics`
4. For Application Type, choose **Web application**
5. Add authorized redirect URIs:
   - `http://localhost:3001/oauth/callback`
6. Click **Create**
7. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

### 2.1 Update .env File
Edit the `.env` file in your project root and add your credentials:

```env
# Google Apps Script API OAuth Configuration
GOOGLE_APP_SCRIPT_API_CLIENT_ID=your_client_id_here
GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=your_client_secret_here
GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=your_refresh_token_here

# OAuth Configuration
GOOGLE_APP_SCRIPT_API_REDIRECT_URI=http://localhost:3001/oauth/callback
```

Replace:
- `your_client_id_here` with your actual Client ID
- `your_client_secret_here` with your actual Client Secret
- Keep `your_refresh_token_here` as is (we'll get this in the next step)

## Step 3: Run OAuth Setup

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Run OAuth Setup Script
```bash
npm run setup-oauth
```

This script will:
1. Validate your credentials
2. Open your browser for OAuth authorization
3. Handle the OAuth callback
4. Automatically update your `.env` file with the refresh token

### 3.3 Authorize the Application
1. Your browser will open automatically
2. Sign in to your Google account
3. Review and accept the permissions
4. The browser will show a success message
5. Return to your terminal - the setup should be complete

## Step 4: Test Your Setup

### 4.1 Run OAuth Test
```bash
npm run test-oauth
```

This will verify that your OAuth setup is working correctly.

### 4.2 Test with MCP Client
You can now use your MCP tools with any MCP-compatible client like:
- Claude Desktop
- Postman
- Other MCP clients

## Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch" Error
- Make sure you added `http://localhost:3001/oauth/callback` to your authorized redirect URIs in Google Cloud Console
- Check that the URI is exactly correct (no trailing slash, correct port)

#### 2. "access_denied" Error
- Make sure you're signed in to the correct Google account
- Check that the OAuth consent screen is properly configured
- Verify that the Google Apps Script API is enabled

#### 3. "invalid_client" Error
- Double-check your Client ID and Client Secret in the `.env` file
- Make sure there are no extra spaces or quotes around the values

#### 4. Port Already in Use
- Make sure port 3001 is not being used by another application
- If needed, you can modify the port in `lib/oauth-helper.js` and update your redirect URI accordingly

#### 5. Refresh Token Not Saved
- Make sure the OAuth setup script has write permissions to the `.env` file
- Check that the `.env` file exists and is in the correct location

### Advanced Configuration

#### Custom Port
If you need to use a different port, update these files:
1. `lib/oauth-helper.js` - Change the `PORT` constant
2. `.env` - Update `GOOGLE_APP_SCRIPT_API_REDIRECT_URI`
3. Google Cloud Console - Update the authorized redirect URI

#### Custom Scopes
To modify the required permissions, edit the `SCOPES` array in `lib/oauth-helper.js`.

Available scopes:
- `https://www.googleapis.com/auth/script.projects` - Read/write access to Apps Script projects
- `https://www.googleapis.com/auth/script.projects.readonly` - Read-only access to Apps Script projects
- `https://www.googleapis.com/auth/script.deployments.readonly` - Read access to Apps Script deployments
- `https://www.googleapis.com/auth/script.metrics` - Access to Apps Script execution metrics

## Security Notes

1. **Keep your credentials secure**: Never commit your `.env` file to version control
2. **Refresh token**: The refresh token allows long-term access - treat it like a password
3. **Client secret**: Keep your client secret confidential
4. **Production use**: For production, consider using more secure token storage than environment variables

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the Google Apps Script API documentation
3. Check Google Cloud Console for any error messages
4. Ensure all prerequisites are met

For more information about Google Apps Script API:
- [Google Apps Script API Documentation](https://developers.google.com/apps-script/api)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
2. Google Apps Script API enabled
3. OAuth 2.0 credentials configured

## Step 1: Create OAuth 2.0 Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Select **Desktop application** as the application type
6. Give it a name (e.g., "Google Apps Script MCP Client")
7. Click **Create**
8. Download the JSON file containing your credentials

## Step 2: Enable Required APIs

Make sure the following APIs are enabled in your GCP project:

1. Google Apps Script API
2. Google Drive API (if accessing script files)

To enable APIs:
1. Go to **APIs & Services** > **Library**
2. Search for each API and click **Enable**

## Step 3: Get a Refresh Token

You'll need to obtain a refresh token through the OAuth 2.0 flow. Here's a simple way to do it:

### Option A: Using Google OAuth 2.0 Playground

1. Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) in the top right
3. Check **Use your own OAuth credentials**
4. Enter your **OAuth Client ID** and **OAuth Client secret**
5. In the left panel, find and select **Google Apps Script API v1**
6. Select the scope: `https://www.googleapis.com/auth/script.projects`
7. Click **Authorize APIs**
8. Complete the authorization flow
9. Click **Exchange authorization code for tokens**
10. Copy the **Refresh token** from the response

### Option B: Using curl (Advanced)

```bash
# Step 1: Get authorization code (open this URL in browser)
https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/script.projects&response_type=code

# Step 2: Exchange code for tokens
curl -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE_FROM_STEP_1" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
```

## Step 4: Configure Environment Variables

Update your `.env` file with the OAuth credentials:

```env
# Google Apps Script API OAuth Configuration
GOOGLE_APP_SCRIPT_API_CLIENT_ID=your_client_id_here
GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=your_client_secret_here
GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=your_refresh_token_here
```

Replace the placeholder values with:
- `your_client_id_here`: Your OAuth 2.0 Client ID
- `your_client_secret_here`: Your OAuth 2.0 Client Secret
- `your_refresh_token_here`: The refresh token obtained in Step 3

## Required Scopes

The following OAuth scopes are required for different operations:

- `https://www.googleapis.com/auth/script.projects` - Manage Google Apps Script projects
- `https://www.googleapis.com/auth/script.processes` - View Google Apps Script processes
- `https://www.googleapis.com/auth/script.deployments` - Manage deployments
- `https://www.googleapis.com/auth/drive` - Access Drive files (if needed)

## Security Notes

1. **Keep credentials secure**: Never commit your `.env` file to version control
2. **Refresh token rotation**: Google may rotate refresh tokens periodically
3. **Access token expiry**: Access tokens typically expire after 1 hour
4. **Scope principle**: Only request the minimum scopes needed for your application

## Troubleshooting

### Common Issues

1. **"Invalid credentials"**: Check that your client ID and secret are correct
2. **"Invalid scope"**: Ensure the required APIs are enabled in your GCP project
3. **"Refresh token expired"**: You may need to re-authorize and get a new refresh token
4. **"Project not found"**: Make sure the script project exists and you have access to it

### Testing Authentication

You can test your OAuth setup by running a simple API call:

```javascript
import { getOAuthAccessToken } from './lib/oauth-helper.js';

async function testAuth() {
  try {
    const token = await getOAuthAccessToken();
    console.log('OAuth authentication successful!');
    console.log('Access token received:', token.substring(0, 20) + '...');
  } catch (error) {
    console.error('OAuth authentication failed:', error.message);
  }
}

testAuth();
```

## Migration from API Key

If you were previously using an API key, the OAuth implementation provides:

1. **Better security**: OAuth tokens are time-limited and can be revoked
2. **Fine-grained access**: Specific scopes control what the application can access
3. **User context**: Operations are performed in the context of the authenticated user
4. **Compliance**: Meets Google's authentication requirements for sensitive APIs

The OAuth helper automatically handles token refresh, so your application will continue working even after access tokens expire.
