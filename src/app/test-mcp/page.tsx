'use client';

import { useState, useEffect } from 'react';
import { MCPConfig } from '../../types/ai';

export default function TestMCPPage() {
  const [status, setStatus] = useState<string>('Not connected');
  const [tools, setTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mcpConfig, setMcpConfig] = useState<MCPConfig | null>(null);
  const [errorDetails, setErrorDetails] = useState<string>('');

  // Load MCP config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('sirelia-mcp-config');
    if (savedConfig) {
      try {
        setMcpConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse MCP config:', error);
      }
    }
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setErrorDetails('');
    
    try {
      if (!mcpConfig || !mcpConfig.serverUrl) {
        setStatus('Error: No MCP configuration found. Please configure MCP in the Configuration tab first.');
        return;
      }

      console.log('Attempting to connect with config:', mcpConfig);

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

      const result = await response.json();
      console.log('Connection result:', result);

      if (result.success) {
        setStatus('Connected successfully!');
        setErrorDetails('');
      } else {
        setStatus('Connection failed');
        setErrorDetails(result.error || 'Unknown error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStatus('Error: ' + errorMessage);
      setErrorDetails(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'status',
        }),
      });

      const result = await response.json();
      setStatus(result.connected ? 'Connected' : 'Not connected');
      if (result.status?.error) {
        setErrorDetails(result.status.error);
      }
    } catch (error) {
      setStatus('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const getTools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'tools',
        }),
      });

      const result = await response.json();
      if (result.tools) {
        setTools(result.tools);
      } else if (result.error) {
        setErrorDetails(result.error);
      }
    } catch (error) {
      console.error('Error getting tools:', error);
      setErrorDetails(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MCP Test Page</h1>
      
      <div className="space-y-6">
        {/* MCP Configuration Display */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">MCP Configuration</h2>
          {mcpConfig ? (
            <div className="space-y-2 text-sm">
              <p><strong>Server URL:</strong> {mcpConfig.serverUrl}</p>
              <p><strong>Token:</strong> {mcpConfig.token ? '***' + mcpConfig.token.slice(-4) : 'Not set'}</p>
              <p><strong>Client Name:</strong> {mcpConfig.name || 'Not set'}</p>
              <p><strong>Enabled:</strong> {mcpConfig.isEnabled ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p className="text-red-600">No MCP configuration found. Please configure MCP in the Configuration tab first.</p>
          )}
        </div>

        {/* Connection Testing */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Connection Testing</h2>
          <p className="mb-4">Status: <span className="font-mono">{status}</span></p>
          
          {errorDetails && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm"><strong>Error Details:</strong></p>
              <pre className="text-red-600 text-xs mt-1 whitespace-pre-wrap">{errorDetails}</pre>
            </div>
          )}
          
          <div className="space-x-4">
            <button
              onClick={testConnection}
              disabled={loading || !mcpConfig}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Connecting...' : 'Test Connection'}
            </button>
            
            <button
              onClick={checkStatus}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </div>

        {/* Available Tools */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Available Tools</h2>
          <button
            onClick={getTools}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 mb-4"
          >
            {loading ? 'Loading...' : 'Get Tools'}
          </button>
          
          {tools.length > 0 ? (
            <ul className="space-y-2">
              {tools.map((tool, index) => (
                <li key={index} className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {tool}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tools available</p>
          )}
        </div>

        {/* Instructions */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to the Configuration tab and set up MCP server connection</li>
            <li>Enter your MCP server URL (e.g., https://api.githubcopilot.com/mcp/)</li>
            <li>Enter your access token</li>
            <li>Click &quot;Save Configuration&quot; to save your settings</li>
            <li>Come back to this page and click &quot;Test Connection&quot;</li>
            <li>If successful, click &quot;Get Tools&quot; to see available MCP tools</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 