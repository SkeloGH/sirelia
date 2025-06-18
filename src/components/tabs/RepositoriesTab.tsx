'use client';

import { useState, useEffect } from 'react';
import { GitBranch, ExternalLink, Check, Plus, Settings } from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  owner: string;
  url: string;
  isActive: boolean;
}

export default function RepositoriesTab() {
  const [repositories, setRepositories] = useState<Repository[]>([]);

  // Load connected repository from localStorage
  useEffect(() => {
    const savedRepoConfig = localStorage.getItem('siren-repo-config');
    if (savedRepoConfig) {
      try {
        const config = JSON.parse(savedRepoConfig);
        if (config.isConnected && config.url) {
          // Parse GitHub URL to extract owner and repo name
          const urlParts = config.url.split('/');
          const owner = urlParts[urlParts.length - 2];
          const name = urlParts[urlParts.length - 1];
          
          const repo: Repository = {
            id: 'connected',
            name,
            owner,
            url: config.url,
            isActive: true
          };
          
          setRepositories([repo]);
        }
      } catch (error) {
        console.error('Error loading repository config:', error);
      }
    }
  }, []);

  const setActiveRepository = (id: string) => {
    setRepositories(prev => 
      prev.map(repo => ({
        ...repo,
        isActive: repo.id === id
      }))
    );
  };

  const openConfiguration = () => {
    // In a real app, this would navigate to or open the configuration tab
    alert('Please open the Configuration tab to manage repository connections');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Connected Repositories
        </div>
        <button
          onClick={openConfiguration}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
        >
          <Settings className="w-3 h-3" />
          <span>Configure</span>
        </button>
      </div>

      <div className="space-y-2">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              repo.isActive
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveRepository(repo.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {repo.owner}/{repo.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {repo.url}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {repo.isActive && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {repositories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <GitBranch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No repositories connected</p>
          <p className="text-xs mb-4">Connect a repository to start analyzing your code</p>
          <button
            onClick={openConfiguration}
            className="flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Repository</span>
          </button>
        </div>
      )}
    </div>
  );
} 