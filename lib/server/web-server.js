import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startWebServer(port = 3000) {
  return new Promise((resolve, reject) => {
    // Find the Next.js app directory
    const appDir = path.join(__dirname, '../../dist');
    
    // Start Next.js server
    const env = { ...process.env, PORT: port.toString() };
    const server = spawn('node', ['server.js'], {
      cwd: appDir,
      env,
      stdio: 'pipe'
    });
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') || output.includes('started')) {
        console.log(`✅ Web server started on port ${port}`);
        resolve(server);
      }
    });
    
    server.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('Error') || error.includes('Failed')) {
        console.error('❌ Web server error:', error);
        reject(new Error(error));
      }
    });
    
    server.on('error', (error) => {
      console.error('❌ Failed to start web server:', error);
      reject(error);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Web server startup timeout'));
    }, 10000);
  });
} 