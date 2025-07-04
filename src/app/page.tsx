'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Code, Eye } from 'lucide-react';
import CodeMirrorEditor from '../components/CodeMirrorEditor';
import MermaidRenderer from '../components/MermaidRenderer';
import ErrorBoundary from '../components/ErrorBoundary';
import ThemeSwitch from '../components/ThemeSwitch';
import { MermaidBridgeClient, ConnectionStatus } from '../services/bridge/mermaid-client';
import { isValidMermaidCode } from '../config/mermaid';

export default function Home() {
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    serverConnected: false,
    socketConnected: false
  });
  const [showEditor, setShowEditor] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Memoize connection indicator color to prevent unnecessary re-renders
  const connectionColor = useMemo(() => {
    if (connectionStatus.serverConnected && connectionStatus.socketConnected) {
      return 'bg-green-500'; // Both connected - green
    } else if (connectionStatus.serverConnected || connectionStatus.socketConnected) {
      return 'bg-yellow-500'; // Either server or socket connected - yellow
    } else {
      return 'bg-red-500'; // Neither connected - red
    }
  }, [connectionStatus.serverConnected, connectionStatus.socketConnected]);

  useEffect(() => {
    // Create and connect to bridge
    const client = new MermaidBridgeClient(
      (code) => {
        console.log('Received Mermaid code:', code.substring(0, 50) + '...');
        setMermaidCode(code);
        setValidationError(''); // Clear any previous validation errors
      },
      (status: ConnectionStatus) => {
        console.log('Connection status changed:', status);
        setConnectionStatus(status);
      }
    );

    client.connect();

    return () => {
      client.disconnect();
    };
  }, []);

  // Validate Mermaid syntax before switching to visualizer
  const validateMermaidCode = useCallback((code: string): boolean => {
    if (!code.trim()) return true; // Empty code is valid

    // Use centralized validation
    const valid = isValidMermaidCode(code);
    
    if (!valid) {
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

  const handleCodeChange = (newCode: string) => {
    setMermaidCode(newCode);
    setValidationError(''); // Clear validation errors when user edits
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 dark:bg-gray-900">
      <div>
        {/* Main Content - CSS Grid Layout */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden" style={{ 
          height: '100vh',
          display: 'grid',
          gridTemplateRows: showEditor ? 'auto auto 1fr' : 'auto 1fr',
          gridTemplateAreas: showEditor ? '"title" "toolbar" "content"' : '"title" "content"'
        }}>
          {/* Main Title Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" style={{ gridArea: 'title' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sirelia
                  <span 
                    className={`inline-block ml-1 w-2 h-2 rounded-full ${connectionColor}`}
                    title={`Server: ${connectionStatus.serverConnected ? 'Connected' : 'Disconnected'}, Socket: ${connectionStatus.socketConnected ? 'Connected' : 'Disconnected'}`}
                  />
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time Mermaid diagram visualization with live editing</p>
              </div>
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
                <ThemeSwitch />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div style={{ gridArea: 'content', overflow: 'hidden' }}>
            {showEditor ? (
              <div className="h-full flex flex-col">
                <ErrorBoundary>
                  <CodeMirrorEditor
                    key="mermaid-editor"
                    value={mermaidCode}
                    onChange={handleCodeChange}
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

        {/* Instructions - Only show when no diagram */}
        {!mermaidCode.trim() && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How to Use
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
              <li>Make sure the bridge server is running on port 3001</li>
              <li>Send a POST request to <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">http://localhost:3001/mermaid</code></li>
              <li>Include Mermaid code in the request body: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{`{code: 'graph TD\\nA-->B'}`}</code></li>
              <li>Your diagram will appear here automatically</li>
              <li>Use the &quot;Edit Code&quot; button to modify the diagram in real-time</li>
              <li>Use the toolbar controls to zoom, pan, and export your diagram</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
