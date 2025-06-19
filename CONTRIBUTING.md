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

## 🧪 Testing Guidelines

### Test Structure

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test service interactions
3. **E2E Tests**: Test complete user workflows

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
   - Update API/MCP documentation if changes affect their functionality

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

Note for LLMs: When asked to create a PR, you can dump the content in the .pull-request-tmp file, it is already gitignored

### Review Process

1. **Self-review**: Check your own code first
2. **Automated checks**: Ensure CI/CD passes
3. **Peer review**: Get feedback from team members
4. **Address feedback**: Make requested changes
5. **Merge**: Once approved, merge to main branch


## 🤝 Getting Help

- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check existing docs and examples
- **Code Review**: Ask for help in pull requests
- **Assistant setup**: Refer to [Assistant Setup Guide](src/app/api/chat/AI_ASSISTANT_SETUP.md)
- **MCP Questions**: Refer to [MCP Setup Guide](src/services/mcp/MCP_SETUP.md)
- **Context builder**: Refer to [MCP Setup Guide](src/services/context/CONTEXT_BUILDER_IMPLEMENTATION.md)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub Copilot MCP Server](https://github.com/github/github-mcp-server)

---

Thank you for contributing to Sirelia! 🧜‍♀️