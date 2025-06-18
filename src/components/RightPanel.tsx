'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Code, Eye } from 'lucide-react';
import mermaid from 'mermaid';
import CodeMirrorEditor from '@/components/CodeMirrorEditor';
import ErrorBoundary from '@/components/ErrorBoundary';

interface RightPanelProps {
  mermaidCode: string;
  onCodeChange: (code: string) => void;
}

export default function RightPanel({ mermaidCode, onCodeChange }: RightPanelProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  // Debounced render function
  const debouncedRender = useCallback(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(async () => {
      if (!mermaidRef.current || !mermaidCode.trim()) {
        setIsRendering(false);
        return;
      }

      try {
        setIsRendering(true);
        setError('');
        
        // Clear previous content
        mermaidRef.current.innerHTML = '';
        
        const { svg } = await mermaid.render('mermaid-diagram', mermaidCode);
        setSvgContent(svg);
        
        // Safely set innerHTML
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = '';
        }
      } finally {
        setIsRendering(false);
      }
    }, 300); // 300ms debounce
  }, [mermaidCode]);

  // Render Mermaid diagram with debouncing
  useEffect(() => {
    debouncedRender();

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [debouncedRender]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Mermaid Diagram</h2>
          <button
            onClick={() => setShowEditor(!showEditor)}
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
          <div className="h-full p-4 overflow-auto">
            {error ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-500 text-lg font-medium mb-2">
                    Rendering Error
                  </div>
                  <div className="text-gray-600 text-sm max-w-md">
                    {error}
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Check your Mermaid syntax and try again
                  </div>
                </div>
              </div>
            ) : isRendering ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-500 text-lg font-medium mb-2">
                    Rendering Diagram...
                  </div>
                  <div className="text-sm text-gray-400">
                    Please wait
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                {!svgContent ? (
                  <div className="text-gray-400 text-center">
                    <div className="text-lg font-medium mb-2">
                      No diagram to display
                    </div>
                    <div className="text-sm">
                      Generate a diagram using the assistant or edit the code
                    </div>
                  </div>
                ) : (
                  <div 
                    ref={mermaidRef}
                    className="w-full h-full flex items-center justify-center"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 