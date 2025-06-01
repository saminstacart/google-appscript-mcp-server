# Enhanced MCP Server Logging

This document describes the enhanced logging capabilities added to the MCP server for detailed monitoring and debugging of tool responses.

## Overview

The MCP server now includes comprehensive logging that tracks:
- Tool discovery and initialization
- Tool execution requests and responses
- API calls to Google Apps Script services
- Authentication flows
- Error conditions with detailed context
- Performance metrics

## Configuration

### Log Levels

Set the `LOG_LEVEL` environment variable in your `.env` file:

```env
# LOG_LEVEL can be: error, warn, info, debug, trace
LOG_LEVEL=info
```

**Available Log Levels:**
- `error`: Only error messages
- `warn`: Errors and warnings
- `info`: Errors, warnings, and informational messages (default)
- `debug`: All above plus detailed debugging information
- `trace`: Maximum verbosity (includes all internal operations)

### Environment Variables

Add to your `.env` file:
```env
# Logging Configuration
LOG_LEVEL=info
```

## Features

### 1. Tool Execution Logging

Every tool execution is logged with:
- **Request ID**: Unique identifier for tracking
- **Tool Name**: Which tool was called
- **Arguments**: Input parameters (sanitized)
- **Execution Time**: How long the tool took to execute
- **Response Size**: Size of the response data
- **Success/Failure Status**: Whether the tool completed successfully

**Example Output:**
```
[2025-06-01T10:30:15.123Z] [INFO] [TOOL_REQUEST] Executing tool: script_projects_get
{
  "tool": "script_projects_get",
  "arguments": {
    "scriptId": "1BxKdN9XvlHF8rF9mF8..."
  },
  "requestId": "req_1717234215123_abc123def"
}

[2025-06-01T10:30:15.456Z] [INFO] [TOOL_RESPONSE] Tool completed: script_projects_get
{
  "tool": "script_projects_get",
  "duration": "333ms",
  "requestId": "req_1717234215123_abc123def",
  "responseSize": 2048,
  "success": true
}
```

### 2. API Call Logging

All HTTP requests to Google APIs are logged with:
- **Method and URL**: Complete request details
- **Headers**: Sanitized headers (Authorization tokens are redacted)
- **Response Status**: HTTP status codes
- **Response Time**: Network latency
- **Response Size**: Payload size

**Example Output:**
```
[2025-06-01T10:30:15.200Z] [DEBUG] [API_CALL] Making API request: GET https://script.googleapis.com/v1/projects/123
{
  "method": "GET",
  "url": "https://script.googleapis.com/v1/projects/123",
  "headers": {
    "Authorization": "Bearer ***REDACTED***",
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
}

[2025-06-01T10:30:15.400Z] [DEBUG] [API_RESPONSE] API response: GET https://script.googleapis.com/v1/projects/123
{
  "method": "GET",
  "url": "https://script.googleapis.com/v1/projects/123",
  "status": 200,
  "responseTime": "200ms",
  "responseSize": "1024 bytes"
}
```

### 3. Authentication Logging

OAuth authentication flows are tracked:
- **Token Requests**: When access tokens are requested
- **Token Refresh**: When tokens are refreshed
- **Authentication Failures**: Failed auth attempts with reasons
- **Token Information**: Token types and scopes (sanitized)

**Example Output:**
```
[2025-06-01T10:30:14.500Z] [INFO] [AUTH] Requesting OAuth access token
[2025-06-01T10:30:14.800Z] [INFO] [AUTH] Access token obtained successfully
{
  "duration": "300ms",
  "tokenLength": 195,
  "tokenPrefix": "ya29.a0AWY7C..."
}
```

### 4. Error Logging

Comprehensive error tracking includes:
- **Stack traces**: Full error call stacks
- **Context information**: What was being attempted
- **Request parameters**: Input data that caused the error
- **Timing information**: How long the operation took before failing

**Example Output:**
```
[2025-06-01T10:30:16.123Z] [ERROR] [TOOL_ERROR] Tool failed: script_projects_get
{
  "tool": "script_projects_get",
  "duration": "667ms",
  "requestId": "req_1717234215456_def456ghi",
  "error": {
    "message": "API Error (404): Script project not found",
    "stack": "Error: API Error (404): Script project not found\n    at executeFunction...",
    "name": "Error"
  }
}
```

