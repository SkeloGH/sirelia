# 🤝 Contributing to Sirelia

Welcome to Sirelia! This guide will help you understand how to contribute to this AI-powered Mermaid diagram generation platform.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
- [MCP Integration Guidelines](#mcp-integration-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Code Style & Standards](#code-style--standards)
- [Common Issues & Solutions](#common-issues--solutions)
- [Pull Request Process](#pull-request-process)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- GitHub account (for MCP integration)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SkeloGH/sirelia.git
   cd sirelia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp config.example.ts config.ts
   # Edit config.ts with your settings
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Architecture

### Core Components

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── tabs/             # Tab components
│   └── ...               # Other UI components
├── services/             # Business logic services
│   ├── context/          # Context building services
│   ├── mcp/              # MCP integration
│   └── ...               # Other services
└── types/                # TypeScript type definitions
```

### Key Services

- **RepositoryContextBuilder**: Analyzes repositories and builds context
- **RepositoryService**: Handles GitHub repository operations
- **MCPService**: Manages MCP server connections
- **GitHubMCPClient**: GitHub Copilot MCP integration

## 🔄 Development Workflow

### 1. Feature Development

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement your changes**
   - Follow the coding standards below
   - Add tests for new functionality
   - Update documentation

3. **Test your changes**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### 2. MCP Integration Development

When working with MCP (Model Context Protocol) integration:

1. **Discover available tools first**
   - Use the test page at `/test-context`
   - Click "Check Available Tools" to see what's available
   - Check server logs for detailed tool information

2. **Handle tool name differences**
   - GitHub Copilot uses `get_file_contents` (not `get_file_content`)
   - Always verify tool names before implementation

3. **Test response formats**
   - MCP responses can have various structures
   - Implement flexible parsing with fallbacks

## 🔗 MCP Integration Guidelines

### Understanding MCP

The Model Context Protocol (MCP) enables AI models to interact with external systems. Sirelia integrates with GitHub Copilot's MCP server for repository access.

### Key Concepts

- **Tools**: Executable functions exposed by MCP servers
- **Resources**: Read-only data sources
- **Client/Server**: MCP clients connect to MCP servers

### Best Practices

#### 1. Tool Discovery
```typescript
// Always discover tools before using them
const availableTools = await repoService.getAvailableTools();
console.log('Available tools:', availableTools);
```

#### 2. Error Handling
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

#### 3. Response Parsing
```typescript
// Handle various response formats
const content = response.content || 
               response.data || 
               response.text ||
               response.body;
```

#### 4. Connection Management
```typescript
// Check connection status before making calls
if (!mcpClient.isConnected()) {
  throw new Error('MCP client not connected');
}
```

### Common MCP Tools

#### GitHub Copilot MCP Server (47 tools available)

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

### MCP Configuration

Store MCP configuration in localStorage:
```typescript
const mcpConfig = {
  serverUrl: 'https://api.githubcopilot.com/mcp/',
  isConnected: true,
  isEnabled: true,
  token: 'your-token-here'
};

localStorage.setItem('sirelia-mcp-config', JSON.stringify(mcpConfig));
```

## 🧪 Testing Guidelines

### Test Structure

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test service interactions
3. **E2E Tests**: Test complete user workflows

### Testing MCP Integration

#### Test Page
Use the interactive test page at `/test-context`:
- Test MCP connection
- Validate tool discovery
- Test context builder functionality

#### API Testing
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

## 📝 Code Style & Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper interfaces for all data structures
- Avoid `any` types - use proper type assertions
- Use generics for reusable components

### React

- Use functional components with hooks
- Implement proper error boundaries
- Handle SSR considerations (localStorage, window object)
- Use proper state management patterns

### Error Handling

```typescript
// Always handle errors gracefully
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  // Provide fallback or user feedback
  return fallbackValue;
}
```

### SSR Considerations

```typescript
// Handle client-side only APIs
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
  // Access localStorage, window, etc.
}, []);

if (!isClient) {
  return <LoadingComponent />;
}
```

## 🐛 Common Issues & Solutions

### 1. localStorage SSR Error

**Problem**: `localStorage is not defined` during server-side rendering

**Solution**: Use `useEffect` for client-side access
```typescript
useEffect(() => {
  const data = localStorage.getItem('key');
  // Handle data
}, []);
```

### 2. MCP Tool Not Found

**Problem**: `Tool 'tool_name' not found` error

**Solution**: 
1. Check available tools first
2. Verify tool names match exactly
3. Implement fallback mechanisms

### 3. MCP Response Parsing

**Problem**: Unexpected response format

**Solution**: Implement flexible parsing
```typescript
const content = response.content || 
               response.data || 
               response.text ||
               response.body;
```

### 4. Connection Issues

**Problem**: MCP connection failures

**Solution**:
1. Check network connectivity
2. Verify MCP server URL
3. Check authentication tokens
4. Implement retry logic

## 🔄 Pull Request Process

### Before Submitting

1. **Test thoroughly**
   - Run all tests: `npm test`
   - Check linting: `npm run lint`
   - Test MCP integration
   - Verify SSR compatibility

2. **Update documentation**
   - Update README if needed
   - Add inline code comments
   - Update type definitions

3. **Check for breaking changes**
   - Ensure backward compatibility
   - Update version numbers if needed

### PR Template

```markdown
## 📋 Overview
Brief description of changes

## ✨ Key Features
- Feature 1
- Feature 2

## 🔍 Technical Implementation
Code examples and technical details

## 🧪 Testing
Testing approach and results

## 📁 Files Changed
- New files
- Modified files

## 🎯 Next Steps
Future improvements or follow-up tasks
```

### Review Process

1. **Self-review**: Check your own code first
2. **Automated checks**: Ensure CI/CD passes
3. **Peer review**: Get feedback from team members
4. **Address feedback**: Make requested changes
5. **Merge**: Once approved, merge to main branch

## 🎯 Development Priorities

### High Priority
- [ ] Enhanced context aggregation
- [ ] AI chat flow integration
- [ ] Mermaid diagram generation
- [ ] Performance optimization

### Medium Priority
- [ ] Additional MCP server support
- [ ] Caching layer implementation
- [ ] Advanced file analysis
- [ ] User experience improvements

### Low Priority
- [ ] Additional diagram types
- [ ] Export functionality
- [ ] Advanced customization
- [ ] Analytics and metrics

## 🤝 Getting Help

- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check existing docs and examples
- **Code Review**: Ask for help in pull requests

## 📚 Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub Copilot MCP Server](https://github.com/github/github-mcp-server)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)

---

Thank you for contributing to Sirelia! 🚀 