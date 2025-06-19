import { MCPFileInfo } from '../services/mcp/types';

export interface RepositoryContextRequest {
  repositoryUrl: string;
  userRequest: string;
  selectedFiles?: string[];
}

export interface RepositoryContext {
  repository: {
    name: string;
    description: string;
    structure: FileStructure;
    relevantFiles: FileContent[];
  };
  userRequest: {
    original: string;
    intent: string;
    diagramType: string;
  };
  context: {
    fileCount: number;
    totalSize: number;
    fileTypes: Record<string, number>;
    relationships: FileRelationship[];
  };
}

export interface FileStructure {
  totalFiles: number;
  directories: Record<string, MCPFileInfo[]>;
  fileTypes: Record<string, number>;
  structure: MCPFileInfo[];
}

export interface FileContent {
  path: string;
  content: string;
  type: string;
  size: number;
}

export interface FileRelationship {
  from: string;
  to: string;
  type: 'import' | 'dependency' | 'reference';
}

export interface RepositoryInfo {
  name: string;
  description: string;
  owner: string;
  repo: string;
  defaultBranch: string;
  language?: string;
  topics?: string[];
} 