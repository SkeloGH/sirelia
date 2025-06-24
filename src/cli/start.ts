import path from 'path';
import fs from 'fs';
import { startWebServer } from '../server/web-server.js';
import { startBridgeServer } from '../server/bridge-server.js';
import { startFileWatcher } from '../watcher/file-watcher.js';

interface StartOptions {
  port?: number;
  bridgePort?: number;
  watch?: string;
}

export async function start(options: StartOptions = {}) {
  const { 
    port = 3000, 
    bridgePort = 3001, 
    watch = '.sirelia.mmd' 
  } = options;
  
  console.log('🚀 Starting Sirelia...');
  console.log(`📊 Web server: http://localhost:${port}`);
  console.log(`🔗 Bridge server: ws://localhost:${bridgePort}`);
  console.log(`👀 Watching: ${watch}`);
  
  // Check if .sirelia.mmd exists
  const cwd = process.cwd();
  const watchFile = path.join(cwd, watch);
  
  try {
    if (!fs.existsSync(watchFile)) {
      console.log(`⚠️  ${watch} not found. Run 'sirelia init' to create it.`);
      return;
    }
  } catch (error) {
    console.error('Error checking file:', (error as Error).message);
    return;
  }
  
  // Start all services
  const processes: Array<{ close?: () => void; kill?: () => void }> = [];
  
  try {
    // Start web server
    console.log('🌐 Starting web server...');
    const webServer = await startWebServer(port);
    processes.push(webServer);
    
    // Start bridge server
    console.log('🔗 Starting bridge server...');
    const bridgeServer = await startBridgeServer(bridgePort);
    processes.push(bridgeServer);
    
    // Start file watcher
    console.log('👀 Starting file watcher...');
    const fileWatcher = await startFileWatcher(watchFile, bridgePort);
    processes.push(fileWatcher);
    
    console.log('\n✅ Sirelia is running!');
    console.log(`📊 Open http://localhost:${port} to view the web interface`);
    console.log('💡 Edit .sirelia.mmd and save to see real-time updates');
    console.log('\nPress Ctrl+C to stop all services');
    
    // Handle graceful shutdown
    const shutdown = () => {
      console.log('\n🛑 Shutting down Sirelia...');
      processes.forEach(process => {
        if (process && typeof process.close === 'function') {
          process.close();
        } else if (process && typeof process.kill === 'function') {
          process.kill();
        }
      });
      process.exit(0);
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
  } catch (error) {
    console.error('❌ Error starting Sirelia:', (error as Error).message);
    processes.forEach(process => {
      if (process && typeof process.kill === 'function') {
        process.kill();
      }
    });
    process.exit(1);
  }
} 