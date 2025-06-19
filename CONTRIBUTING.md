# 🤝 Contributing to Sirelia

Welcome to Sirelia! This guide will help you understand how to contribute to this AI-powered Mermaid diagram generation platform.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
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

When working with MCP (Model Context Protocol) integration, refer to the comprehensive guide:

📖 **MCP Development Guidelines**: See [`src/services/mcp/MCP_SETUP.md`](src/services/mcp/MCP_SETUP.md)

The MCP setup guide includes:
- Detailed MCP integration workflow
- Tool discovery and usage patterns
- Common issues and solutions
- Code examples and best practices
- Testing strategies for MCP functionality

## 🧪 Testing Guidelines

### Test Structure

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test service interactions
3. **E2E Tests**: Test complete user workflows

### Testing MCP Integration

For MCP-specific testing, see the [MCP Setup Guide](src/services/mcp/MCP_SETUP.md#testing-mcp-integration).

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

### 2. MCP Integration Issues

For MCP-specific issues and solutions, see the [MCP Setup Guide](src/services/mcp/MCP_SETUP.md#common-issues--solutions).

### 3. Build Issues

**Problem**: Build failures or compilation errors

**Solution**:
1. Check TypeScript errors: `npm run type-check`
2. Fix linting issues: `npm run lint`
3. Verify all imports are correct
4. Check for missing dependencies

### 4. Performance Issues

**Problem**: Slow development server or build times

**Solution**:
1. Clear Next.js cache: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check for large dependencies
4. Optimize imports and bundle size

## 🔄 Pull Request Process

### Before Submitting

1. **Test thoroughly**
   - Run all tests: `npm test`
   - Check linting: `npm run lint`
   - Test MCP integration (if applicable)
   - Verify SSR compatibility

2. **Update documentation**
   - Update README if needed
   - Add inline code comments
   - Update type definitions
   - Update MCP documentation if changes affect MCP functionality

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
- **MCP Questions**: Refer to [MCP Setup Guide](src/services/mcp/MCP_SETUP.md)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub Copilot MCP Server](https://github.com/github/github-mcp-server)

---

Thank you for contributing to Sirelia! 🚀 