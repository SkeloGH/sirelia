import { WebSocketServer, WebSocket } from 'ws';
import { createServer, IncomingMessage, ServerResponse } from 'http';

interface MermaidData {
  code: string;
  theme?: string;
}

interface ServerInstance {
  close: () => void;
}

export async function startBridgeServer(port = 3001): Promise<ServerInstance> {
  return new Promise((resolve, reject) => {
    try {
      // Create HTTP server
      const httpServer = createServer();
      
      // WebSocket server for browser communication
      const wss = new WebSocketServer({ server: httpServer });
      
      // Store connected browser clients
      const browserClients = new Set<WebSocket>();
      
      wss.on('connection', (ws) => {
        console.log('🔗 Browser client connected');
        browserClients.add(ws);
        
        ws.on('close', () => {
          console.log('🔗 Browser client disconnected');
          browserClients.delete(ws);
        });
      });
      
      // Broadcast Mermaid code to all connected browsers
      async function broadcastToBrowsers(data: MermaidData) {
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
      httpServer.on('request', (req: IncomingMessage, res: ServerResponse) => {
        if (req.method === 'POST' && req.url === '/mermaid') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { code, theme = 'default' } = JSON.parse(body) as MermaidData;
              console.log('📨 Received Mermaid code via HTTP:', { 
                code: code.substring(0, 100) + '...', 
                theme 
              });
              
              // Broadcast to all connected browsers
              broadcastToBrowsers({ code, theme });
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                message: `Mermaid diagram sent to ${browserClients.size} connected browser(s)`
              }));
            } catch (error) {
              console.error('❌ Error processing HTTP request:', error);
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
        }
      });
      
      // Start the HTTP server
      httpServer.listen(port, () => {
        console.log(`✅ Bridge server started on port ${port}`);
        resolve({
          close: () => {
            wss.close();
            httpServer.close();
          }
        });
      });
      
      httpServer.on('error', (error) => {
        console.error('❌ Bridge server error:', error);
        reject(error);
      });
      
    } catch (error) {
      console.error('❌ Failed to start bridge server:', error);
      reject(error);
    }
  });
} 