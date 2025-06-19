'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Panel, PanelGroup, ImperativePanelGroupHandle } from 'react-resizable-panels';
import LeftPanel from '@/components/LeftPanel';
import RightPanel from '@/components/RightPanel';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MCPConfig } from '@/types/ai';
import { showToast } from '@/components/Toast';

export default function Home() {
  const [mermaidCode, setMermaidCode] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const handleCodeChange = useCallback((code: string) => {
    setMermaidCode(code);
  }, []);

  const handleGenerateDiagram = useCallback((code: string) => {
    setMermaidCode(code);
  }, []);

  // Handle panel resize with auto-collapse logic
  const handlePanelResize = useCallback((sizes: number[]) => {
    // Only handle resize when sidebar is visible
    if (!isSidebarCollapsed && sizes.length > 1) {
      const leftPanelSize = sizes[0];
      const minSize = 20; // Minimum size when expanded
      const collapseThreshold = minSize * 0.8; // 20% below minimum (16%)
      
      if (leftPanelSize < collapseThreshold) {
        // Collapse the sidebar
        setIsSidebarCollapsed(true);
      }
    }
  }, [isSidebarCollapsed]);

  // Toggle sidebar manually
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // Keyboard shortcut to toggle sidebar (Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

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
        <PanelGroup 
          direction="horizontal" 
          className="w-full h-full" 
          ref={panelGroupRef}
          onLayout={handlePanelResize}
        >
          <Panel 
            defaultSize={2} 
            minSize={2} 
            maxSize={isSidebarCollapsed ? 4 : 50}
            collapsible={false}
          >
            <div className="h-full relative flex flex-col">
              {isSidebarCollapsed ? (
                <div 
                  className="flex items-center justify-center h-full w-full cursor-col-resize bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsSidebarCollapsed(false);
                    setTimeout(() => {
                      panelGroupRef.current?.setLayout([25, 75]);
                    }, 0);
                  }}
                  title="Drag or click to expand sidebar"
                >
                  <span className="rotate-180 text-gray-500">❯</span>
                </div>
              ) : (
                <>
                  <div 
                    className="absolute right-0 top-0 w-2 h-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-col-resize z-10 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      let isDragging = false;
                      const startX = e.clientX;
                      const startLayout = panelGroupRef.current?.getLayout() || [25, 75];
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        if (Math.abs(moveEvent.clientX - startX) > 5) {
                          isDragging = true;
                        }
                        
                        if (isDragging) {
                          const deltaX = moveEvent.clientX - startX;
                          const containerWidth = window.innerWidth;
                          const deltaPercent = (deltaX / containerWidth) * 100;
                          const newLeftSize = Math.max(25, Math.min(50, startLayout[0] + deltaPercent));
                          const newRightSize = 100 - newLeftSize;
                          panelGroupRef.current?.setLayout([newLeftSize, newRightSize]);
                        }
                      };
                      
                      const handleMouseUp = () => {
                        if (!isDragging) {
                          // Click without drag - collapse
                          setIsSidebarCollapsed(true);
                        }
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                    title="Click to collapse, drag to resize"
                  >
                    <span className="text-gray-500">❮</span>
                  </div>
                  <LeftPanel onGenerateDiagram={handleGenerateDiagram} />
                </>
              )}
            </div>
          </Panel>
          
          {/* No resize handle needed, handled by the sidebar itself */}
          
          <Panel defaultSize={isSidebarCollapsed ? 98 : 70} minSize={30}>
            <RightPanel mermaidCode={mermaidCode} onCodeChange={handleCodeChange} />
          </Panel>
        </PanelGroup>
      </ErrorBoundary>
    </div>
  );
}
