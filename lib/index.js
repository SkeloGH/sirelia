// Main entry point for the Sirelia npm package
export { init } from './cli/init.js';
export { start } from './cli/start.js';
export { startWebServer } from './server/web-server.js';
export { startBridgeServer } from './server/bridge-server.js';
export { startFileWatcher } from './watcher/file-watcher.js';

// Default export for backward compatibility
export default {
  init: (await import('./cli/init.js')).init,
  start: (await import('./cli/start.js')).start,
  startWebServer: (await import('./server/web-server.js')).startWebServer,
  startBridgeServer: (await import('./server/bridge-server.js')).startBridgeServer,
  startFileWatcher: (await import('./watcher/file-watcher.js')).startFileWatcher
}; 