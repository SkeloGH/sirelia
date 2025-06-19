# Sirelia Mermaid Bridge

A real-time Mermaid diagram rendering bridge that connects Cursor IDE to a browser app via WebSocket.

## 🎯 Overview

This implementation provides a simple way to render Mermaid diagrams in real-time from external sources (like Cursor IDE) to a browser application.

## 🏗️ Architecture

```
External Source (Cursor IDE) → API Endpoint → WebSocket Server → Browser App
```

### Components:

1. **WebSocket Server** (`scripts/start-mcp-bridge.js`)
   - Runs on port 3001
   - Receives Mermaid code and broadcasts to connected browsers

2. **API Endpoint** (`src/app/api/mermaid-bridge/route.ts`)
   - Accepts POST requests with Mermaid code
   - Forwards to WebSocket server

3. **Browser Client** (`src/services/mcp/mermaid-bridge-client.ts`)
   - Connects to WebSocket server
   - Receives and renders diagrams in real-time

4. **Main App** (`src/app/page.tsx`)
   - Displays connection status and rendered diagrams
   - Simple, focused interface

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the WebSocket Server

```bash
npm run mcp-bridge
```

You should see: `Mermaid Bridge WebSocket server started on port 3001`

### 3. Start the Browser App

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 4. Test the Bridge

Visit http://localhost:3000/test-mermaid to test the functionality:

1. Click "Load Test Code" to load a sample Mermaid diagram
2. Click "Send Test Mermaid" to send it to the main page
3. Check the main page to see the diagram render in real-time

## 🔧 Usage

### Sending Mermaid Code

Send a POST request to `/api/mermaid-bridge`:

```bash
curl -X POST http://localhost:3000/api/mermaid-bridge \
  -H "Content-Type: application/json" \
  -d '{
    "code": "graph TD\nA[Start] --> B[End]",
    "theme": "default"
  }'
```

### From Cursor IDE

You can integrate this with Cursor IDE by:

1. Creating a simple script that calls the API endpoint
2. Using the MCP (Model Context Protocol) to send Mermaid code
3. Setting up a custom tool in Cursor that renders diagrams

## 🎯 Features

- ✅ Real-time WebSocket communication
- ✅ Automatic reconnection on disconnect
- ✅ Connection status indicator
- ✅ Live diagram rendering
- ✅ Simple API endpoint
- ✅ Test page for verification

## 🔧 Technical Details

### WebSocket Message Format

```typescript
interface MermaidMessage {
  type: 'mermaid-render';
  code: string;
  theme?: string;
  timestamp: number;
}
```

### API Request Format

```typescript
{
  code: string;      // Mermaid diagram code
  theme?: string;    // Optional theme (default: 'default')
}
```

### Connection Status

The browser app shows:
- 🟢 **Connected**: WebSocket connection active
- 🔴 **Disconnected**: WebSocket connection lost (auto-reconnects)

## 🎯 Next Steps

### For Cursor IDE Integration

1. **Create MCP Server**: Build a proper MCP server that Cursor can connect to
2. **Add MCP Tool**: Create a `render_mermaid` tool in the MCP server
3. **Configure Cursor**: Set up Cursor to use the MCP server

### For Enhanced Features

1. **Theme Support**: Add more Mermaid themes
2. **Multiple Diagrams**: Support multiple diagrams in one session
3. **Collaboration**: Allow multiple users to view the same diagram
4. **History**: Save and restore diagram history

## 🐛 Troubleshooting

### WebSocket Connection Issues

1. Make sure the WebSocket server is running: `npm run mcp-bridge`
2. Check that port 3001 is not blocked by firewall
3. Verify the browser can connect to `ws://localhost:3001`

### Diagram Not Rendering

1. Check browser console for errors
2. Verify Mermaid code syntax is correct
3. Ensure the WebSocket message format is correct

### API Endpoint Issues

1. Check that the Next.js app is running
2. Verify the API route is accessible at `/api/mermaid-bridge`
3. Check request format and headers

## 📁 File Structure

```
src/
├── app/
│   ├── api/mermaid-bridge/route.ts    # API endpoint
│   ├── page.tsx                       # Main app page
│   └── test-mermaid/page.tsx          # Test page
├── services/mcp/
│   ├── mermaid-bridge-client.ts       # WebSocket client
│   └── mermaid-bridge-server.ts       # WebSocket server (unused)
└── components/
    └── MermaidRenderer.tsx            # Diagram renderer

scripts/
└── start-mcp-bridge.js               # WebSocket server script
```

## 🎯 Success Criteria

- ✅ WebSocket server starts and listens on port 3001
- ✅ Browser connects to WebSocket automatically
- ✅ Connection status shows correctly
- ✅ Mermaid code sent via API renders in browser
- ✅ Real-time updates work
- ✅ Clean, focused UI without sidebar complexity

The implementation is now ready for testing and can be extended for Cursor IDE integration! 