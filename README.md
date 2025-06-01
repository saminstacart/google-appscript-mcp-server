# Postman MCP Generator

Welcome to your generated MCP server! 🚀 This project was created with the [Postman MCP Generator](https://postman.com/explore/mcp-generator), configured to [Model Context Provider (MCP)](https://modelcontextprotocol.io/introduction) Server output mode. It provides you with:

- ✅ An MCP-compatible server (`mcpServer.js`)
- ✅ Automatically generated JavaScript tools for each selected Postman API request
- ✅ OAuth 2.0 authentication for Google Apps Script API

## 🔄 Authentication Update

**Important**: This server has been updated to use OAuth 2.0 authentication instead of API keys for the Google Apps Script API. Please see the `OAUTH_SETUP.md` file for detailed setup instructions.

Let's set things up!

## 🚦 Getting Started

### ⚙️ Prerequisites

Before starting, please ensure you have:

- [Node.js (v18+ required, v20+ recommended)](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (included with Node)

Warning: if you run with a lower version of Node, `fetch` won't be present. Tools use `fetch` to make HTTP calls. To work around this, you can modify the tools to use `node-fetch` instead. Make sure that `node-fetch` is installed as a dependency and then import it as `fetch` into each tool file.

### 📥 Installation & Setup

**1. Install dependencies**

Run from your project's root directory:

```sh
npm install
```

### 🔐 Set up OAuth Authentication

The Google Apps Script API uses OAuth 2.0 authentication with secure token storage.

**Step 1**: Follow the detailed setup guide in `OAUTH_SETUP.md` to:
- Create OAuth 2.0 credentials in Google Cloud Console
- Enable required APIs
- Configure redirect URIs

**Step 2**: Update your `.env` file with OAuth credentials:

```env
# Google Apps Script API OAuth Configuration
GOOGLE_APP_SCRIPT_API_CLIENT_ID=your_client_id_here
GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=your_client_secret_here
```

**Step 3**: Run the OAuth setup to obtain and securely store tokens:

```bash
node oauth-setup.js
```

This will:
- ✅ Open your browser for authorization
- ✅ Obtain access and refresh tokens
- ✅ Store tokens securely in your system
- ✅ Set up automatic token refresh

**🔒 Security Features:**
- **Refresh tokens** are stored securely in OS-specific locations
- **Access tokens** are managed automatically and refreshed as needed
- **No sensitive tokens** are stored in `.env` or configuration files
- **File permissions** restrict access to token files

Replace the placeholder values with your actual OAuth credentials obtained in Step 1.

**Important**: The Google Apps Script API requires OAuth authentication for accessing script projects, deployments, and processes. The new token management system handles this automatically and securely.

## 🌐 Test the MCP Server with Postman

The MCP Server (`mcpServer.js`) exposes your automated API tools to MCP-compatible clients, such as Claude Desktop or the Postman Desktop Application. We recommend that you test the server with Postman first and then move on to using it with an LLM.

The Postman Desktop Application is the easiest way to run and test MCP servers. Testing the downloaded server first is optional but recommended.

**Step 1**: Download the latest Postman Desktop Application from [https://www.postman.com/downloads/](https://www.postman.com/downloads/).

**Step 2**: Read out the documentation article [here](https://learning.postman.com/docs/postman-ai-agent-builder/mcp-requests/create/) and see how to create an MCP request inside the Postman app.

**Step 3**: Set the type of the MCP request to `STDIO` and set the command to `node </absolute/path/to/mcpServer.js>`. If you have issues with using only `node` (e.g. an old version is used), supply an absolute path instead to a node version 18+. 

**For Windows users**, you can get the full path to node by running:

```powershell
Get-Command node | Select-Object -ExpandProperty Source
```

**For macOS/Linux users**, you can get the full path to node by running:

```bash
which node
```

To check the node version on any platform, run:

```bash
node --version
```

**For Windows users**, to get the absolute path to `mcpServer.js`, run:

```powershell
Get-Location | Select-Object -ExpandProperty Path
```

Then append `\mcpServer.js` to the path.

**For macOS/Linux users**, to get the absolute path to `mcpServer.js`, run:

```bash
realpath mcpServer.js
```

Use the node command followed by the full path to `mcpServer.js` as the command for your new Postman MCP Request. Then click the **Connect** button. You should see a list of tools that you selected before generating the server. You can test that each tool works here before connecting the MCP server to an LLM.

## 🔗 Connect the MCP Server to Clients

You can connect your MCP server to various MCP clients. Below are detailed instructions for both Claude Desktop and VS Code.

### 📋 Getting Required Paths

Before configuring any MCP client, you'll need the absolute paths to Node.js and your `mcpServer.js` file.

**For Windows users:**

1. **Get Node.js path:**
   ```powershell
   Get-Command node | Select-Object -ExpandProperty Source
   ```
   Example output: `C:\nvm4w\nodejs\node.exe`

2. **Get current directory path:**
   ```powershell
   Get-Location | Select-Object -ExpandProperty Path
   ```
   Example output: `C:\Users\mohal\Downloads\google-appscriot-mcp-server`

3. **Your mcpServer.js path will be:**
   `C:\Users\mohal\Downloads\google-appscriot-mcp-server\mcpServer.js`

**For macOS/Linux users:**

1. **Get Node.js path:**
   ```bash
   which node
   ```

2. **Get mcpServer.js path:**
   ```bash
   realpath mcpServer.js
   ```

### 🤖 Claude Desktop Setup

**Step 1**: Note the full paths from the previous section.

**Step 2**: Open Claude Desktop and navigate to:
- **Settings** → **Developers** → **Edit Config**

**Step 3**: Add your MCP server configuration. Choose one of the options below:

#### Option A: Windows Configuration Example
```json
{
  "mcpServers": {
    "google-apps-script": {
      "command": "C:\\nvm4w\\nodejs\\node.exe",
      "args": ["C:\\Users\\mohal\\Downloads\\google-appscriot-mcp-server\\mcpServer.js"],
      "env": {
        "GOOGLE_APP_SCRIPT_API_CLIENT_ID": "your_client_id_here",
        "GOOGLE_APP_SCRIPT_API_CLIENT_SECRET": "your_client_secret_here"
      }
    }
  }
}
```

#### Option B: Generic Template (Replace with your actual paths)
```json
{
  "mcpServers": {
    "google-apps-script": {
      "command": "<absolute_path_to_node_executable>",
      "args": ["<absolute_path_to_mcpServer.js>"],
      "env": {
        "GOOGLE_APP_SCRIPT_API_CLIENT_ID": "your_client_id_here",
        "GOOGLE_APP_SCRIPT_API_CLIENT_SECRET": "your_client_secret_here"
      }
    }
  }
}
```

**Step 4**: Replace the OAuth credentials with your actual values from the `.env` file.

**Note**: No refresh token is needed in the configuration - it's stored securely and managed automatically.

**Step 5**: Save the configuration and restart Claude Desktop.

**Step 6**: Verify the connection by checking that the MCP server shows a green circle indicator next to it in Claude Desktop.

### 📝 VS Code Setup (Cline/MCP Extensions)

VS Code can use MCP servers through extensions like **Cline** or other MCP-compatible extensions.

#### Using with Cline Extension

**Step 1**: Install the [Cline extension](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) from the VS Code marketplace.

**Step 2**: Open VS Code settings (`Ctrl+,` on Windows/Linux, `Cmd+,` on macOS).

**Step 3**: Search for "Cline" or "MCP" in the settings.

**Step 4**: Add your MCP server configuration. This is typically done in one of these ways:

#### Method 1: VS Code Settings.json
Add to your VS Code `settings.json` (accessible via `Ctrl+Shift+P` → "Preferences: Open Settings (JSON)"):

```json
{
  "cline.mcpServers": {
    "google-apps-script": {
      "command": "C:\\nvm4w\\nodejs\\node.exe",
      "args": ["C:\\Users\\mohal\\Downloads\\google-appscriot-mcp-server\\mcpServer.js"],
      "env": {
        "GOOGLE_APP_SCRIPT_API_CLIENT_ID": "your_client_id_here",
        "GOOGLE_APP_SCRIPT_API_CLIENT_SECRET": "your_client_secret_here"
      }
    }
  }
}
```

#### Method 2: Workspace Configuration
Create a `.vscode/settings.json` file in your project root:

```json
{
  "cline.mcpServers": {
    "google-apps-script": {
      "command": "node",
      "args": ["./mcpServer.js"],
      "env": {
        "GOOGLE_APP_SCRIPT_API_CLIENT_ID": "your_client_id_here",
        "GOOGLE_APP_SCRIPT_API_CLIENT_SECRET": "your_client_secret_here"
      }
    }
  }
}
```

#### Using with Other MCP Extensions

If using other MCP-compatible extensions, consult their documentation for configuration details. The general pattern is similar:

1. Provide the path to Node.js executable
2. Provide the path to `mcpServer.js`
3. Set environment variables for OAuth credentials
4. Restart/reload the extension

### 🔧 Configuration File Locations

#### Claude Desktop Config Location:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude-desktop/claude_desktop_config.json`

#### VS Code Settings Location:
- **Windows**: `%APPDATA%\Code\User\settings.json`
- **macOS**: `~/Library/Application Support/Code/User/settings.json`
- **Linux**: `~/.config/Code/User/settings.json`

### ⚠️ Important Notes

**Node.js Version Warning**: If you don't supply an absolute path to a `node` version that is v18+, Claude and other MCP clients may fall back to another `node` version on the system of a previous version. In this case, the `fetch` API won't be present and tool calls will not work. 

**Solutions if this happens:**
1. Install a newer version of Node.js and point to it in the command
2. Import `node-fetch` into each tool as `fetch`, making sure to also add the `node-fetch` dependency to your `package.json`

**Environment Variables**: Make sure your OAuth credentials are properly set either in:
- Your `.env` file (for direct execution)
- The `env` section of your MCP configuration (for client applications)

**Path Format**: On Windows, use double backslashes (`\\`) in JSON configuration files to properly escape the path separators.

### 🚀 Quick Start Templates

#### For Current Setup (Copy & Paste Ready)

**Claude Desktop Configuration:**
```json
{
  "mcpServers": {
    "google-apps-script": {
      "command": "C:\\nvm4w\\nodejs\\node.exe",
      "args": ["C:\\Users\\mohal\\Downloads\\google-appscriot-mcp-server\\mcpServer.js"],
      "env": {
        "GOOGLE_APP_SCRIPT_API_CLIENT_ID": "your_client_id_here",
        "GOOGLE_APP_SCRIPT_API_CLIENT_SECRET": "your_client_secret_here"
      }
    }
  }
}
```

**VS Code/Cline Configuration:**
```json
{
  "cline.mcpServers": {
    "google-apps-script": {
      "command": "C:\\nvm4w\\nodejs\\node.exe",
      "args": ["C:\\Users\\mohal\\Downloads\\google-appscriot-mcp-server\\mcpServer.js"],
      "env": {
        "GOOGLE_APP_SCRIPT_API_CLIENT_ID": "your_client_id_here",
        "GOOGLE_APP_SCRIPT_API_CLIENT_SECRET": "your_client_secret_here"
      }
    }
  }
}
```

**Remember to:**
1. Replace the OAuth credential placeholders with your actual values
2. Run `node oauth-setup.js` to set up secure token storage
3. Adjust paths if your Node.js or project location differs
4. Restart the client application after making changes

### 🔍 Troubleshooting

#### Common Issues and Solutions

**1. "Command not found" or "Node not found" errors:**
- Ensure Node.js is properly installed and in your PATH
- Use absolute paths to the Node.js executable
- Verify Node.js version is 18+ using `node --version`

**2. "fetch is not defined" errors:**
- Your Node.js version is below 18
- Solution: Upgrade Node.js or install `node-fetch` as a dependency

**3. OAuth authentication errors:**
- Verify your OAuth credentials are correct in the `.env` file
- Ensure environment variables are properly set in the MCP configuration
- Check that you've followed all steps in `OAUTH_SETUP.md`

**4. MCP server not appearing in Claude Desktop:**
- Check the configuration file syntax (valid JSON)
- Ensure file paths use proper escaping (double backslashes on Windows)
- Restart Claude Desktop after configuration changes
- Check Claude Desktop logs for error messages

**5. VS Code/Cline connection issues:**
- Verify the extension is properly installed and enabled
- Check that the MCP configuration is in the correct settings location
- Reload the VS Code window after configuration changes

**6. "Permission denied" errors (macOS/Linux):**
- You may need to make the `mcpServer.js` file executable: `chmod +x mcpServer.js`
- Or use the full node command: `node /path/to/mcpServer.js`

#### Testing Your Configuration

You can test your MCP server independently by running:

```bash
node mcpServer.js
```

If it starts without errors, your basic setup is correct. For MCP client testing, use the Postman Desktop Application as described in the testing section above.

### Additional Options

#### 🐳 Docker Deployment (Production)

For production deployments, you can use Docker:

**1. Build Docker image**

```sh
docker build -t <your_server_name> .
```

**2. Claude Desktop Integration**

Add Docker server configuration to Claude Desktop (Settings → Developers → Edit Config):

```json
{
  "mcpServers": {
    "<your_server_name>": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "--env-file=.env", "<your_server_name>"]
    }
  }
}
```

> Add your environment variables (API keys, etc.) inside the `.env` file.

The project comes bundled with the following minimal Docker setup:

```dockerfile
FROM node:22.12-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENTRYPOINT ["node", "mcpServer.js"]
```

#### 🌐 Server-Sent Events (SSE)

To run the server with Server-Sent Events (SSE) support, use the `--sse` flag:

```sh
node mcpServer.js --sse
```

## 🛠️ Additional CLI commands

#### List tools

List descriptions and parameters from all generated tools with:

```sh
node index.js tools
```

Example:

```
Available Tools:

Workspace: acme-workspace
  Collection: useful-api
    list_all_customers
      Description: Retrieve a list of useful things.
      Parameters:
        - magic: The required magic power
        - limit: Number of results returned
        [...additional parameters...]
```

## ➕ Adding New Tools

Extend your MCP server with more tools easily:

1. Visit [Postman MCP Generator](https://postman.com/explore/mcp-generator).
2. Pick new API request(s), generate a new MCP server, and download it.
3. Copy new generated tool(s) into your existing project's `tools/` folder.
4. Update your `tools/paths.js` file to include new tool references.

## 💬 Questions & Support

Visit the [Postman MCP Generator](https://postman.com/explore/mcp-generator) page for updates and new capabilities.

Join the `#mcp-lab` channel in the [Postman Discord](https://discord.gg/HQJWM8YF) to share what you've built and get help.
