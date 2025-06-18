'use client';

import { useState } from 'react';
import { Code, Eye } from 'lucide-react';
import CodeMirrorEditor from '@/components/CodeMirrorEditor';
import MermaidRenderer from '@/components/MermaidRenderer';
import ErrorBoundary from '@/components/ErrorBoundary';

interface RightPanelProps {
  mermaidCode: string;
  onCodeChange: (code: string) => void;
}

export default function RightPanel({ mermaidCode, onCodeChange }: RightPanelProps) {
  const [showEditor, setShowEditor] = useState(false);

  const handleToggleEditor = () => {
    setShowEditor(!showEditor);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Mermaid Diagram</h2>
          <button
            onClick={handleToggleEditor}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {showEditor ? (
              <>
                <Eye className="w-4 h-4" />
                <span>View Diagram</span>
              </>
            ) : (
              <>
                <Code className="w-4 h-4" />
                <span>Edit Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showEditor ? (
          <div className="h-full">
            <ErrorBoundary>
              <CodeMirrorEditor
                key="mermaid-editor"
                value={mermaidCode}
                onChange={onCodeChange}
              />
            </ErrorBoundary>
          </div>
        ) : (
          <div className="h-full">
            {!mermaidCode.trim() ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="text-lg font-medium mb-2">
                    No diagram to display
                  </div>
                  <div className="text-sm">
                    Generate a diagram using the assistant or edit the code
                  </div>
                </div>
              </div>
            ) : (
              <MermaidRenderer 
                code={mermaidCode} 
                className="h-full"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 