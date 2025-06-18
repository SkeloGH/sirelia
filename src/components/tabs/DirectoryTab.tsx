'use client';

import { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export default function DirectoryTab() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Sample file tree structure
  const fileTree: FileNode[] = [
    {
      name: 'src',
      type: 'directory',
      children: [
        {
          name: 'app',
          type: 'directory',
          children: [
            { name: 'page.tsx', type: 'file' },
            { name: 'layout.tsx', type: 'file' },
            { name: 'globals.css', type: 'file' }
          ]
        },
        {
          name: 'components',
          type: 'directory',
          children: [
            { name: 'LeftPanel.tsx', type: 'file' },
            { name: 'RightPanel.tsx', type: 'file' },
            {
              name: 'tabs',
              type: 'directory',
              children: [
                { name: 'AssistantTab.tsx', type: 'file' },
                { name: 'DirectoryTab.tsx', type: 'file' },
                { name: 'RepositoriesTab.tsx', type: 'file' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'public',
      type: 'directory',
      children: [
        { name: 'favicon.ico', type: 'file' }
      ]
    },
    { name: 'package.json', type: 'file' },
    { name: 'tsconfig.json', type: 'file' },
    { name: 'README.md', type: 'file' }
  ];

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: FileNode, path: string = '', level: number = 0) => {
    const isExpanded = expandedNodes.has(path);
    const isSelected = selectedFile === path;
    const indent = level * 16;

    if (node.type === 'directory') {
      return (
        <div key={path}>
          <button
            onClick={() => toggleNode(path)}
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
                renderNode(child, `${path}/${child.name}`, level + 1)
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <button
          key={path}
          onClick={() => setSelectedFile(path)}
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

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        File Explorer
      </div>
      <div className="border border-gray-200 rounded-md bg-white">
        {fileTree.map((node) => renderNode(node, node.name))}
      </div>
      {selectedFile && (
        <div className="text-xs text-gray-500">
          Selected: {selectedFile}
        </div>
      )}
    </div>
  );
} 