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

5. **Test the package locally**
   ```bash
   npm run package:build
   npm link
   # In another directory
   sirelia init
   sirelia start
   ```

## 🏗️ Project Architecture

### Core Components

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── CodeMirrorEditor.tsx  # Code editor component
│   ├── MermaidRenderer.tsx   # Diagram rendering component
│   ├── ThemeSwitch.tsx       # Theme switching component
│   ├── Toolbar.tsx           # Toolbar component
│   ├── Toast.tsx             # Toast notifications
│   └── ErrorBoundary.tsx     # Error boundary component
├── services/             # Business logic services
│   └── bridge/           # Mermaid bridge services
│       ├── mermaid-client.ts  # WebSocket client
│       └── mermaid-server.ts  # WebSocket server
└── config/               # Configuration files
    └── mermaid.ts        # Mermaid configuration
```

### CLI Components

```
lib/
├── cli/
│   ├── init.js           # CLI init command
│   └── start.js          # CLI start command
├── server/
│   ├── web-server.js     # Static file server
│   └── bridge-server.js  # WebSocket bridge server
├── watcher/
│   └── file-watcher.js   # File watching service
└── index.js              # Main package entry point
```

### Key Services

- **MermaidBridgeClient**: Connects to WebSocket server for real-time diagram rendering
- **MermaidBridgeServer**: WebSocket server for broadcasting diagrams to browsers
- **FileWatcher**: Monitors `.sirelia.mdd` files for changes and extracts Mermaid code
- **WebServer**: Serves the static Next.js application

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

### 2. WebSocket Connection Issues

**Problem**: WebSocket connection fails or disconnects

**Solution**:
1. Ensure the bridge server is running: `npm run mcp-bridge`
2. Check that port 3001 is not blocked
3. Verify the browser can connect to `ws://localhost:3001`

### 3. Build Issues

**Problem**: Build failures or compilation errors

**Solution**:
1. Check TypeScript errors: `npm run type-check`
2. Fix linting issues: `npm run lint`
3. Verify all imports are correct
4. Check for missing dependencies

### 4. File Watcher Issues

**Problem**: Changes to `.sirelia.mdd` not detected

**Solution**:
1. Ensure the file watcher is running: `sirelia start`
2. Check file permissions on `.sirelia.mdd`
3. Verify the file contains valid Mermaid code blocks
4. Check console logs for file watcher errors

## 🔄 Pull Request Process

### Before Submitting

1. **Test thoroughly**
   - Run all tests: `npm test`
   - Check linting: `npm run lint`
   - Test WebSocket bridge functionality
   - Verify SSR compatibility
   - Test file watcher functionality

2. **Update documentation**
   - Update README if needed
   - Add inline code comments
   - Update type definitions
   - Update API documentation if changes affect functionality

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

1. **Code Review**: All changes must be reviewed by at least one maintainer
2. **Testing**: Ensure all tests pass and new functionality is tested
3. **Documentation**: Verify documentation is updated
4. **Merge**: Once approved, changes will be merged to main branch

## 🎯 Getting Help

- **Issues**: Create an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check the README and inline code comments

---

Thank you for contributing to Sirelia! 🎨✨