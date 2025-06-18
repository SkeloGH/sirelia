'use client';

import { useState } from 'react';
import { GitBranch, ExternalLink, Check } from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  owner: string;
  url: string;
  isActive: boolean;
}

export default function RepositoriesTab() {
  const [repositories, setRepositories] = useState<Repository[]>([
    {
      id: '1',
      name: 'siren',
      owner: 'ghaar',
      url: 'https://github.com/ghaar/siren',
      isActive: true
    },
    {
      id: '2',
      name: 'nextjs-app',
      owner: 'ghaar',
      url: 'https://github.com/ghaar/nextjs-app',
      isActive: false
    }
  ]);

  const setActiveRepository = (id: string) => {
    setRepositories(prev => 
      prev.map(repo => ({
        ...repo,
        isActive: repo.id === id
      }))
    );
  };

  const addRepository = () => {
    // This would typically open a modal or form to add a new repository
    alert('Repository connection functionality would be implemented here with MCP integration');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Connected Repositories
        </div>
        <button
          onClick={addRepository}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Repo
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
          <p className="text-xs">Connect a repository to start analyzing your code</p>
        </div>
      )}
    </div>
  );
} 