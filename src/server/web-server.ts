import { createServer } from 'http';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME type mapping
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

interface ServerInstance {
  close: () => void;
}

export async function startWebServer(port = 3000): Promise<ServerInstance> {
  return new Promise((resolve, reject) => {
    try {
      // Find the static files directory
      const staticDir = path.join(__dirname, '../../out');
      
      const server = createServer(async (req, res) => {
        try {
          let filePath = req.url;
          
          // Default to index.html for root path
          if (filePath === '/' || filePath === '') {
            filePath = '/index.html';
          }
          
          // Remove query parameters
          filePath = filePath?.split('?')[0] || '/index.html';
          
          // Security: prevent directory traversal
          if (filePath.includes('..')) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
            return;
          }
          
          // Resolve file path
          const fullPath = path.join(staticDir, filePath);
          
          // Read file
          const content = await readFile(fullPath);
          
          // Set content type
          const ext = path.extname(filePath);
          const contentType = mimeTypes[ext] || 'application/octet-stream';
          
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
          
        } catch (error) {
          const err = error as NodeJS.ErrnoException;
          if (err.code === 'ENOENT') {
            // File not found, serve index.html for SPA routing
            try {
              const indexPath = path.join(staticDir, 'index.html');
              const content = await readFile(indexPath);
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content);
            } catch {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found');
            }
          } else {
            console.error('Server error:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
          }
        }
      });
      
      server.listen(port, () => {
        console.log(`✅ Web server started on port ${port}`);
        resolve({
          close: () => {
            server.close();
          }
        });
      });
      
      server.on('error', (error) => {
        console.error('❌ Web server error:', error);
        reject(error);
      });
      
    } catch (error) {
      console.error('❌ Failed to start web server:', error);
      reject(error);
    }
  });
} 