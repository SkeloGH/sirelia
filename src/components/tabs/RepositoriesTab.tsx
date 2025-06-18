'use client';

import { useState, useEffect } from 'react';
import { Github, ExternalLink, Trash2 } from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  url: string;
  isConnected: boolean;
  lastAccessed?: string;
}

export default function RepositoriesTab() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRepositories = () => {
    // Load repositories from localStorage
    const savedRepos = localStorage.getItem('sirelia-repo-config');
    if (savedRepos) {
      try {
        const config = JSON.parse(savedRepos);
        if (config.url) {
          setRepositories([{
            id: '1',
            name: config.url.split('/').pop() || 'Repository',
            url: config.url,
            isConnected: config.isConnected || false,
            lastAccessed: new Date().toISOString()
          }]);
        } else {
          setRepositories([]);
        }
      } catch (error) {
        console.error('Failed to load repository config:', error);
        setRepositories([]);
      }
    } else {
      setRepositories([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRepositories();
  }, []);

  // Listen for storage changes to refresh when repository is connected
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sirelia-repo-config') {
        loadRepositories();
      }
    };

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomEvent = () => {
      loadRepositories();
    };
    window.addEventListener('repositoryConnected', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('repositoryConnected', handleCustomEvent);
    };
  }, []);

  const openRepository = (url: string) => {
    window.open(url, '_blank');
  };

  const removeRepository = (id: string) => {
    setRepositories(prev => prev.filter(repo => repo.id !== id));
    localStorage.removeItem('sirelia-repo-config');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Connected Repositories
      </div>

      {repositories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Github className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No repositories connected</p>
          <p className="text-xs">Connect a repository in the Configuration tab to start collaborating with AI</p>
        </div>
      ) : (
        <div className="space-y-2">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Github className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {repo.isConnected && (
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1 mx-1" title="Connected" />
                    )}
                    {repo.name}
                    </div>
                  <div className="text-xs text-gray-500">{repo.url}</div>
                  {repo.lastAccessed && (
                    <div className="text-xs text-gray-400">
                      Last accessed: {new Date(repo.lastAccessed).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                
                <button
                  onClick={() => openRepository(repo.url)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Open repository"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => removeRepository(repo.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove repository"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 