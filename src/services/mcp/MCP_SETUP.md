# MCP (Model Context Protocol) Setup Guide

This guide explains how to set up and use the MCP integration in Sirelia for enhanced repository analysis and code understanding.

## Overview

The MCP integration provides:
- **Enhanced Repository Access**: Full file content, commit history, and repository metadata
- **AI-Powered Analysis**: Advanced code analysis using MCP tools
- **Multi-Repository Support**: Work with multiple repositories simultaneously
- **Git Operations**: Direct git operations through MCP protocol

## Architecture

### MCP Service Layer
```
src/services/mcp/
├── types.ts              # MCP type definitions
├── mcp-client.ts         # Core MCP client wrapper
├── repository-service.ts # High-level repository operations
└── index.ts             # Service exports
```

### API Endpoints
```
src/app/api/mcp/
└── route.ts             # MCP operations API
```

## Setup Instructions

### 1. Configure MCP Server

1. Open the **Configuration** tab in the left panel
2. Expand the **MCP Configuration** section
3. Enter your MCP server URL (e.g., `https://mcp.example.com`)
4. Optionally provide an access token if required
5. Set a client name (defaults to `sirelia-mcp-client`)
6. Click **Connect to MCP Server**

### 2. Test Connection

1. Navigate to `/test-mcp` to access the MCP test page
2. Click **Test Connection** to verify the connection
3. Click **Get Tools** to see available MCP tools

### 3. API Usage

The MCP API supports the following operations:

#### Connect to MCP Server
```typescript
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'connect',
    config: {
      serverUrl: 'https://mcp.example.com',
      token: 'your-token',
      name: 'sirelia-mcp-client'
    }
  })
});
```

#### Get Connection Status
```typescript
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'status' })
});
```

#### Get Available Tools
```typescript
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'tools' })
});
```

#### Get Repository Information
```typescript
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'repository-info',
    owner: 'username',
    repo: 'repository'
  })
});
```

#### Get File Content
```typescript
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'file-content',
    owner: 'username',
    repo: 'repository',
    path: 'src/components/App.tsx'
  })
});
```

#### List Files
```typescript
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'list-files',
    owner: 'username',
    repo: 'repository',
    path: 'src/components'
  })
});
```

#### Get Commit History
```typescript
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'commit-history',
    owner: 'username',
    repo: 'repository',
    path: 'src/components/App.tsx' // optional
  })
});
```

## Service Usage

### MCPService

The core MCP client wrapper:

```typescript
import { MCPService } from '@/services/mcp';

const mcpService = new MCPService();

// Connect to MCP server
await mcpService.connect({
  serverUrl: 'https://mcp.example.com',
  token: 'your-token'
});

// Get tools
const tools = await mcpService.getTools();

// Check capabilities
const hasFileAccess = await mcpService.hasCapability('file');

// Close connection
await mcpService.close();
```

### RepositoryService

High-level repository operations:

```typescript
import { RepositoryService } from '@/services/mcp';

const repoService = new RepositoryService();

// Connect to GitHub MCP server
await repoService.connectToGitHub({
  serverUrl: 'https://github-mcp.example.com',
  token: 'your-github-token'
});

// Get repository info
const info = await repoService.getRepositoryInfo('username', 'repo');

// Get file content
const content = await repoService.getFileContent('username', 'repo', 'src/App.tsx');

// List files
const files = await repoService.listFiles('username', 'repo', 'src');

// Get commit history
const commits = await repoService.getCommitHistory('username', 'repo');
```

## Integration with AI Assistant

The MCP tools are automatically available to the AI assistant when connected. The AI can:

1. **Access Repository Content**: Read files and understand code structure
2. **Analyze Code**: Use MCP tools for code analysis and architecture understanding
3. **Generate Diagrams**: Create more accurate diagrams based on actual code content
4. **Provide Context**: Use repository metadata and history for better responses

### Enhanced System Prompt

When MCP is connected, the AI system prompt includes:

```
You have access to repository tools through MCP. Use them to:
- Analyze code structure and architecture
- Read file contents for detailed understanding
- Access commit history for code evolution
- Generate accurate Mermaid diagrams based on actual code
```

## Error Handling

The MCP integration includes comprehensive error handling:

- **Connection Errors**: Automatic retry and graceful degradation
- **Tool Errors**: Individual tool error handling with fallbacks
- **Protocol Errors**: MCP protocol-level error handling
- **Network Errors**: Timeout and retry mechanisms

## Configuration Storage

MCP configuration is stored in browser localStorage:

- `sirelia-mcp-config`: MCP server configuration
- Connection status and capabilities are cached
- Automatic reconnection on page reload

## Testing

Use the test page at `/test-mcp` to:

1. Verify MCP server connection
2. Test available tools
3. Debug connection issues
4. Validate configuration

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify MCP server URL is correct
   - Check if server requires authentication
   - Ensure server supports SSE transport

2. **No Tools Available**
   - Check server capabilities
   - Verify authentication token
   - Review server logs for errors

3. **Tool Execution Errors**
   - Check tool parameter requirements
   - Verify repository access permissions
   - Review MCP server logs

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem('sirelia-debug', 'true');
```

## Future Enhancements

- **Multi-Repository Support**: Connect to multiple repositories simultaneously
- **Advanced Git Operations**: Branch management, merge analysis
- **Code Analysis Tools**: AST parsing, dependency analysis
- **Performance Optimization**: Caching and connection pooling
- **Plugin System**: Custom MCP tool integration

## Security Considerations

- MCP tokens are stored locally in browser localStorage
- Consider using environment variables for production
- Implement proper authentication for multi-user environments
- Review MCP server security policies

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your MCP server configuration
3. Test with the `/test-mcp` endpoint
4. Review browser console for error messages
5. Check MCP server logs for protocol errors 