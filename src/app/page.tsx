'use client';

import { useState, useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import LeftPanel from '@/components/LeftPanel';
import RightPanel from '@/components/RightPanel';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MCPConfig } from '@/types/ai';
import { showToast } from '@/components/Toast';

export default function Home() {
  const [mermaidCode, setMermaidCode] = useState('');

  const handleCodeChange = useCallback((code: string) => {
    setMermaidCode(code);
  }, []);

  const handleGenerateDiagram = useCallback((code: string) => {
    setMermaidCode(code);
  }, []);

  // Auto-connect to MCP on app load
  useEffect(() => {
    const autoConnectMCP = async () => {
      const savedMCPConfig = localStorage.getItem('sirelia-mcp-config');
      if (savedMCPConfig) {
        try {
          const mcpConfig: MCPConfig = JSON.parse(savedMCPConfig);
          
          // Only auto-connect if we have a valid MCP config that was previously enabled
          if (mcpConfig.serverUrl && mcpConfig.isEnabled && !mcpConfig.isConnected) {
            console.log('Auto-connecting to MCP server on app load...');
            
            try {
              const response = await fetch('/api/mcp', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  action: 'connect',
                  config: mcpConfig,
                }),
              });

              if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                  // Update the localStorage to reflect the connection
                  const updatedConfig = { ...mcpConfig, isConnected: true };
                  localStorage.setItem('sirelia-mcp-config', JSON.stringify(updatedConfig));
                  
                  showToast({
                    type: 'success',
                    title: 'MCP Auto-Connected',
                    message: 'Successfully reconnected to MCP server'
                  });
                  
                  console.log('MCP auto-connection successful on app load');
                } else {
                  console.warn('MCP auto-connection failed on app load:', result.error);
                }
              } else {
                console.warn('MCP auto-connection failed on app load:', response.status);
              }
            } catch (error) {
              console.warn('MCP auto-connection error on app load:', error);
            }
          }
        } catch (error) {
          console.error('Failed to parse MCP config on app load:', error);
        }
      }
    };

    // Run auto-connection after a short delay to ensure the app is fully loaded
    const timer = setTimeout(autoConnectMCP, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Listen for theme changes and force re-render
  useEffect(() => {
    const handleThemeChange = () => {
      // Force re-render for theme changes
    };

    window.addEventListener('themeChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <ErrorBoundary>
        <PanelGroup direction="horizontal" className="w-full h-full">
          <Panel defaultSize={30} minSize={20} maxSize={50}>
            <LeftPanel onGenerateDiagram={handleGenerateDiagram} />
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" />
          
          <Panel defaultSize={70} minSize={30}>
            <RightPanel mermaidCode={mermaidCode} onCodeChange={handleCodeChange} />
          </Panel>
        </PanelGroup>
      </ErrorBoundary>
    </div>
  );
}
