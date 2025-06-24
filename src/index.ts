// Main entry point for the Sirelia npm package
export { init } from './cli/init';
export { start } from './cli/start';
export { startWebServer } from './server/web-server';
export { startBridgeServer } from './server/bridge-server';
export { startFileWatcher } from './watcher/file-watcher';

// Default export for backward compatibility
export default {
  init: (await import('./cli/init')).init,
  start: (await import('./cli/start')).start,
  startWebServer: (await import('./server/web-server')).startWebServer,
  startBridgeServer: (await import('./server/bridge-server')).startBridgeServer,
  startFileWatcher: (await import('./watcher/file-watcher')).startFileWatcher
}; 