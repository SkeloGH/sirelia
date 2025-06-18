# Sirelia - AI-Powered Mermaid Code Visualization

Sirelia is a Next.js application that generates and edits Mermaid diagrams with AI assistance and repository context. It provides a modern, intuitive interface for creating visual representations of code architecture and workflows.

## Features

### 🎯 Core Functionality
- **AI-Powered Diagram Generation**: Use natural language to generate Mermaid diagrams from your codebase
- **Real-time Mermaid Rendering**: Instant preview of diagrams as you edit
- **CodeMirror Editor**: Advanced code editing with syntax highlighting and Mermaid support
- **Repository Integration**: Connect to GitHub repositories for context-aware diagram generation

### 🎨 User Interface
- **Resizable Panels**: Flexible layout with collapsible and resizable panels
- **Collapsible Tabs**: Organized sections for Assistant, Directory Navigator, Repository Management, and Configuration
- **Modern Design**: Clean, responsive interface built with Tailwind CSS
- **Icon Library**: Beautiful icons from Lucide React

### 🔧 Technical Stack
- **Next.js 15**: App Router with TypeScript
- **Tailwind CSS**: Utility-first styling
- **CodeMirror 6**: Advanced code editor
- **Mermaid**: Diagram rendering engine
- **React Resizable Panels**: Flexible layout management
- **GitHub API**: Repository structure and content access

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GitHub Personal Access Token (optional for public repos, required for private repos)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sirelia
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

### Configuration
1. Open the **Configuration** tab in the left panel
2. Enter your GitHub repository URL (e.g., `https://github.com/username/repository`)
3. Optionally provide a GitHub Personal Access Token:
   - **Public repos**: Token is optional but provides higher rate limits
   - **Private repos**: Token is required
4. Configure your AI provider settings (OpenAI, Anthropic, or Custom)
5. Save your configuration

### Left Panel
- **Assistant Tab**: Chat with AI to generate diagrams based on your repository
- **Directory Navigator**: Browse your repository structure with real-time file tree
- **Connected Repositories**: View and manage your repository connections
- **Configuration**: Manage repository and AI settings

### Right Panel
- **Mermaid Viewer**: See your diagrams rendered in real-time
- **Code Editor**: Edit Mermaid syntax with full IDE features

### Quick Start
1. Configure your repository in the Configuration tab
2. Browse your code structure in the Directory Navigator
3. Use the Assistant to generate diagrams based on your codebase
4. Edit and refine diagrams in the Code Editor

## Repository Integration

### Current Implementation
- **GitHub API Integration**: Direct integration with GitHub's REST API
- **Public Repository Support**: Access public repos without authentication (limited rate limits)
- **Private Repository Support**: Full access with Personal Access Token
- **Real-time File Tree**: Dynamic loading of repository structure

### Future MCP Integration
The application is designed to support MCP (Model Context Protocol) for enhanced repository access:

- **Enhanced Context**: Deeper integration with repository content and history
- **Code Analysis**: Advanced code understanding and diagram generation
- **Multi-Repository Support**: Work with multiple repositories simultaneously
- **Git Operations**: Direct git operations through MCP

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI chat API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── components/
│   ├── tabs/
│   │   ├── AssistantTab.tsx      # AI chat interface
│   │   ├── DirectoryTab.tsx      # File tree navigator
│   │   ├── RepositoriesTab.tsx   # Repository management
│   │   └── ConfigurationTab.tsx  # Settings and configuration
│   ├── CodeMirrorEditor.tsx      # Code editor component
│   ├── ErrorBoundary.tsx         # Error handling
│   ├── LeftPanel.tsx             # Left panel with tabs
│   └── RightPanel.tsx            # Diagram viewer and editor
```

## Configuration

### Repository Settings
- **Repository URL**: Full GitHub repository URL
- **Access Token**: GitHub Personal Access Token (optional for public repos)
- **Connection Status**: Real-time connection status and error handling

### AI Configuration
- **Provider Selection**: OpenAI, Anthropic, or Custom
- **Model Selection**: Curated model options for each provider
- **Temperature**: Control creativity vs focus (0.0 - 2.0)
- **Max Tokens**: Response length limit (100 - 8000)
- **API Key**: Your AI provider API key

### Local Storage
All configuration is stored locally in the browser for convenience and privacy.

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

- [x] GitHub API integration for repository access
- [x] Real-time file tree navigation
- [x] AI configuration with multiple providers
- [x] Repository connection management
- [ ] Full MCP integration for enhanced repository access
- [ ] Advanced AI provider integration with streaming
- [ ] Diagram templates and presets
- [ ] Export functionality (PNG, SVG, PDF)
- [ ] Collaboration features
- [ ] Custom themes and styling
- [ ] Plugin system for diagram types
- [ ] Multi-repository support
- [ ] Git operations integration
