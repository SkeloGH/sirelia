'use client';

import { useState, useEffect } from 'react';
import { Github, ExternalLink, Trash2, Star, StarOff } from 'lucide-react';
import { RepositoriesState } from '../../types/ai';

export default function RepositoriesTab() {
  const [repositoriesState, setRepositoriesState] = useState<RepositoriesState>({
    repositories: [],
    activeRepositoryId: undefined
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadRepositories = () => {
    // Load repositories from localStorage
    const savedReposState = localStorage.getItem('sirelia-repositories-state');
    if (savedReposState) {
      try {
        const state = JSON.parse(savedReposState);
        setRepositoriesState(state);
      } catch (error) {
        console.error('Failed to load repositories state:', error);
        setRepositoriesState({ repositories: [], activeRepositoryId: undefined });
      }
    } else {
      setRepositoriesState({ repositories: [], activeRepositoryId: undefined });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRepositories();
  }, []);

  // Listen for storage changes to refresh when repository is connected
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sirelia-repositories-state') {
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

  const setActiveRepository = (repoUrl: string) => {
    const updatedRepositories = repositoriesState.repositories.map(repo => ({
      ...repo,
      isActive: repo.url === repoUrl
    }));

    const newState: RepositoriesState = {
      repositories: updatedRepositories,
      activeRepositoryId: repoUrl
    };

    setRepositoriesState(newState);
    localStorage.setItem('sirelia-repositories-state', JSON.stringify(newState));
    
    // Trigger event to notify other components
    window.dispatchEvent(new CustomEvent('activeRepositoryChanged', { 
      detail: { activeRepository: updatedRepositories.find(repo => repo.url === repoUrl) }
    }));
  };

  const removeRepository = (repoUrl: string) => {
    const updatedRepositories = repositoriesState.repositories.filter(repo => repo.url !== repoUrl);
    
    // If we're removing the active repository, set the first remaining one as active
    let newActiveId = repositoriesState.activeRepositoryId;
    if (repoUrl === repositoriesState.activeRepositoryId) {
      newActiveId = updatedRepositories.length > 0 ? updatedRepositories[0].url : undefined;
      if (newActiveId) {
        updatedRepositories[0].isActive = true;
      }
    }

    const newState: RepositoriesState = {
      repositories: updatedRepositories,
      activeRepositoryId: newActiveId
    };

    setRepositoriesState(newState);
    localStorage.setItem('sirelia-repositories-state', JSON.stringify(newState));
    
    // Trigger event to notify other components
    window.dispatchEvent(new CustomEvent('repositoryConnected'));
  };

  const openRepository = (url: string) => {
    window.open(url, '_blank');
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

      {repositoriesState.repositories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Github className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No repositories connected</p>
          <p className="text-xs">Add a repository in the Configuration tab to start collaborating with AI</p>
        </div>
      ) : (
        <div className="space-y-2">
          {repositoriesState.repositories.map((repo) => (
            <div
              key={repo.url}
              className={`flex items-center justify-between p-3 bg-white border rounded-md hover:bg-gray-50 transition-colors ${
                repo.isActive ? 'border-yellow-500 bg-blue-50' : 'border-gray-200 opacity-90'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Github className="w-4 h-4 text-gray-600" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-gray-900">
                      {repo.name || repo.url.split('/').pop()}
                    </div>
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        repo.isActive 
                          ? 'bg-green-400 ring-1 text-yellow-600'
                          : 'bg-green-300 opacity-50'
                      }`}
                      title={repo.isActive ? 'Connected and Active' : 'Connected'}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{repo.url.replace('https://github.com/', '')}</div>
                  {repo.owner && (
                    <div className="text-xs text-gray-400">Owner: {repo.owner}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!repo.isActive && (
                  <button
                    onClick={() => setActiveRepository(repo.url)}
                    className="p-1 text-gray-400 hover:text-yellow-600 hover:cursor-pointer transition-colors"
                    title="Set as active repository"
                  >
                    <StarOff className="w-4 h-4" />
                  </button>
                )}
                
                {repo.isActive && (
                  <button
                    className="p-1 text-yellow-600 transition-colors"
                    title="Active repository"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => openRepository(repo.url)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:cursor-pointer transition-colors"
                  title="Open repository"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => removeRepository(repo.url)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:cursor-pointer transition-colors"
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