### 5. Performance Metrics

Track performance across all operations:
- **Tool execution times**: How long each tool takes
- **API response times**: Network latency to Google services
- **Authentication times**: OAuth token acquisition time
- **Overall request duration**: End-to-end request processing

## Usage

### 1. Running with Enhanced Logging

```bash
# Start the MCP server with info level logging
npm start

# Start with debug logging for detailed information
LOG_LEVEL=debug npm start

# Start with minimal error-only logging
LOG_LEVEL=error npm start
```

### 2. Testing the Logging

Run the logging test script:
```bash
node test-logging.js
```

This will demonstrate all logging features and show you what to expect.

### 3. Log Output Examples

**Startup Logs:**
```
[2025-06-01T10:30:10.000Z] [INFO] [STARTUP] Starting MCP server in STDIO mode
[2025-06-01T10:30:10.100Z] [INFO] [DISCOVERY] Starting tool discovery for 17 tool paths
[2025-06-01T10:30:10.500Z] [INFO] [DISCOVERY] Tool discovery completed
{
  "totalPaths": 17,
  "successfullyLoaded": 17,
  "failed": 0,
  "toolNames": ["script_projects_get", "script_projects_deployments_list", ...]
}
```

**Request Handling:**
```
[2025-06-01T10:30:15.000Z] [INFO] [REQUEST] CallTool request received
{
  "requestId": "req_1717234215000_xyz789",
  "toolName": "script_projects_get",
  "arguments": {
    "scriptId": "1BxKdN9XvlHF8rF9mF8..."
  },
  "timestamp": "2025-06-01T10:30:15.000Z"
}
```

## Log Categories

The logging system uses categories to organize different types of events:

- **STARTUP**: Server initialization and configuration
- **DISCOVERY**: Tool loading and discovery process  
- **REQUEST**: MCP protocol request handling
- **EXECUTION**: Tool execution and results
- **API_CALL**: HTTP requests to external APIs
- **API_RESPONSE**: HTTP response processing
- **AUTH**: Authentication and authorization
- **ERROR**: Error conditions and failures
- **TEST**: Testing and debugging operations

## Benefits

1. **Debugging**: Quickly identify issues with specific tools or API calls
2. **Performance Monitoring**: Track response times and identify bottlenecks
3. **Audit Trail**: Complete record of all operations for compliance
4. **Error Analysis**: Detailed error context for troubleshooting
5. **Usage Analytics**: Understand which tools are used most frequently
6. **Security Monitoring**: Track authentication events and failures

## Log File Integration

While the current implementation outputs to console, you can easily redirect logs to files:

```bash
# Log everything to a file
node mcpServer.js 2>&1 | tee mcp-server.log

# Log only errors to a separate file
node mcpServer.js 2>error.log

# Use with log rotation tools like logrotate
node mcpServer.js 2>&1 | logger -t mcp-server
```

## Customization

The logging system is built with the `MCPLogger` class in `lib/logger.js`. You can:

1. **Add new log categories**: Extend the logger for specific use cases
2. **Customize log format**: Modify the `formatMessage` method
3. **Add log filtering**: Implement custom filtering logic
4. **Integrate with external systems**: Send logs to monitoring services

## Security Considerations

- **Token Redaction**: OAuth tokens are automatically redacted in logs
- **Sensitive Data**: Personal data in request parameters should be sanitized
- **Log Storage**: Ensure log files are properly secured if stored
- **Retention**: Implement appropriate log retention policies

## Troubleshooting

**Common Issues:**

1. **Too much logging**: Set `LOG_LEVEL=warn` or `LOG_LEVEL=error`
2. **Missing logs**: Check that `LOG_LEVEL` is set appropriately
3. **Performance impact**: Debug level logging may impact performance in production

**Log Level Guidelines:**
- **Production**: Use `info` or `warn` level
- **Development**: Use `debug` level for detailed information
- **Troubleshooting**: Use `trace` level for maximum detail
- **Error monitoring**: Use `error` level for minimal output
