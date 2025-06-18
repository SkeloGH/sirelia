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
  name?: string;
  owner?: string;
  isActive?: boolean;
}

export interface RepositoriesState {
  repositories: RepositoryConfig[];
  activeRepositoryId?: string; // URL of the active repository
}

export interface MCPConfig {
  serverUrl: string;
  token?: string;
  headers?: Record<string, string>;
  name?: string;
  isEnabled: boolean;
  isConnected?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
} 