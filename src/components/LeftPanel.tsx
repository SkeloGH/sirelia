'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  FolderTree, 
  GitBranch, 
  Settings, 
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import AssistantTab from './tabs/AssistantTab';
import DirectoryTab from './tabs/DirectoryTab';
import RepositoriesTab from './tabs/RepositoriesTab';
import ConfigurationTab from './tabs/ConfigurationTab';

interface LeftPanelProps {
  onGenerateDiagram: (code: string) => void;
}

type TabType = 'assistant' | 'directory' | 'repositories' | 'configuration';

export default function LeftPanel({ onGenerateDiagram }: LeftPanelProps) {
  const [collapsedTabs, setCollapsedTabs] = useState<Set<TabType>>(new Set(['directory', 'repositories', 'configuration']));

  const toggleTab = (tab: TabType) => {
    const newCollapsed = new Set(collapsedTabs);
    if (newCollapsed.has(tab)) {
      newCollapsed.delete(tab);
    } else {
      newCollapsed.add(tab);
    }
    setCollapsedTabs(newCollapsed);
  };

  const isCollapsed = (tab: TabType) => collapsedTabs.has(tab);

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Sirelia</h1>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Assistant Tab */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleTab('assistant')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">Assistant</span>
            </div>
            {isCollapsed('assistant') ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {!isCollapsed('assistant') && (
            <div className="px-3 pb-3">
              <AssistantTab onGenerateDiagram={onGenerateDiagram} />
            </div>
          )}
        </div>

        {/* Directory Navigator Tab */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleTab('directory')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">Directory Navigator</span>
            </div>
            {isCollapsed('directory') ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {!isCollapsed('directory') && (
            <div className="px-3 pb-3">
              <DirectoryTab />
            </div>
          )}
        </div>

        {/* Connected Repositories Tab */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleTab('repositories')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">Connected Repositories</span>
            </div>
            {isCollapsed('repositories') ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {!isCollapsed('repositories') && (
            <div className="px-3 pb-3">
              <RepositoriesTab />
            </div>
          )}
        </div>

        {/* Configuration Tab */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleTab('configuration')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">Configuration</span>
            </div>
            {isCollapsed('configuration') ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {!isCollapsed('configuration') && (
            <div className="px-3 pb-3">
              <ConfigurationTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 