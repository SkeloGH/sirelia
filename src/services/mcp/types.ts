// MCPConfig is now imported from src/types/ai.ts

export interface MCPTool {
  parameters: Record<string, unknown>;
  description?: string;
  execute?: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface MCPToolSet {
  [key: string]: MCPTool;
}

export interface MCPConnectionStatus {
  isConnected: boolean;
  serverUrl?: string;
  capabilities?: string[];
  error?: string;
}

export interface MCPFileInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  sha?: string;
  content?: string;
  mimeType?: string;
}

export interface MCPRepositoryInfo {
  owner: string;
  name: string;
  url: string;
  defaultBranch: string;
  description?: string;
  isPrivate: boolean;
}

export interface MCPGitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  files?: string[];
}

export interface MCPAnalysisResult {
  type: 'architecture' | 'dependencies' | 'structure' | 'custom';
  title: string;
  description: string;
  data: Record<string, unknown>;
  mermaidDiagram?: string;
} 