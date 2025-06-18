'use client';

import { useState } from 'react';
import { 
  Link, 
  Link2Off, 
  Github, 
  Key, 
  Bot, 
  Save,
  CheckCircle,
  AlertCircle
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
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  });

  const [repoConfig, setRepoConfig] = useState<RepositoryConfig>({
    url: '',
    token: '',
    isConnected: false
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleAIConfigChange = (field: keyof AIConfig, value: string | number) => {
    setAIConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleRepoConfigChange = (field: keyof RepositoryConfig, value: string | boolean) => {
    setRepoConfig(prev => ({ ...prev, [field]: value }));
  };

  const connectRepository = async () => {
    if (!repoConfig.url || !repoConfig.token) {
      setConnectionStatus('error');
      setStatusMessage('Please provide both repository URL and access token');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('idle');
    setStatusMessage('Connecting to repository...');

    try {
      // Simulate repository connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate GitHub URL format
      if (!repoConfig.url.includes('github.com')) {
        throw new Error('Please provide a valid GitHub repository URL');
      }

      // Simulate successful connection
      setConnectionStatus('success');
      setStatusMessage('Repository connected successfully!');
      handleRepoConfigChange('isConnected', true);
      
      // Store configuration (in a real app, this would be saved to backend/database)
      localStorage.setItem('siren-ai-config', JSON.stringify(aiConfig));
      localStorage.setItem('siren-repo-config', JSON.stringify(repoConfig));
      
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to connect to repository');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectRepository = () => {
    setRepoConfig(prev => ({ ...prev, isConnected: false, url: '', token: '' }));
    setConnectionStatus('idle');
    setStatusMessage('');
    localStorage.removeItem('siren-repo-config');
  };

  const saveConfiguration = () => {
    localStorage.setItem('siren-ai-config', JSON.stringify(aiConfig));
    setStatusMessage('Configuration saved successfully!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Repository Connection Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Github className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">Repository Connection</h3>
        </div>
        
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Access Token
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={repoConfig.token}
                  onChange={(e) => handleRepoConfigChange('token', e.target.value)}
                  placeholder="GitHub Personal Access Token"
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Key className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>
            
            <button
              onClick={connectRepository}
              disabled={isConnecting || !repoConfig.url || !repoConfig.token}
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

      {/* AI Configuration Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">AI Agent Configuration</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              AI Provider
            </label>
            <select
              value={aiConfig.provider}
              onChange={(e) => handleAIConfigChange('provider', e.target.value as AIConfig['provider'])}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="custom">Custom</option>
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
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Key className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Model
            </label>
            <input
              type="text"
              value={aiConfig.model}
              onChange={(e) => handleAIConfigChange('model', e.target.value)}
              placeholder="gpt-4, claude-3, etc."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Temperature
              </label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={aiConfig.temperature}
                onChange={(e) => handleAIConfigChange('temperature', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div className={`flex items-center space-x-2 p-3 rounded-md text-sm ${
          connectionStatus === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : connectionStatus === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {connectionStatus === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : connectionStatus === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
} 