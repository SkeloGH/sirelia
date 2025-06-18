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
  Moon
} from 'lucide-react';
import { AIConfig, RepositoryConfig } from '../../types/ai';

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

  const [isConnecting, setIsConnecting] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['repository', 'ai', 'theme']));
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
    if (mode === 'system') {
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark: shouldBeDark } }));
    }
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
    const savedRepoConfig = localStorage.getItem('sirelia-repo-config');
    const savedTheme = localStorage.getItem('sirelia-theme');
    
    if (savedAIConfig) {
      try {
        const parsed = JSON.parse(savedAIConfig);
        setAIConfig(parsed);
      } catch (error) {
        console.error('Failed to load AI config:', error);
      }
    }
    
    if (savedRepoConfig) {
      try {
        const parsed = JSON.parse(savedRepoConfig);
        setRepoConfig(parsed);
      } catch (error) {
        console.error('Failed to load repo config:', error);
      }
    }

    // Load theme preference
    if (savedTheme) {
      setThemeMode(savedTheme as 'light' | 'dark' | 'system');
      applyTheme(savedTheme as 'light' | 'dark' | 'system');
    }
  }, [applyTheme]);

  // Detect system theme and listen for changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
      if (themeMode === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeMode, applyTheme]);

  // Listen for theme changes from other components
  useEffect(() => {
    const handleThemeChange = () => {
      // Don't override the state if we're in the middle of a manual change
      // This prevents the event loop from interfering with user selections
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, []);

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

      // Update state and localStorage BEFORE dispatching event
      const updatedRepoConfig = { ...repoConfig, isConnected: true };
      setRepoConfig(updatedRepoConfig);
      
      // Store configuration (in a real app, this would be saved to backend/database)
      localStorage.setItem('sirelia-ai-config', JSON.stringify(aiConfig));
      localStorage.setItem('sirelia-repo-config', JSON.stringify(updatedRepoConfig));
      
      // Trigger refresh in other tabs AFTER localStorage is updated
      window.dispatchEvent(new CustomEvent('repositoryConnected'));
      
    } catch (error: unknown) {
      window.alert('Error connecting repository:' + error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectRepository = () => {
    setRepoConfig(prev => ({ ...prev, isConnected: false, url: '', token: '' }));
    localStorage.removeItem('sirelia-repo-config');
    // Trigger refresh in other tabs
    window.dispatchEvent(new CustomEvent('repositoryConnected'));
  };

  const saveConfiguration = () => {
    localStorage.setItem('sirelia-ai-config', JSON.stringify(aiConfig));
    // Trigger event to notify other components that AI config has changed
    window.dispatchEvent(new CustomEvent('aiConfigUpdated'));
  };

  return (
    <div className="space-y-4">
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
            {!repoConfig.isConnected ? (
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
                  <span>{isConnecting ? 'Connecting...' : 'Connect Repository'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Repository connected</span>
                </div>
                <button
                  onClick={disconnectRepository}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                >
                  <Link2Off className="w-4 h-4" />
                  <span>Disconnect Repository</span>
                </button>
              </div>
            )}
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