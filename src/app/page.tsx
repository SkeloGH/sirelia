'use client';

import { useState, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import LeftPanel from '@/components/LeftPanel';
import RightPanel from '@/components/RightPanel';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  const [mermaidCode, setMermaidCode] = useState('');

  const handleCodeChange = useCallback((code: string) => {
    setMermaidCode(code);
  }, []);

  const handleGenerateDiagram = useCallback((code: string) => {
    setMermaidCode(code);
  }, []);

  return (
    <div className="h-screen w-screen flex">
      <ErrorBoundary>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={30} minSize={20} maxSize={50}>
            <LeftPanel onGenerateDiagram={handleGenerateDiagram} />
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
          
          <Panel defaultSize={70} minSize={30}>
            <RightPanel mermaidCode={mermaidCode} onCodeChange={handleCodeChange} />
          </Panel>
        </PanelGroup>
      </ErrorBoundary>
    </div>
  );
}
