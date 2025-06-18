'use client';

import { useState, useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import LeftPanel from '@/components/LeftPanel';
import RightPanel from '@/components/RightPanel';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  const [mermaidCode, setMermaidCode] = useState('');
  const [, forceUpdate] = useState({});

  const handleCodeChange = useCallback((code: string) => {
    setMermaidCode(code);
  }, []);

  const handleGenerateDiagram = useCallback((code: string) => {
    setMermaidCode(code);
  }, []);

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
