'use client';

import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface AssistantTabProps {
  onGenerateDiagram: (code: string) => void;
}

export default function AssistantTab({ onGenerateDiagram }: AssistantTabProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I can help you generate Mermaid diagrams from your codebase. Try asking me to analyze your repository or generate a specific diagram.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = `I understand you want to generate a diagram. Here's a sample login flow diagram based on your request:`;
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleGenerateLoginFlow = () => {
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

  return (
    <div className="space-y-3">
      {/* Messages */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg text-sm ${
              message.role === 'user'
                ? 'bg-blue-100 text-blue-900 ml-4'
                : 'bg-gray-100 text-gray-900 mr-4'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 text-gray-900 p-2 rounded-lg text-sm mr-4">
            Thinking...
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button
          onClick={handleGenerateLoginFlow}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Login Flow</span>
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to analyze your code..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
} 