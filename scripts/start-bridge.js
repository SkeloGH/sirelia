// Simple script to start the MCP bridge WebSocket server
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

// Create HTTP server
const httpServer = createServer();

// WebSocket server for browser communication
const wss = new WebSocketServer({ server: httpServer });

// Store connected browser clients
const browserClients = new Set();

wss.on('connection', (ws) => {
  console.log('Browser client connected');
  browserClients.add(ws);
  
  ws.on('close', () => {
    console.log('Browser client disconnected');
    browserClients.delete(ws);
  });
});

// Broadcast Mermaid code to all connected browsers
async function broadcastToBrowsers(data) {
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

// Handle HTTP POST requests for Mermaid code
httpServer.on('request', (req, res) => {
  if (req.method === 'POST' && req.url === '/mermaid') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { code, theme = 'default' } = JSON.parse(body);
        console.log('Received Mermaid code via HTTP:', { code: code.substring(0, 100) + '...', theme });
        
        // Broadcast to all connected browsers
        broadcastToBrowsers({ code, theme });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Mermaid diagram sent to ${browserClients.size} connected browser(s)`
        }));
      } catch (error) {
        console.error('Error processing HTTP request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start the HTTP server on port 3001
httpServer.listen(3001);

console.log('Mermaid Bridge WebSocket server started on port 3001');

// Keep the process running
process.on('SIGINT', () => {
  console.log('Shutting down MCP bridge server...');
  wss.close();
  httpServer.close();
  process.exit(0);
}); 