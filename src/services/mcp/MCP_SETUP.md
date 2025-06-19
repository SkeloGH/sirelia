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
├── github-mcp-client.ts  # GitHub Copilot MCP client
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
3. Enter your MCP server URL (e.g., `https://api.githubcopilot.com/mcp/`)
4. Optionally provide an access token if required
5. Set a client name (defaults to `sirelia-mcp-client`)
6. Click **Connect to MCP Server**

### 2. Test Connection

1. Navigate to `/test-context` to access the MCP test page
2. Click **Check Available Tools** to see available MCP tools
3. Click **Test Context Builder** to validate repository analysis

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
      serverUrl: 'https://api.githubcopilot.com/mcp/',
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
  serverUrl: 'https://api.githubcopilot.com/mcp/',
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
3. **Generate Diagrams**: Create Mermaid diagrams based on repository analysis

---

# 🔗 MCP Development Guidelines

## Understanding MCP

The Model Context Protocol (MCP) enables AI models to interact with external systems. Sirelia integrates with GitHub Copilot's MCP server for repository access.

### Key Concepts

- **Tools**: Executable functions exposed by MCP servers
- **Resources**: Read-only data sources
- **Client/Server**: MCP clients connect to MCP servers

## Development Workflow for MCP Integration

### 1. Tool Discovery First

**Always discover available tools before implementing functionality:**

```typescript
// Use the test page at /test-context
// Click "Check Available Tools" to see what's available
const availableTools = await repoService.getAvailableTools();
console.log('Available tools:', availableTools);
```

### 2. Handle Tool Name Differences

**GitHub Copilot uses different tool names than expected:**
- ✅ `get_file_contents` (not `get_file_content`)
- ✅ `list_branches`, `list_commits` for repository info
- ✅ `search_code`, `search_repositories` for discovery

### 3. Test Response Formats

**MCP responses can have various structures:**
```typescript
// Implement flexible parsing with fallbacks
const content = response.content || 
               response.data || 
               response.text ||
               response.body;
```

## Best Practices

### 1. Tool Discovery
```typescript
// Always discover tools before using them
const availableTools = await repoService.getAvailableTools();
console.log('Available tools:', availableTools);
```

### 2. Error Handling
```typescript
try {
  const result = await mcpClient.callTool('tool_name', args);
  return result;
} catch (error) {
  console.error('Tool call failed:', error);
  // Implement fallback or graceful degradation
  return null;
}
```

### 3. Response Parsing
```typescript
// Handle various response formats
const content = response.content || 
               response.data || 
               response.text ||
               response.body;
```

### 4. Connection Management
```typescript
// Check connection status before making calls
if (!mcpClient.isConnected()) {
  throw new Error('MCP client not connected');
}
```

## Common MCP Tools

### GitHub Copilot MCP Server (47 tools available)

**Repository Operations:**
- `get_file_contents` - Get file or directory contents
- `list_branches` - List repository branches
- `list_commits` - Get commit history
- `get_commit` - Get commit details

**Search Operations:**
- `search_code` - Search for code across repositories
- `search_repositories` - Search for GitHub repositories
- `search_issues` - Search for issues

**Repository Management:**
- `create_repository` - Create new repository
- `fork_repository` - Fork existing repository
- `create_branch` - Create new branch

**Issue & PR Management:**
- `create_issue` - Create new issue
- `get_issue` - Get issue details
- `create_pull_request` - Create new pull request
- `get_pull_request` - Get pull request details

## MCP Configuration

### Store MCP Configuration
```typescript
const mcpConfig = {
  serverUrl: 'https://api.githubcopilot.com/mcp/',
  isConnected: true,
  isEnabled: true,
  token: 'your-token-here'
};

localStorage.setItem('sirelia-mcp-config', JSON.stringify(mcpConfig));
```

### Retrieve MCP Configuration
```typescript
const getMCPConfig = (): MCPConfig | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const mcpConfigStr = localStorage.getItem('sirelia-mcp-config');
    if (mcpConfigStr) {
      return JSON.parse(mcpConfigStr);
    }
  } catch (error) {
    console.error('Failed to parse MCP config:', error);
  }
  return null;
};
```

