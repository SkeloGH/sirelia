export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface RepositoryConfig {
  url: string;
  token: string;
  isConnected: boolean;
}

export interface MCPConfig {
  serverUrl: string;
  token?: string;
  headers?: Record<string, string>;
  name?: string;
  isEnabled: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
} 