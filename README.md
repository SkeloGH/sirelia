# Sirelia - Real-time Mermaid Diagram Generation

Sirelia is an npm package that provides real-time Mermaid diagram generation and visualization. It includes a web interface for editing diagrams and a file watcher that automatically updates diagrams when you save your `.sirelia.mdd` file.

## Features

### 🎯 Core Functionality
- **Real-time Mermaid Rendering**: Instant preview of diagrams as you edit
- **File Watcher**: Automatically detects changes in `.sirelia.mdd` files
- **Web Interface**: Modern, intuitive interface for diagram editing
- **CodeMirror Editor**: Advanced code editing with syntax highlighting
- **Single Diagram Support**: Edit and view one diagram at a time
- **Out-of-the-Box Experience**: Works immediately after global installation

### 🎨 User Interface
- **Modern Design**: Clean, responsive interface built with Tailwind CSS
- **Real-time Updates**: See changes instantly as you edit
- **Theme Support**: Light and dark mode support
- **Interactive Diagram Viewer**: Zoom, pan, and export functionality
- **Code Editor Toggle**: Switch between diagram view and code editing

### 🔧 Technical Stack
- **Next.js 15**: App Router with TypeScript
- **Tailwind CSS**: Utility-first styling
- **CodeMirror 6**: Advanced code editor
- **Mermaid v11**: Diagram rendering engine
- **WebSocket**: Real-time communication
- **Chokidar**: File watching capabilities
- **Static Export**: Pre-built web interface for immediate serving

## 🤖 Sirelia as Your Coding Copilot for Visual Thinking

Sirelia isn't just a diagram renderer—it's your visual copilot for software design, architecture, and documentation. Use Sirelia alongside your favorite AI coding assistants (like GitHub Copilot, Cursor, or ChatGPT) to:

- **Instantly visualize architecture**: Paste or generate Mermaid diagrams from code, requirements, or AI suggestions and see them live.
- **Collaborate visually**: Share `.sirelia.mdd` files in your repo for team-wide, always-up-to-date diagrams.
- **Document as you code**: Keep architecture, flows, and data models in sync with your codebase, using Sirelia as a living documentation hub.
- **AI + Diagrams**: Prompt your AI assistant to generate Mermaid code, drop it into `.sirelia.mdd`, and instantly see the result in your browser.
- **Frictionless onboarding**: New team members can run `sirelia start` and immediately explore your system visually.

**Sirelia bridges the gap between code, documentation, and visual thinking—making your AI copilot even more powerful.**

## Quick Start

### Installation

Install Sirelia **globally** for use in any project:

```bash
npm install -g sirelia
```

### Initialize in Your Project

Navigate to your project directory and run:

```bash
sirelia init
```

This will:
- Create a `.sirelia.mdd` file with example diagrams
- Add `.sirelia.mdd` to your `.gitignore`
- Add a `sirelia:start` script to your `package.json`

### Start Sirelia

```bash
sirelia start
```

Or use the npm script:

```bash
npm run sirelia:start
```

This will:
- Start the web server on http://localhost:3000
- Start the bridge server on port 3001
- Watch your `.sirelia.mdd` file for changes
- Automatically send updates to the web interface

## Usage

### 1. Edit Your Diagrams

Open the `.sirelia.mdd` file in your favorite editor and add Mermaid diagrams:

```markdown
# My Project Architecture

```mermaid
graph TD
    A[Frontend] --> B[API Gateway]
    B --> C[User Service]
    B --> D[Product Service]
    C --> E[Database]
    D --> E
```

## API Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: GET /users
    API->>Database: SELECT * FROM users
    Database-->>API: User data
    API-->>Client: JSON response
```
```

### 2. View in Web Interface

Open http://localhost:3000 to see your diagrams rendered in real-time. The web interface provides:

- **Diagram Viewer**: See your diagrams with zoom, pan, and export options
- **Code Editor**: Edit Mermaid syntax with full IDE features
- **Real-time Updates**: Changes appear instantly as you save your file
- **Interactive Controls**: Toggle between view and edit modes

### 3. Advanced Usage

#### Custom Ports

```bash
sirelia start --port 8080 --bridge-port 8081
```

#### Watch Different File

```bash
sirelia start --watch diagrams.md
```

#### Force Reinitialize

```bash
sirelia init --force
```

## Supported Diagram Types

- **Flowcharts**: `graph TD`, `flowchart LR`
- **Sequence Diagrams**: `sequenceDiagram`
- **Class Diagrams**: `classDiagram`
- **State Diagrams**: `stateDiagram-v2`
- **Entity Relationship**: `erDiagram`
- **User Journey**: `journey`
- **Gantt Charts**: `gantt`
- **Pie Charts**: `pie`
- **Git Graphs**: `gitgraph`
- **Mind Maps**: `mindmap`
- **Timeline**: `timeline`

## CLI Commands

### `sirelia init [options]`

Initialize Sirelia in the current project.

**Options:**
- `-f, --force`: Force overwrite existing configuration

### `sirelia start [options]`

Start the Sirelia web server and bridge.

**Options:**
- `-p, --port <port>`: Web server port (default: 3000)
- `-b, --bridge-port <port>`: Bridge server port (default: 3001)
- `-w, --watch <file>`: Watch specific file (default: .sirelia.mdd)

## Project Structure

After initialization, your project will have:

```
your-project/
├── .sirelia.mdd          # Your Mermaid diagrams
├── .gitignore           # Updated to ignore .sirelia.mdd
└── package.json         # Updated with sirelia:start script
```

## Multi-Project Usage

Since Sirelia is installed globally, you can use it in multiple projects:

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

Each project will have its own `.sirelia.mdd` file and independent file watching.

## Development

### Building the Package

```bash
npm run package:build
```

### Publishing

```bash
npm publish
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Roadmap

- [x] File watcher for automatic updates
- [x] Web interface for diagram editing
- [x] Global npm package installation
- [x] Out-of-the-box experience
- [x] Multi-project support
- [x] Real-time diagram rendering
- [x] Code editor integration
- [x] Export functionality (PNG, SVG, MMD, GV)
- [x] Theme support (light/dark)
- [ ] Multiple diagram support
- [ ] Resizable panels
- [ ] AI-powered diagram generation
- [ ] Repository integration