## Testing MCP Integration

### Test Page Usage
Use the interactive test page at `/test-context`:
- Test MCP connection
- Validate tool discovery
- Test context builder functionality

### API Testing
```bash
# Test context builder API
curl -X POST http://localhost:3000/api/test-context \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryUrl": "https://github.com/user/repo",
    "userRequest": "Generate architecture diagram",
    "mcpConfig": {...}
  }'
```

### Common Test Scenarios

1. **MCP Connection**
   - Test successful connection
   - Test connection failures
   - Test reconnection logic

2. **Tool Discovery**
   - Test tool listing
   - Test tool availability
   - Test tool calling

3. **Context Building**
   - Test repository parsing
   - Test file structure analysis
   - Test context assembly

## Common Issues & Solutions

### 1. MCP Tool Not Found

**Problem**: `Tool 'tool_name' not found` error

**Solution**: 
1. Check available tools first
2. Verify tool names match exactly
3. Implement fallback mechanisms

### 2. MCP Response Parsing

**Problem**: Unexpected response format

**Solution**: Implement flexible parsing
```typescript
const content = response.content || 
               response.data || 
               response.text ||
               response.body;
```

### 3. Connection Issues

**Problem**: MCP connection failures

**Solution**:
1. Check network connectivity
2. Verify MCP server URL
3. Check authentication tokens
4. Implement retry logic

### 4. SSR localStorage Error

**Problem**: `localStorage is not defined` during server-side rendering

**Solution**: Use client-side checks
```typescript
const getMCPConfig = (): MCPConfig | null => {
  if (typeof window === 'undefined') return null;
  // Access localStorage only on client side
};
```

## Code Examples

### GitHub MCP Client Usage
```typescript
import { GitHubMCPClient } from '@/services/mcp/github-mcp-client';

const client = new GitHubMCPClient();

// Connect to GitHub Copilot MCP server
await client.connect({
  serverUrl: 'https://api.githubcopilot.com/mcp/',
  token: 'your-token'
});

// Get available tools
const tools = await client.getTools();

// Call a specific tool
const result = await client.callTool('get_file_contents', {
  owner: 'username',
  repo: 'repository',
  path: 'README.md'
});
```

### Repository Service Integration
```typescript
import { RepositoryService } from '@/services/mcp/repository-service';

const repoService = new RepositoryService();

// Connect to GitHub MCP server
await repoService.connectToGitHub({
  serverUrl: 'https://api.githubcopilot.com/mcp/',
  token: 'your-token'
});

// Get repository information
const repoInfo = await repoService.getRepositoryInfo('username', 'repo');

// Get file content
const fileContent = await repoService.getFileContent('username', 'repo', 'src/App.tsx');

// List files in directory
const files = await repoService.listFiles('username', 'repo', 'src');
```

## Performance Considerations

### 1. Connection Pooling
- Reuse MCP connections when possible
- Implement connection pooling for multiple requests
- Close connections properly to free resources

### 2. Caching
- Cache tool discovery results
- Cache frequently accessed file contents
- Implement TTL-based cache invalidation

### 3. Error Recovery
- Implement exponential backoff for failed requests
- Retry failed tool calls with different strategies
- Graceful degradation when MCP is unavailable

## Security Best Practices

### 1. Token Management
- Store tokens securely in localStorage
- Implement token refresh mechanisms
- Validate token permissions before use

### 2. Input Validation
- Validate all MCP tool parameters
- Sanitize file paths and repository names
- Implement rate limiting for tool calls

### 3. Error Handling
- Don't expose sensitive information in error messages
- Log security-relevant errors appropriately
- Implement proper error boundaries

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub Copilot MCP Server](https://github.com/github/github-mcp-server)
- [MCP Tools Guide](https://modelcontextprotocol.io/docs/concepts/tools)
- [GitHub API Documentation](https://docs.github.com/en/rest) 