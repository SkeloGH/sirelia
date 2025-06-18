'use client';

import { useState, useEffect } from 'react';
import { 
  Link, 
  Link2Off, 
  Github, 
  Key, 
  Bot, 
  Save,
  CheckCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AIConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface RepositoryConfig {
  url: string;
  token: string;
  isConnected: boolean;
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

  const [isConnecting, setIsConnecting] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['repository', 'ai']));

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
  }, []);

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
      <div className="border border-gray-200 rounded-md bg-white">
        <button
          onClick={() => toggleSection('repository')}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Github className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Repository Connection</span>
          </div>
          {isCollapsed('repository') ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {!isCollapsed('repository') && (
          <div className="px-3 pb-3 space-y-3">
            {!repoConfig.isConnected ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    value={repoConfig.url}
                    onChange={(e) => handleRepoConfigChange('url', e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="text-black w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Access Token (Optional for public repos)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={repoConfig.token}
                      onChange={(e) => handleRepoConfigChange('token', e.target.value)}
                      placeholder="GitHub Personal Access Token"
                      className="text-black w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Key className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
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
      <div className="border border-gray-200 rounded-md bg-white">
        <button
          onClick={() => toggleSection('ai')}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">AI Agent Configuration</span>
          </div>
          {isCollapsed('ai') ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {!isCollapsed('ai') && (
          <div className="px-3 pb-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                AI Provider
              </label>
              <select
                value={aiConfig.provider}
                onChange={(e) => handleAIConfigChange('provider', e.target.value as AIConfig['provider'])}
                className="text-black w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Model
              </label>
              <select
                value={aiConfig.model}
                onChange={(e) => handleAIConfigChange('model', e.target.value)}
                className="text-black w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {modelOptions[aiConfig.provider].map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={(e) => handleAIConfigChange('apiKey', e.target.value)}
                  placeholder="Enter your API key"
                  className="text-black w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Key className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
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
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="100"
                  max="8000"
                  step="100"
                  value={aiConfig.maxTokens}
                  onChange={(e) => handleAIConfigChange('maxTokens', parseInt(e.target.value))}
                  className="text-black w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
    </div>
  );
} 