'use client';

import { useState, useEffect, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';
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
  const [, forceUpdate] = useState({});
  const assistantPanelRef = useRef<ImperativePanelHandle>(null);

  // Listen for theme changes and force re-render
  useEffect(() => {
    const handleThemeChange = () => {
      forceUpdate({});
    };

    window.addEventListener('themeChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  const toggleTab = (tab: TabType) => {
    if (tab === 'assistant') {
      // Assistant tab toggle - only affects itself
      const newCollapsed = new Set(collapsedTabs);
      if (newCollapsed.has('assistant')) {
        newCollapsed.delete('assistant');
      } else {
        newCollapsed.add('assistant');
      }
      setCollapsedTabs(newCollapsed);
    } else {
      // Other tabs - close all other non-assistant tabs, then open the clicked one
      const newCollapsed = new Set<TabType>(['directory', 'repositories', 'configuration']);
      if (collapsedTabs.has(tab)) {
        newCollapsed.delete(tab);
      }
      // Preserve assistant state
      if (!collapsedTabs.has('assistant')) {
        newCollapsed.delete('assistant');
      }
      setCollapsedTabs(newCollapsed);
    }
  };

  const isCollapsed = (tab: TabType) => collapsedTabs.has(tab);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sirelia</h1>
        </div>
      </div>

      {/* Body with vertical resizing */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="vertical" className="h-full">
          {/* Assistant Tab - Resizable */}
          <Panel 
            ref={assistantPanelRef} 
            defaultSize={40} 
            minSize={25} 
            maxSize={70}
            collapsible={true}
            collapsedSize={8}
          >
            <div className="border-b border-gray-200 dark:border-gray-700 h-full flex flex-col">
              <button
                onClick={() => toggleTab('assistant')}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Assistant</span>
                </div>
                {isCollapsed('assistant') ? (
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              {!isCollapsed('assistant') && (
                <div className="px-3 pb-3 flex-1 overflow-hidden">
                  <AssistantTab onGenerateDiagram={onGenerateDiagram} />
                </div>
              )}
            </div>
          </Panel>
          
          {/* Resize Handle */}
          <PanelResizeHandle className="h-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" />
          
          {/* Other Tabs - Fixed */}
          <Panel defaultSize={60} minSize={30}>
            <div className="overflow-y-auto scrollbar-hide h-full">
              {/* Directory Navigator Tab */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleTab('directory')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FolderTree className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Directory Navigator</span>
                  </div>
                  {isCollapsed('directory') ? (
                    <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                {!isCollapsed('directory') && (
                  <div className="px-3 pb-3">
                    <DirectoryTab />
                  </div>
                )}
              </div>

              {/* Connected Repositories Tab */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleTab('repositories')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Connected Repositories</span>
                  </div>
                  {isCollapsed('repositories') ? (
                    <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                {!isCollapsed('repositories') && (
                  <div className="px-3 pb-3">
                    <RepositoriesTab />
                  </div>
                )}
              </div>

              {/* Configuration Tab */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleTab('configuration')}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Configuration</span>
                  </div>
                  {isCollapsed('configuration') ? (
                    <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                {!isCollapsed('configuration') && (
                  <div className="px-3 pb-3">
                    <ConfigurationTab />
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
} 