'use client';

import { useState, useEffect } from 'react';
import { Send, Sparkles, Bot, AlertCircle } from 'lucide-react';
import { AIConfig, RepositoryConfig, ChatMessage } from '../../types/ai';

interface AssistantTabProps {
  onGenerateDiagram: (code: string) => void;
}

export default function AssistantTab({ onGenerateDiagram }: AssistantTabProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I can help you generate Mermaid diagrams from your codebase. Try asking me to analyze your repository or generate a specific diagram.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiConfig, setAIConfig] = useState<AIConfig | null>(null);
  const [repoConfig, setRepoConfig] = useState<RepositoryConfig | null>(null);

  // Load configuration from localStorage
  useEffect(() => {
    const loadConfiguration = () => {
      const savedAIConfig = localStorage.getItem('sirelia-ai-config');
      const savedRepoConfig = localStorage.getItem('sirelia-repo-config');
      
      if (savedAIConfig) {
        try {
          const parsed = JSON.parse(savedAIConfig);
          setAIConfig(parsed);
        } catch (error) {
          console.error('Error loading AI config:', error);
        }
      }
      
      if (savedRepoConfig) {
        try {
          const parsed = JSON.parse(savedRepoConfig);
          setRepoConfig(parsed);
        } catch (error) {
          console.error('Error loading repo config:', error);
        }
      }
    };

    loadConfiguration();

    // Listen for configuration updates
    const handleAIConfigUpdate = () => {
      loadConfiguration();
    };

    const handleRepoConfigUpdate = () => {
      loadConfiguration();
    };

    window.addEventListener('aiConfigUpdated', handleAIConfigUpdate);
    window.addEventListener('repositoryConnected', handleRepoConfigUpdate);

    return () => {
      window.removeEventListener('aiConfigUpdated', handleAIConfigUpdate);
      window.removeEventListener('repositoryConnected', handleRepoConfigUpdate);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check if AI is configured
    if (!aiConfig?.apiKey) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Please configure your AI provider in the Configuration tab before using the assistant.' 
      }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat([{ role: 'user', content: userMessage }]),
          config: aiConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantMessage = '';
      const decoder = new TextDecoder();

      // Add initial assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage += chunk;

          // Update the last message (assistant's response)
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: assistantMessage,
              };
            }
            return newMessages;
          });
        }
      } finally {
        reader.releaseLock();
      }

      // Check if the response contains Mermaid code and extract it
      const mermaidMatch = assistantMessage.match(/```mermaid\s*([\s\S]*?)\s*```/);
      if (mermaidMatch) {
        const mermaidCode = mermaidMatch[1].trim();
        onGenerateDiagram(mermaidCode);
      }

    } catch (error) {
      console.error('Error calling AI API:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request. Please check your AI configuration and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLoginFlow = () => {
    // Check if repository is connected
    if (!repoConfig?.isConnected) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Please connect a repository in the Configuration tab before generating diagrams.' 
      }]);
      return;
    }

    const loginFlowCode = `graph TD
    A[User visits app] --> B{Is user logged in?}
    B -->|No| C[Show login form]
    B -->|Yes| D[Redirect to dashboard]
    C --> E[User enters credentials]
    E --> F[Validate credentials]
    F -->|Invalid| G[Show error message]
    F -->|Valid| H[Create session]
    G --> C
    H --> I[Redirect to dashboard]
    I --> J[User can access protected routes]`;
    
    onGenerateDiagram(loginFlowCode);
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'I\'ve generated a login flow diagram for you! Check the right panel to see it rendered.' 
    }]);
  };

  const getStatusMessage = () => {
    if (!aiConfig?.apiKey) {
      return { type: 'error', message: 'AI not configured', icon: AlertCircle };
    }
    if (!repoConfig?.isConnected) {
      return { type: 'warning', message: 'Repository not connected', icon: AlertCircle };
    }
    return { type: 'success', message: 'Ready to assist', icon: Bot };
  };

  const status = getStatusMessage();

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Status Indicator */}
      <div className={`flex items-center space-x-2 p-2 rounded-md text-xs flex-shrink-0 ${
        status.type === 'error' 
          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' 
          : status.type === 'warning'
          ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
      }`}>
        <status.icon className="w-3 h-3" />
        <span>{status.message}</span>
      </div>

      {/* Messages */}
      <div className="space-y-2 overflow-y-auto scrollbar-hide flex-1 min-h-0">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg text-sm ${
              message.role === 'user'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 ml-4'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-4'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded-lg text-sm mr-4">
            Thinking...
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 flex-shrink-0">
        <button
          onClick={handleGenerateLoginFlow}
          disabled={!repoConfig?.isConnected}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 rounded-md transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Login Flow</span>
        </button>
        
        <button
          onClick={() => setInput('Generate a component architecture diagram for this codebase')}
          disabled={!aiConfig?.apiKey}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 rounded-md transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Component Architecture</span>
        </button>
        
        <button
          onClick={() => setInput('Create a database schema diagram')}
          disabled={!aiConfig?.apiKey}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 rounded-md transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Database Schema</span>
        </button>
        
        <button
          onClick={() => setInput('Show me a sequence diagram for the main user flow')}
          disabled={!aiConfig?.apiKey}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 rounded-md transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>User Flow Sequence</span>
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to analyze your code..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          disabled={isLoading || !aiConfig?.apiKey}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || !aiConfig?.apiKey}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 rounded-md transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
} 