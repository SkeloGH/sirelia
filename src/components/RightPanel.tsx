'use client';

import { useState, useCallback, useEffect } from 'react';
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
  const [validationError, setValidationError] = useState<string>('');
  const [, forceUpdate] = useState({});

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

  // Validate Mermaid syntax before switching to visualizer
  const validateMermaidCode = useCallback((code: string): boolean => {
    if (!code.trim()) return true; // Empty code is valid
    
    // Filter out comments and empty lines
    const filteredCode = code
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (!line) return false;
        if (line.startsWith('//')) return false;
        if (line.startsWith('#')) return false;
        if (line.startsWith('/*') && line.endsWith('*/')) return false;
        if (line.startsWith('%%') && line.endsWith('%%')) return true;
        return true;
      })
      .join('\n');

    if (!filteredCode.trim()) {
      setValidationError('No valid Mermaid diagram detected. Please ensure your code starts with a diagram type (e.g., graph, flowchart, sequenceDiagram).');
      return false;
    }

    // Check for common Mermaid diagram types
    const diagramTypes = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
      'stateDiagram', 'entityRelationshipDiagram', 'userJourney',
      'gantt', 'pie', 'quadrantChart', 'requirement', 'gitgraph',
      'mindmap', 'timeline', 'zenuml', 'sankey'
    ];
    
    const hasValidType = diagramTypes.some(type => 
      filteredCode.toLowerCase().includes(type.toLowerCase())
    );

    if (!hasValidType) {
      setValidationError('No valid Mermaid diagram detected. Please ensure your code starts with a diagram type (e.g., graph, flowchart, sequenceDiagram).');
      return false;
    }

    setValidationError('');
    return true;
  }, []);

  const handleToggleEditor = () => {
    if (showEditor) {
      // Switching from editor to visualizer - validate first
      if (!validateMermaidCode(mermaidCode)) {
        return; // Don't switch if validation fails
      }
    }
    setShowEditor(!showEditor);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mermaid Diagram</h2>
          <div className="flex items-center space-x-2">
            {validationError && !showEditor && (
              <div className="text-red-500 dark:text-red-400 text-sm">
                {validationError}
              </div>
            )}
            <button
              onClick={handleToggleEditor}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showEditor ? (
          <div className="h-full overflow-hidden">
            <ErrorBoundary>
              <CodeMirrorEditor
                key="mermaid-editor"
                value={mermaidCode}
                onChange={onCodeChange}
              />
            </ErrorBoundary>
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            {!mermaidCode.trim() ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-400 dark:text-gray-500 text-center">
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