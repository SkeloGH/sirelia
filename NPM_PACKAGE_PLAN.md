# Sirelia NPM Package Conversion Plan

## Overview

This document outlines the plan to convert the current Sirelia Next.js application into a distributable npm package that provides a seamless developer experience for Mermaid diagram generation and visualization.

## Current State Analysis

### What We Have
- **Next.js Web Application**: Full-featured web interface for Mermaid diagram editing
- **WebSocket Bridge Server**: Real-time communication between components
- **MCP Integration**: Model Context Protocol support for enhanced functionality
- **Repository Integration**: GitHub API integration for code context
- **Modern UI**: React-based interface with Tailwind CSS

### What We Need to Build
- **CLI Tool**: Command-line interface for easy setup and usage
- **File Watcher**: Automatic detection of changes in `.sirelia.mdd` files
- **Package Structure**: Proper npm package organization
- **Build System**: Compilation and bundling for distribution

## Implementation Plan

### Phase 1: Package Structure Setup ✅

#### 1.1 Package Configuration
- [x] Update `package.json` with npm package metadata
- [x] Add CLI binary configuration
- [x] Configure build scripts
- [x] Add necessary dependencies (`commander`, `chokidar`)

#### 1.2 Directory Structure
```
sirelia/
├── bin/
│   └── sirelia.js          # CLI entry point
├── lib/
│   ├── cli/
│   │   ├── init.js         # npx sirelia init command
│   │   └── start.js        # npm run sirelia:start command
│   ├── server/
│   │   ├── web-server.js   # Next.js web server
│   │   └── bridge-server.js # WebSocket bridge server
│   ├── watcher/
│   │   └── file-watcher.js # .sirelia.mdd file watcher
│   └── index.js            # Main package entry point
├── templates/
│   └── .sirelia.mdd        # Template file for initialization
└── dist/                   # Built Next.js application
```

### Phase 2: CLI Implementation ✅

#### 2.1 CLI Commands
- [x] `sirelia init`: Initialize project with `.sirelia.mdd` file
- [x] `sirelia start`: Start web server, bridge server, and file watcher
- [x] Command-line options for customization

#### 2.2 Initialization Process
- [x] Create `.sirelia.mdd` file with template content
- [x] Add to `.gitignore` automatically
- [x] Add `sirelia:start` script to `package.json`

### Phase 3: Server Components ✅

#### 3.1 Web Server
- [x] Next.js application server
- [x] Configurable port
- [x] Graceful startup and shutdown

#### 3.2 Bridge Server
- [x] WebSocket server for real-time communication
- [x] HTTP endpoint for receiving Mermaid code
- [x] Broadcasting to connected clients

#### 3.3 File Watcher
- [x] Monitor `.sirelia.mdd` file changes
- [x] Extract Mermaid code blocks from markdown
- [x] Send updates to bridge server

### Phase 4: Build System ✅

#### 4.1 TypeScript Configuration
- [x] Separate config for CLI components
- [x] ES module support
- [x] Proper output directory structure

#### 4.2 Build Scripts
- [x] `npm run package:build`: Build both Next.js app and CLI
- [x] `npm run build:cli`: Build CLI components only
- [x] `prepublishOnly`: Automatic build before publishing

## User Experience Flow

### 1. Installation
```bash
npm install -g sirelia
```

### 2. Initialization
```bash
sirelia init
```
**Creates:**
- `.sirelia.mdd` file with example diagrams
- Updates `.gitignore` to exclude `.sirelia.mdd`
- Adds `sirelia:start` script to `package.json`

### 3. Usage
```bash
sirelia start
```
**Starts:**
- Web server on http://localhost:3000
- Bridge server on port 3001
- File watcher monitoring `.sirelia.mdd`

### 4. Workflow
1. Edit `.sirelia.mdd` in any text editor
2. Save file to trigger automatic update
3. View real-time changes in web interface
4. Use web interface for advanced editing

### 5. Multi-Project Support
```bash
# Project 1
cd project1
sirelia init
sirelia start

# Project 2 (in another terminal)
cd project2
sirelia init
sirelia start
```

## Technical Implementation Details

### File Watcher Logic
```javascript
// Monitor .sirelia.mdd file
// Extract Mermaid code blocks using regex
// Send via HTTP POST to bridge server
// Bridge server broadcasts to web clients
```

### WebSocket Communication
```javascript
// Bridge server receives HTTP POST
// Broadcasts to all connected web clients
// Web clients update diagram in real-time
```

### Mermaid Code Extraction
```javascript
// Parse markdown content
// Find ```mermaid code blocks
// Extract and validate Mermaid syntax
// Send to bridge server
```

## Package Distribution

### Files to Include
- `bin/`: CLI executable
- `lib/`: Compiled JavaScript modules
- `templates/`: Template files
- `out/`: Built Next.js static files

### Dependencies
- **Production**: `commander`, `chokidar`, `ws`, `next`, `react`, etc.
- **Development**: TypeScript, ESLint, build tools

### Publishing Process
1. Build package: `npm run package:build`
2. Test locally: `npm pack`
3. Publish: `npm publish`

## Future Enhancements

### Phase 5: Advanced Features
- [ ] AI-powered diagram generation
- [ ] Repository integration
- [ ] Export functionality (PNG, SVG, PDF)
- [ ] Collaboration features
- [ ] Custom themes and styling

### Phase 6: Ecosystem Integration
- [ ] VS Code extension
- [ ] GitHub Actions integration
- [ ] CI/CD pipeline support
- [ ] Documentation site

## Testing Strategy

### Unit Tests
- CLI command functionality
- File watcher logic
- Mermaid code extraction
- WebSocket communication

### Integration Tests
- End-to-end workflow
- Multiple diagram support
- Error handling scenarios

### Manual Testing
- Different operating systems
- Various file editors
- Network conditions

## Documentation

### User Documentation
- [x] Updated README with npm package usage
- [x] CLI command reference
- [x] Example diagrams and use cases

### Developer Documentation
- [x] Package structure explanation
- [x] Build process documentation
- [x] Contributing guidelines

## Success Metrics

### User Adoption
- npm download statistics
- GitHub stars and forks
- Community feedback

### Technical Metrics
- Build success rate
- Runtime performance
- Error rates and debugging

### Developer Experience
- Setup time reduction
- Workflow efficiency
- User satisfaction scores

## Conclusion

This plan transforms Sirelia from a standalone Next.js application into a powerful, distributable npm package that provides a seamless developer experience for Mermaid diagram generation and visualization. The implementation focuses on ease of use, real-time updates, and extensibility for future enhancements.