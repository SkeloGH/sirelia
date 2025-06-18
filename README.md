# Siren - AI-Powered Code Visualization

Siren is a Next.js application that generates and edits Mermaid diagrams with AI assistance and repository context. It provides a modern, intuitive interface for creating visual representations of code architecture and workflows.

## Features

### 🎯 Core Functionality
- **AI-Powered Diagram Generation**: Use natural language to generate Mermaid diagrams from your codebase
- **Real-time Mermaid Rendering**: Instant preview of diagrams as you edit
- **CodeMirror Editor**: Advanced code editing with syntax highlighting and Mermaid support
- **Repository Integration**: Connect to GitHub repositories for context-aware diagram generation

### 🎨 User Interface
- **Resizable Panels**: Flexible layout with collapsible and resizable panels
- **Collapsible Tabs**: Organized sections for Assistant, Directory Navigator, and Repository Management
- **Modern Design**: Clean, responsive interface built with Tailwind CSS
- **Icon Library**: Beautiful icons from Lucide React

### 🔧 Technical Stack
- **Next.js 15**: App Router with TypeScript
- **Tailwind CSS**: Utility-first styling
- **CodeMirror 6**: Advanced code editor
- **Mermaid**: Diagram rendering engine
- **React Resizable Panels**: Flexible layout management
- **AI SDK**: Chat and streaming capabilities

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd siren
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Left Panel
- **Assistant Tab**: Chat with AI to generate diagrams
- **Directory Navigator**: Browse your repository structure
- **Connected Repositories**: Manage repository connections

### Right Panel
- **Mermaid Viewer**: See your diagrams rendered in real-time
- **Code Editor**: Edit Mermaid syntax with full IDE features

### Quick Start
1. Click "Generate Login Flow" in the Assistant tab
2. View the generated diagram in the right panel
3. Click "Edit Code" to modify the Mermaid syntax
4. See real-time updates as you type

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI chat API endpoint
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main application page
│   ├── components/
│   │   ├── tabs/
│   │   │   ├── AssistantTab.tsx      # AI chat interface
│   │   │   ├── DirectoryTab.tsx      # File tree navigator
│   │   │   └── RepositoriesTab.tsx   # Repository management
│   │   ├── CodeMirrorEditor.tsx      # Code editor component
│   │   ├── LeftPanel.tsx             # Left panel with tabs
│   │   └── RightPanel.tsx            # Diagram viewer and editor
│   └──
```

## Configuration

### AI Integration
The application includes placeholder AI integration. To connect to a real AI provider:

1. Update `src/app/api/chat/route.ts` with your AI provider credentials
2. Configure the AI SDK in your environment variables
3. Implement MCP (Model Context Protocol) for repository access

### MCP Integration
For full repository context access, implement MCP client integration:

1. Install MCP client library
2. Configure repository authentication
3. Implement file listing and content retrieval methods

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features
1. Create components in `src/components/`
2. Add API routes in `src/app/api/`
3. Update types and interfaces as needed
4. Test with hot reload enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Roadmap

- [ ] Full MCP integration for repository access
- [ ] Advanced AI provider integration
- [ ] Diagram templates and presets
- [ ] Export functionality (PNG, SVG, PDF)
- [ ] Collaboration features
- [ ] Custom themes and styling
- [ ] Plugin system for diagram types
