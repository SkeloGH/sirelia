// Example configuration for Sirelia application
// Copy this file to config.ts and fill in your actual values

export const config = {
  // Bridge Server Configuration
  bridge: {
    // WebSocket server port
    port: process.env.BRIDGE_PORT || 3001,
    // WebSocket server URL
    serverUrl: process.env.BRIDGE_SERVER_URL || 'ws://localhost:3001',
  },

  // Web Server Configuration
  web: {
    // Web server port
    port: process.env.WEB_PORT || 3000,
  },

  // File Watcher Configuration
  watcher: {
    // Default file to watch
    defaultFile: process.env.WATCH_FILE || '.sirelia.mmd',
    // File watching stability threshold (ms)
    stabilityThreshold: process.env.STABILITY_THRESHOLD || 100,
    // File watching poll interval (ms)
    pollInterval: process.env.POLL_INTERVAL || 100,
  },

  // Application Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Sirelia',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.12',
  },

  // Future AI Provider Configuration (not yet implemented)
  ai: {
    // OpenAI (planned)
    openai: {
      apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',
    },
    // Anthropic (planned)
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || 'your_anthropic_api_key_here',
    },
  },

  // Future Repository Integration (not yet implemented)
  repository: {
    // GitHub Personal Access Token (planned)
    githubToken: process.env.GITHUB_TOKEN || 'your_github_token_here',
  },
};

export default config; 