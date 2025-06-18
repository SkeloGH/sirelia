'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Folder, File, ChevronRight, ChevronDown, FolderOpen, RefreshCw } from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

interface GitHubContentItem {
  name: string;
  type: 'file' | 'dir';
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
}

export default function DirectoryTab() {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const loadRepositoryStructure = useCallback(async () => {
    const savedRepoConfig = localStorage.getItem('sirelia-repo-config');
    
    if (!savedRepoConfig) {
      setHasAttemptedLoad(true);
      setFileTree([]);
      return;
    }

    try {
      const config = JSON.parse(savedRepoConfig);
      
      if (config.isConnected && config.url) {
        setIsLoading(true);
        setError(null);
        
        // Extract owner and repo from GitHub URL
        const urlParts = config.url.split('/');
        const owner = urlParts[urlParts.length - 2];
        const repo = urlParts[urlParts.length - 1];
        
        // Fetch repository structure using GitHub API
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3+json'
        };
        
        // Add authorization if token is provided
        if (config.token) {
          headers['Authorization'] = `token ${config.token}`;
        }
        
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents`,
          { headers }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch repository: ${response.statusText}`);
        }
        
        const contents = await response.json() as GitHubContentItem[];
        
        const tree = await buildFileTree(contents, owner, repo, config.token);
        setFileTree(tree);
      } else {
        setFileTree([]);
      }
    } catch (err) {
      console.error('DirectoryTab: Error loading repository structure:', err);
      setError(err instanceof Error ? err.message : 'Failed to load repository structure');
      setFileTree([]);
    } finally {
      setIsLoading(false);
      setHasAttemptedLoad(true);
    }
  }, []);

  // Load repository configuration and fetch file structure
  useEffect(() => {
    loadRepositoryStructure();
  }, [loadRepositoryStructure]);

  // Listen for storage changes to refresh when repository is connected
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sirelia-repo-config') {
        loadRepositoryStructure();
      }
    };

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomEvent = () => {
      loadRepositoryStructure();
    };
    window.addEventListener('repositoryConnected', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('repositoryConnected', handleCustomEvent);
    };
  }, [loadRepositoryStructure]);

  const buildFileTree = async (contents: GitHubContentItem[], owner: string, repo: string, token?: string): Promise<FileNode[]> => {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const processContents = async (items: GitHubContentItem[], path: string = ''): Promise<FileNode[]> => {
      const nodes: FileNode[] = [];
      
      for (const item of items) {
        const node: FileNode = {
          name: item.name,
          type: item.type === 'dir' ? 'directory' : 'file',
          path: path ? `${path}/${item.name}` : item.name
        };
        
        if (item.type === 'dir') {
          try {
            const response = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/contents/${node.path}`,
              { headers }
            );
            
            if (response.ok) {
              const childContents = await response.json() as GitHubContentItem[];
              node.children = await processContents(childContents, node.path);
            }
          } catch (error) {
            console.warn(`Failed to fetch contents for ${node.path}:`, error);
          }
        }
        
        nodes.push(node);
      }
      
      return nodes;
    };

    return processContents(contents);
  };

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.path);
    const isSelected = selectedFile === node.path;
    const indent = level * 16;

    if (node.type === 'directory') {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleNode(node.path)}
            className={`w-full flex items-center space-x-1 px-2 py-1 text-sm hover:bg-gray-100 rounded ${
              isSelected ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
            }`}
            style={{ paddingLeft: `${indent + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <Folder className="w-3 h-3 text-blue-500" />
            <span>{node.name}</span>
          </button>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => 
                renderNode(child, level + 1)
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <button
          key={node.path}
          onClick={() => setSelectedFile(node.path)}
          className={`w-full flex items-center space-x-1 px-2 py-1 text-sm hover:bg-gray-100 rounded ${
            isSelected ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${indent + 8}px` }}
        >
          <File className="w-3 h-3 text-gray-500" />
          <span>{node.name}</span>
        </button>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          File Explorer
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-gray-600">Loading repository structure...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          File Explorer
        </div>
        <div className="text-center py-8 text-gray-500">
          <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-red-600">Error loading repository</p>
          <p className="text-xs mb-4">{error}</p>
          <button
            onClick={loadRepositoryStructure}
            className="flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          File Explorer
        </div>
        {fileTree.length > 0 && (
          <button
            onClick={loadRepositoryStructure}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh repository structure"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {!hasAttemptedLoad ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-gray-600">Loading...</span>
        </div>
      ) : fileTree.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No repository connected</p>
          <p className="text-xs">Connect a repository in the Configuration tab to browse its file structure</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-md bg-white">
          {fileTree.map((node) => renderNode(node))}
        </div>
      )}
      
      {selectedFile && (
        <div className="text-xs text-gray-500">
          Selected: {selectedFile}
        </div>
      )}
    </div>
  );
} 