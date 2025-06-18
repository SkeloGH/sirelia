'use client';

import { useState } from 'react';
import { showToast } from '../../components/Toast';

export default function DebugMCPPage() {
  const [serverUrl, setServerUrl] = useState('');
  const [token, setToken] = useState('');
  const [clientName, setClientName] = useState('sirelia-mcp-client');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    if (!serverUrl) {
      showToast({
        type: 'error',
        title: 'Missing URL',
        message: 'Please enter a server URL'
      });
      return;
    }

    setLoading(true);
    addLog(`Testing connection to: ${serverUrl}`);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'connect',
          config: {
            serverUrl,
            token: token || undefined,
            name: clientName,
            isEnabled: false
          },
        }),
      });

      addLog(`Response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.json();
        addLog(`Error: ${JSON.stringify(error)}`);
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      addLog(`Success: ${JSON.stringify(result)}`);
      
      showToast({
        type: 'success',
        title: 'Connection Successful',
        message: 'MCP server connected successfully'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Connection failed: ${errorMessage}`);
      
      showToast({
        type: 'error',
        title: 'Connection Failed',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const testStatus = async () => {
    setLoading(true);
    addLog('Checking connection status...');

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
      addLog(`Status: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Status check failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testTools = async () => {
    setLoading(true);
    addLog('Fetching available tools...');

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
      addLog(`Tools: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Tools fetch failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MCP Debug Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Connection Configuration</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Server URL *
                </label>
                <input
                  type="url"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://mcp.example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token (Optional)
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your MCP access token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="sirelia-mcp-client"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={testConnection}
                disabled={loading || !serverUrl}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Testing...' : 'Test Connection'}
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={testStatus}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                >
                  Check Status
                </button>
                
                <button
                  onClick={testTools}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  Get Tools
                </button>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Common MCP Servers</h2>
            <div className="space-y-2 text-sm">
              <p><strong>GitHub MCP:</strong> https://github-mcp.example.com</p>
              <p><strong>Local MCP:</strong> http://localhost:3001</p>
              <p><strong>Test Server:</strong> https://mcp-test.example.com</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: These are example URLs. Use your actual MCP server URL.
            </p>
          </div>
        </div>
        
        {/* Logs Panel */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Connection Logs</h2>
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
          
          <div className="bg-gray-100 rounded-md p-3 h-96 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try connecting to see debug information.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Troubleshooting</h2>
        <div className="space-y-2 text-sm">
          <p><strong>401 Unauthorized:</strong> The server requires authentication. Check your token.</p>
          <p><strong>Connection Failed:</strong> Check the server URL and ensure the server is running.</p>
          <p><strong>No Tools Available:</strong> The server may not have any tools configured.</p>
          <p><strong>CORS Error:</strong> The server may not allow cross-origin requests.</p>
        </div>
      </div>
    </div>
  );
} 