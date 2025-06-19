'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Link, 
  Link2Off, 
  Github, 
  Key, 
  Bot, 
  Save,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Server
} from 'lucide-react';
import { AIConfig, RepositoryConfig, MCPConfig, RepositoriesState } from '../../types/ai';
import { showToast } from '../Toast';

// Status indicator component
function StatusIndicator({ color, title }: { color: string; title: string }) {
  return (
    <span className={`w-2 h-2 rounded-full ${color} ml-2`} title={title}></span>
  );
}

export default function ConfigurationTab() {
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 4000
  });

  const [repoConfig, setRepoConfig] = useState<RepositoryConfig>({
    url: '',
    token: '',
    isConnected: false
  });

  const [repositoriesState, setRepositoriesState] = useState<RepositoriesState>({
    repositories: [],
    activeRepositoryId: undefined
  });

  const [mcpConfig, setMcpConfig] = useState<MCPConfig>({
    serverUrl: '',
    token: '',
    headers: {},
    name: 'sirelia-bridge-client',
    isEnabled: false,
    isConnected: false
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectingMCP, setIsConnectingMCP] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['repository', 'ai', 'mcp', 'theme']));
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Apply theme based on mode
  const applyTheme = useCallback((mode: 'light' | 'dark' | 'system') => {
    let shouldBeDark = false;
    if (mode === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else if (mode === 'dark') {
      shouldBeDark = true;
    } else {
      shouldBeDark = false;
    }
    // Remove both classes, then add the correct one
    document.documentElement.classList.remove('dark', 'light');
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('sirelia-theme', mode);
  }, []);

  // Model options for each provider
  const modelOptions = {
    openai: [
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cost-effective)' },
      { value: 'gpt-4o', label: 'GPT-4o (Most Capable)' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast)' }
    ],
    anthropic: [
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' },
      { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (Balanced)' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' }
    ],
    custom: [
      { value: 'custom', label: 'Custom Model' }
    ]
  };

  // Load saved configuration on mount
  useEffect(() => {
    const savedAIConfig = localStorage.getItem('sirelia-ai-config');
    const savedReposState = localStorage.getItem('sirelia-repositories-state');
    const savedMCPConfig = localStorage.getItem('sirelia-mcp-config');
    const savedTheme = localStorage.getItem('sirelia-theme');
    
    if (savedAIConfig) {
      try {
        const parsed = JSON.parse(savedAIConfig);
        setAIConfig(parsed);
      } catch (error) {
        console.error('Failed to load AI config:', error);
      }
    }
    
    if (savedReposState) {
      try {
        const parsed = JSON.parse(savedReposState);
        setRepositoriesState(parsed);
      } catch (error) {
        console.error('Failed to load repositories state:', error);
      }
    }

    if (savedMCPConfig) {
      try {
        const parsed = JSON.parse(savedMCPConfig);
        setMcpConfig(parsed);
      } catch (error) {
        console.error('Failed to load MCP config:', error);
      }
    }

    // Load theme preference
    if (savedTheme) {
      setThemeMode(savedTheme as 'light' | 'dark' | 'system');
      applyTheme(savedTheme as 'light' | 'dark' | 'system');
    }
  }, [applyTheme]);

  // Listen for MCP connection events to update state
  useEffect(() => {
    const handleMCPConnected = () => {
      const savedMCPConfig = localStorage.getItem('sirelia-mcp-config');
      if (savedMCPConfig) {
        try {
          const parsed = JSON.parse(savedMCPConfig);
          setMcpConfig(parsed);
        } catch (error) {
          console.error('Failed to parse MCP config:', error);
        }
      }
    };

    window.addEventListener('mcpConnected', handleMCPConnected);
    
    return () => {
      window.removeEventListener('mcpConnected', handleMCPConnected);
    };
  }, []);

  // Detect system theme and listen for changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
      if (themeMode === 'system') {
        applyTheme('system');
        // Dispatch event when system theme changes and we're in system mode
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark: e.matches } }));
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeMode, applyTheme]);

  // Handle theme mode change
  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    applyTheme(mode);
    const shouldBeDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark: shouldBeDark } }));
  };

  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section);
    } else {
      newCollapsed.add(section);
    }
    setCollapsedSections(newCollapsed);
  };

  const isCollapsed = (section: string) => collapsedSections.has(section);

  const handleAIConfigChange = (field: keyof AIConfig, value: string | number) => {
    setAIConfig(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset model when provider changes
      ...(field === 'provider' && { model: modelOptions[value as keyof typeof modelOptions][0]?.value || 'custom' })
    }));
  };

  const handleRepoConfigChange = (field: keyof RepositoryConfig, value: string | boolean) => {
    setRepoConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleMCPConfigChange = (field: keyof MCPConfig, value: string | boolean) => {
    setMcpConfig(prev => {
      const updatedConfig = { ...prev, [field]: value };
      // Persist to localStorage
      localStorage.setItem('sirelia-mcp-config', JSON.stringify(updatedConfig));
      return updatedConfig;
    });
  };

  const connectRepository = async () => {
    if (!repoConfig.url) {
      return;
    }

    // For public repos, token is optional but recommended
    if (!repoConfig.token) {
      const isPublic = confirm('No access token provided. Public repositories can be accessed without a token, but you\'ll have limited rate limits. Continue anyway?');
      if (!isPublic) return;
    }

    setIsConnecting(true);

    try {
      // Simulate repository connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate GitHub URL format
      if (!repoConfig.url.includes('github.com')) {
        throw new Error('Please provide a valid GitHub repository URL');
      }

      // Extract repository name and owner from URL
      const urlParts = repoConfig.url.split('/');
      const owner = urlParts[urlParts.length - 2];
      const name = urlParts[urlParts.length - 1];

      // Create new repository config
      const newRepo: RepositoryConfig = {
        url: repoConfig.url,
        token: repoConfig.token,
        isConnected: true,
        name: name,
        owner: owner,
        isActive: repositoriesState.repositories.length === 0 // First repo becomes active
      };

      // Update repositories state
      const updatedRepositories = [...repositoriesState.repositories];
      
      // If this is the first repository, make it active
      if (updatedRepositories.length === 0) {
        newRepo.isActive = true;
        updatedRepositories.push(newRepo);
      } else {
        // Check if repository already exists
        const existingIndex = updatedRepositories.findIndex(repo => repo.url === repoConfig.url);
        if (existingIndex >= 0) {
          // Update existing repository
          updatedRepositories[existingIndex] = { ...newRepo, isActive: updatedRepositories[existingIndex].isActive };
        } else {
          // Add new repository (not active by default)
          updatedRepositories.push(newRepo);
        }
      }

      const newRepositoriesState: RepositoriesState = {
        repositories: updatedRepositories,
        activeRepositoryId: newRepo.isActive ? newRepo.url : repositoriesState.activeRepositoryId
      };

      setRepositoriesState(newRepositoriesState);
      localStorage.setItem('sirelia-repositories-state', JSON.stringify(newRepositoriesState));
      
      // Clear the form
      setRepoConfig({ url: '', token: '', isConnected: false });
      
      // Show success toast
      showToast({
        type: 'success',
        title: 'Repository Added',
        message: `Successfully added ${name} repository`
      });
      
      // Trigger refresh in other tabs
      window.dispatchEvent(new CustomEvent('repositoryConnected'));
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showToast({
        type: 'error',
        title: 'Connection Failed',
        message: 'Error connecting repository: ' + errorMessage
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const saveConfiguration = () => {
    localStorage.setItem('sirelia-ai-config', JSON.stringify(aiConfig));
    // Trigger event to notify other components that AI config has changed
    window.dispatchEvent(new CustomEvent('aiConfigUpdated'));
  };

  const connectMCP = async () => {
    if (!mcpConfig.serverUrl) {
      return;
    }

    setIsConnectingMCP(true);

    try {
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to connect to MCP server');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update state and localStorage
        const updatedMcpConfig = { ...mcpConfig, isEnabled: true, isConnected: true };
        setMcpConfig(updatedMcpConfig);
        localStorage.setItem('sirelia-mcp-config', JSON.stringify(updatedMcpConfig));
        
        // Show success toast
        showToast({
          type: 'success',
          title: 'MCP Connected',
          message: 'Successfully connected to MCP server'
        });
        
        // Trigger refresh in other tabs
        window.dispatchEvent(new CustomEvent('mcpConnected'));
      } else {
        throw new Error('Failed to connect to MCP server');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Provide more specific error messages for common issues
      if (errorMessage.includes('401 Unauthorized')) {
        showToast({
          type: 'error',
          title: 'Authentication Failed',
          message: 'Invalid or missing access token. Please check your MCP server credentials.'
        });
      } else if (errorMessage.includes('Failed to fetch')) {
        showToast({
          type: 'error',
          title: 'Connection Failed',
          message: 'Unable to reach MCP server. Please check the server URL and try again.'
        });
      } else {
        showToast({
          type: 'error',
          title: 'MCP Connection Failed',
          message: 'Error connecting to MCP server: ' + errorMessage
        });
      }
    } finally {
      setIsConnectingMCP(false);
    }
  };

  const disconnectMCP = async () => {
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'disconnect',
        }),
      });

      if (response.ok) {
        const updatedMcpConfig = { ...mcpConfig, isEnabled: false, isConnected: false };
        setMcpConfig(updatedMcpConfig);
        localStorage.setItem('sirelia-mcp-config', JSON.stringify(updatedMcpConfig));
        window.dispatchEvent(new CustomEvent('mcpConnected'));
      }
    } catch (error) {
      console.error('Error disconnecting MCP:', error);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Repository Connection Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
        <button
          onClick={() => toggleSection('repository')}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Repository Connection</span>
          </div>
          {isCollapsed('repository') ? (
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        
        {!isCollapsed('repository') && (
          <div className="px-3 pb-3 space-y-3">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Repository URL
                </label>
                <input
                  type="url"
                  value={repoConfig.url}
                  onChange={(e) => handleRepoConfigChange('url', e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="text-black dark:text-white w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Access Token (Optional for public repos)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={repoConfig.token}
                    onChange={(e) => handleRepoConfigChange('token', e.target.value)}
                    placeholder="GitHub Personal Access Token"
                    className="text-black dark:text-white w-full px-3 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                  />
                  <Key className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute right-3 top-2.5" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Required for private repos. For public repos, provides higher rate limits.
                </p>
              </div>
              
              <button
                onClick={connectRepository}
                disabled={isConnecting || !repoConfig.url}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors"
              >
                <Link className="w-4 h-4" />
                <span>{isConnecting ? 'Adding...' : 'Add Repository'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Configuration Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
        <button
          onClick={() => toggleSection('ai')}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">AI Agent Configuration</span>
            {/* AI status indicator */}
            {(() => {
              if (!aiConfig.apiKey) {
                return <StatusIndicator color="bg-gray-400" title="Not Configured" />;
              }
              return <StatusIndicator color="bg-green-500" title="Configured" />;
            })()}
          </div>
          {isCollapsed('ai') ? (
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        
        {!isCollapsed('ai') && (
          <div className="px-3 pb-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                AI Provider
              </label>
              <select
                value={aiConfig.provider}
                onChange={(e) => handleAIConfigChange('provider', e.target.value as AIConfig['provider'])}
                className="text-black dark:text-white w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Model
              </label>
              <select
                value={aiConfig.model}
                onChange={(e) => handleAIConfigChange('model', e.target.value)}
                className="text-black dark:text-white w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              >
                {modelOptions[aiConfig.provider].map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={(e) => handleAIConfigChange('apiKey', e.target.value)}
                  placeholder="Enter your API key"
                  className="text-black dark:text-white w-full px-3 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Key className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute right-3 top-2.5" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Temperature ({aiConfig.temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={aiConfig.temperature}
                  onChange={(e) => handleAIConfigChange('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="100"
                  max="8000"
                  step="100"
                  value={aiConfig.maxTokens}
                  onChange={(e) => handleAIConfigChange('maxTokens', parseInt(e.target.value))}
                  className="text-black dark:text-white w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            
            <button
              onClick={saveConfiguration}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        )}
      </div>

      {/* MCP Configuration Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
        <button
          onClick={() => toggleSection('mcp')}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">MCP Configuration</span>
            {/* MCP status indicator */}
            {(() => {
              if (!mcpConfig.serverUrl || !mcpConfig.isEnabled) {
                return <StatusIndicator color="bg-gray-400" title="Not Configured" />;
              }
              if (mcpConfig.isConnected) {
                return <StatusIndicator color="bg-green-500" title="Connected" />;
              }
              return <StatusIndicator color="bg-red-500" title="Not Connected" />;
            })()}
          </div>
          {isCollapsed('mcp') ? (
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        
        {!isCollapsed('mcp') && (
          <div className="px-3 pb-3 space-y-3">
            {!mcpConfig.isEnabled ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Server URL
                  </label>
                  <input
                    type="url"
                    value={mcpConfig.serverUrl}
                    onChange={(e) => handleMCPConfigChange('serverUrl', e.target.value)}
                    placeholder="https://mcp.example.com"
                    className="text-black dark:text-white w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Access Token
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={mcpConfig.token}
                      onChange={(e) => handleMCPConfigChange('token', e.target.value)}
                      placeholder="Enter your MCP access token"
                      className="text-black dark:text-white w-full px-3 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                    />
                    <Key className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute right-3 top-2.5" />
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    localStorage.setItem('sirelia-mcp-config', JSON.stringify(mcpConfig));
                    showToast({
                      type: 'success',
                      title: 'Configuration Saved',
                      message: 'MCP configuration has been saved'
                    });
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </button>
                
                <button
                  onClick={connectMCP}
                  disabled={isConnectingMCP || !mcpConfig.serverUrl}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors"
                >
                  <Server className="w-4 h-4" />
                  <span>{isConnectingMCP ? 'Connecting...' : 'Connect to MCP Server'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">MCP server connected</span>
                </div>
                <button
                  onClick={disconnectMCP}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                >
                  <Link2Off className="w-4 h-4" />
                  <span>Disconnect MCP Server</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interface Settings Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
        <button
          onClick={() => toggleSection('theme')}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-2">
            {themeMode === 'dark' ? (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : themeMode === 'light' ? (
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              systemTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )
            )}
            <span className="font-medium text-gray-700 dark:text-gray-300">Interface Settings</span>
          </div>
          {isCollapsed('theme') ? (
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        
        {!isCollapsed('theme') && (
          <div className="px-3 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Theme Mode
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Switch between light, dark, and system themes
                </p>
              </div>
              <select
                value={themeMode}
                onChange={(e) => {
                  handleThemeModeChange(e.target.value as 'light' | 'dark' | 'system');
                }}
                className="text-black dark:text-white w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
              {themeMode === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Dark theme is active</span>
                </>
              ) : themeMode === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Light theme is active</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 text-gray-600 dark:text-gray-400">
                    {systemTheme === 'dark' ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    System theme is active ({systemTheme === 'dark' ? 'Dark' : 'Light'})
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 