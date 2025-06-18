'use client';

import { useState } from 'react';

export default function TestMCPPage() {
  const [status, setStatus] = useState<string>('Not connected');
  const [tools, setTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
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
      }
    } catch (error) {
      console.error('Error getting tools:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MCP Test Page</h1>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
          <p className="mb-4">Status: <span className="font-mono">{status}</span></p>
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

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

        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to the Configuration tab and set up MCP server connection</li>
            <li>Enter your MCP server URL (e.g., https://mcp.example.com)</li>
            <li>Click &quot;Connect to MCP Server&quot;</li>
            <li>Come back to this page and test the connection</li>
            <li>Click &quot;Get Tools&quot; to see available MCP tools</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 