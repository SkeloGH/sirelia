import { WebSocketServer, WebSocket } from 'ws';

// WebSocket server for browser communication
const wss = new WebSocketServer({ port: 3001 });

// Store connected browser clients
const browserClients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  console.log('Browser client connected');
  browserClients.add(ws);
  
  ws.on('close', () => {
    console.log('Browser client disconnected');
    browserClients.delete(ws);
  });
});

// Broadcast Mermaid code to all connected browsers
export async function broadcastToBrowsers(data: { code: string; theme?: string }) {
  const message = JSON.stringify({
    type: 'mermaid-render',
    ...data,
    timestamp: Date.now()
  });
  
  browserClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Simple function to handle Mermaid rendering requests
export function handleMermaidRender(code: string, theme: string = 'default') {
  console.log('Received Mermaid code:', { code: code.substring(0, 100) + '...', theme });
  
  // Broadcast to all connected browsers
  broadcastToBrowsers({ code, theme });
  
  return {
    success: true,
    message: `Mermaid diagram sent to ${browserClients.size} connected browser(s)`
  };
}

console.log('Mermaid Bridge WebSocket server started on port 3001');