// Example configuration for Siren application
// Copy this file to config.ts and fill in your actual values

export const config = {
  // AI Provider Configuration
  ai: {
    // OpenAI (example)
    openai: {
      apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',
    },
    // Anthropic (example)
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || 'your_anthropic_api_key_here',
    },
  },

  // MCP Configuration
  mcp: {
    // GitHub Personal Access Token
    githubToken: process.env.GITHUB_TOKEN || 'your_github_token_here',
    // MCP Server Configuration
    serverUrl: process.env.MCP_SERVER_URL || 'ws://localhost:3001',
  },

  // Application Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Siren',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
};

export default config; 