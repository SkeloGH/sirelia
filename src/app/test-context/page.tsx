'use client';

import { useState, useEffect } from 'react';
import { MCPConfig } from '../../types/ai';

export default function TestContextPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [mcpConfig, setMcpConfig] = useState<MCPConfig | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const getMCPConfig = (): MCPConfig | null => {
      try {
        const mcpConfigStr = localStorage.getItem('sirelia-mcp-config');
        if (mcpConfigStr) {
          return JSON.parse(mcpConfigStr);
        }
      } catch (error) {
        console.error('Failed to parse MCP config:', error);
      }
      return null;
    };

    setMcpConfig(getMCPConfig());
  }, []);

  const testContextBuilder = async () => {
    setIsLoading(true);
    setTestResult('Testing...');

    try {
      const response = await fetch('/api/test-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryUrl: 'https://github.com/username/repo',
          userRequest: 'Generate a component architecture diagram',
          mcpConfig: mcpConfig
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithRealRepo = async () => {
    setIsLoading(true);
    setTestResult('Testing with real repository...');

    try {
      const response = await fetch('/api/test-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryUrl: 'https://github.com/vercel/next.js',
          userRequest: 'Show me the component structure',
          mcpConfig: mcpConfig
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithConnectedRepo = async () => {
    setIsLoading(true);
    setTestResult('Testing with connected repository...');

    try {
      const repoConfigStr = localStorage.getItem('sirelia-repositories-state');
      let connectedRepoUrl = 'https://github.com/vercel/next.js'; // fallback
      
      if (repoConfigStr) {
        try {
          const repoState = JSON.parse(repoConfigStr);
          if (repoState.activeRepositoryId) {
            connectedRepoUrl = repoState.activeRepositoryId;
          }
        } catch (error) {
          console.error('Failed to parse repo state:', error);
        }
      }
      
      const response = await fetch('/api/test-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryUrl: connectedRepoUrl,
          userRequest: 'Generate a component architecture diagram',
          mcpConfig: mcpConfig
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAvailableTools = async () => {
    setIsLoading(true);
    setTestResult('Checking available tools...');

    try {
      const response = await fetch('/api/test-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryUrl: 'https://github.com/vercel/next.js',
          userRequest: 'Check available tools',
          mcpConfig: mcpConfig,
          checkToolsOnly: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything until we're on the client side
  if (!isClient) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Repository Context Builder Test</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Repository Context Builder Test</h1>
      
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test Repository Context Builder</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This page tests the Repository Context Builder implementation. It will attempt to:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
            <li>Parse repository URLs</li>
            <li>Fetch repository information</li>
            <li>Get file structure</li>
            <li>Determine relevant files based on user request</li>
            <li>Build context payload</li>
          </ul>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">MCP Configuration Status</h3>
          {mcpConfig ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Server:</strong> {mcpConfig.serverUrl}</p>
              <p><strong>Connected:</strong> {mcpConfig.isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Enabled:</strong> {mcpConfig.isEnabled ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p className="text-sm text-red-600 dark:text-red-400">
              No MCP configuration found in localStorage. Please configure MCP in the main app first.
            </p>
          )}
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={testContextBuilder}
            disabled={isLoading || !mcpConfig}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Test Context Builder'}
          </button>
          
          <button 
            onClick={testWithRealRepo}
            disabled={isLoading || !mcpConfig}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Test with Next.js Repo'}
          </button>

          <button 
            onClick={testWithConnectedRepo}
            disabled={isLoading || !mcpConfig}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Test with Connected Repo'}
          </button>

          <button 
            onClick={testAvailableTools}
            disabled={isLoading || !mcpConfig}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking...' : 'Check Available Tools'}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Test Results</h3>
        <pre className="text-sm bg-white dark:bg-gray-300 p-4 rounded border overflow-auto max-h-96">
          {testResult || 'No test results yet. Click a test button above.'}
        </pre>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Expected Results</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A successful test should return a structured context object containing:
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside mt-2 space-y-1">
          <li>Repository information (name, description)</li>
          <li>File structure and types</li>
          <li>Relevant files based on the user request</li>
          <li>User intent analysis</li>
          <li>Suggested diagram type</li>
        </ul>
      </div>
    </div>
  );
} 