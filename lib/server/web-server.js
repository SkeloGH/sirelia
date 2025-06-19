import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME type mapping
const mimeTypes = {
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

export async function startWebServer(port = 3000) {
  return new Promise((resolve, reject) => {
    try {
      // Find the static files directory
      const staticDir = join(__dirname, '../../out');
      
      const server = createServer(async (req, res) => {
        try {
          let filePath = req.url;
          
          // Default to index.html for root path
          if (filePath === '/' || filePath === '') {
            filePath = '/index.html';
          }
          
          // Remove query parameters
          filePath = filePath.split('?')[0];
          
          // Security: prevent directory traversal
          if (filePath.includes('..')) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
            return;
          }
          
          // Resolve file path
          const fullPath = join(staticDir, filePath);
          
          // Read file
          const content = await readFile(fullPath);
          
          // Set content type
          const ext = extname(filePath);
          const contentType = mimeTypes[ext] || 'application/octet-stream';
          
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
          
        } catch (error) {
          if (error.code === 'ENOENT') {
            // File not found, serve index.html for SPA routing
            try {
              const indexPath = join(staticDir, 'index.html');
              const content = await readFile(indexPath);
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content);
            } catch {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found');
            }
          } else {
            console.error('Server error:', error);
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