import { MCPService } from './mcp-client';
import { GitHubMCPClient } from './github-mcp-client';
import { MCPConfig } from '../../types/ai';
import { MCPFileInfo, MCPRepositoryInfo, MCPGitCommit } from './types';

export class RepositoryService {
  private mcpService: MCPService;
  private githubMcpClient: GitHubMCPClient | null = null;
  private isGitHubCopilot = false;

  constructor() {
    this.mcpService = new MCPService();
  }

  /**
   * Connect to a GitHub MCP server
   */
  async connectToGitHub(config: MCPConfig): Promise<boolean> {
    try {
      // Check if this is GitHub Copilot server
      this.isGitHubCopilot = config.serverUrl.includes('githubcopilot.com');
      
      if (this.isGitHubCopilot) {
        console.log('Using GitHub Copilot MCP client');
        this.githubMcpClient = new GitHubMCPClient();
        await this.githubMcpClient.connect(config);
        return this.githubMcpClient.isConnected();
      } else {
        console.log('Using standard MCP client');
        await this.mcpService.connect(config);
        return this.mcpService.isConnected();
      }
    } catch (error) {
      console.error('Failed to connect to GitHub MCP server:', error);
      return false;
    }
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo(owner: string, repo: string): Promise<MCPRepositoryInfo | null> {
    if (this.isGitHubCopilot) {
      if (!this.githubMcpClient?.isConnected()) {
        throw new Error('GitHub MCP client not connected');
      }
      
      try {
        const result = await this.githubMcpClient.callTool('get_repository_info', { owner, repo });
        return result as MCPRepositoryInfo;
      } catch (error) {
        console.error('Failed to get repository info from GitHub Copilot:', error);
        return null;
      }
    } else {
      if (!this.mcpService.isConnected()) {
        throw new Error('MCP service not connected');
      }

      try {
        const tools = await this.mcpService.getTools();
        
        // Look for repository info tools
        const repoInfoTool = Object.keys(tools).find(tool => 
          tool.toLowerCase().includes('repository') || 
          tool.toLowerCase().includes('repo')
        );

        if (repoInfoTool) {
          const client = this.mcpService.getClient();
          if (client) {
            // Use the underlying client to call the tool
            const result = await (client as unknown as { callTool: (params: { name: string; args: Record<string, unknown> }) => Promise<unknown> }).callTool({
              name: repoInfoTool,
              args: { owner, repo }
            });
            return result as MCPRepositoryInfo;
          }
        }

        return null;
      } catch (error) {
        console.error('Failed to get repository info:', error);
        return null;
      }
    }
  }

  /**
   * Get file content from repository
   */
  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    if (this.isGitHubCopilot) {
      if (!this.githubMcpClient?.isConnected()) {
        throw new Error('GitHub MCP client not connected');
      }
      
      try {
        const result = await this.githubMcpClient.callTool('get_file_content', { owner, repo, path });
        return (result as { content?: string })?.content || null;
      } catch (error) {
        console.error('Failed to get file content from GitHub Copilot:', error);
        return null;
      }
    } else {
      if (!this.mcpService.isConnected()) {
        throw new Error('MCP service not connected');
      }

      try {
        const tools = await this.mcpService.getTools();
        
        // Look for file content tools
        const fileTool = Object.keys(tools).find(tool => 
          tool.toLowerCase().includes('file') || 
          tool.toLowerCase().includes('content') ||
          tool.toLowerCase().includes('read')
        );

        if (fileTool) {
          const client = this.mcpService.getClient();
          if (client) {
            const result = await (client as unknown as { callTool: (params: { name: string; args: Record<string, unknown> }) => Promise<unknown> }).callTool({
              name: fileTool,
              args: { owner, repo, path }
            });
            return (result as { content?: string; data?: string })?.content || (result as { content?: string; data?: string })?.data || null;
          }
        }

        return null;
      } catch (error) {
        console.error('Failed to get file content:', error);
        return null;
      }
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(owner: string, repo: string, path: string = ''): Promise<MCPFileInfo[]> {
    if (this.isGitHubCopilot) {
      if (!this.githubMcpClient?.isConnected()) {
        throw new Error('GitHub MCP client not connected');
      }
      
      try {
        const result = await this.githubMcpClient.callTool('list_files', { owner, repo, path });
        return Array.isArray(result) ? result as MCPFileInfo[] : [];
      } catch (error) {
        console.error('Failed to list files from GitHub Copilot:', error);
        return [];
      }
    } else {
      if (!this.mcpService.isConnected()) {
        throw new Error('MCP service not connected');
      }

      try {
        const tools = await this.mcpService.getTools();
        
        // Look for file listing tools
        const listTool = Object.keys(tools).find(tool => 
          tool.toLowerCase().includes('list') || 
          tool.toLowerCase().includes('files') ||
          tool.toLowerCase().includes('directory')
        );

        if (listTool) {
          const client = this.mcpService.getClient();
          if (client) {
            const result = await (client as unknown as { callTool: (params: { name: string; args: Record<string, unknown> }) => Promise<unknown> }).callTool({
              name: listTool,
              args: { owner, repo, path }
            });
            return Array.isArray(result) ? result as MCPFileInfo[] : [];
          }
        }

        return [];
      } catch (error) {
        console.error('Failed to list files:', error);
        return [];
      }
    }
  }

  /**
   * Get commit history
   */
  async getCommitHistory(owner: string, repo: string, path?: string): Promise<MCPGitCommit[]> {
    if (this.isGitHubCopilot) {
      if (!this.githubMcpClient?.isConnected()) {
        throw new Error('GitHub MCP client not connected');
      }
      
      try {
        const args: Record<string, unknown> = { owner, repo };
        if (path) args.path = path;
        
        const result = await this.githubMcpClient.callTool('get_commit_history', args);
        return Array.isArray(result) ? result as MCPGitCommit[] : [];
      } catch (error) {
        console.error('Failed to get commit history from GitHub Copilot:', error);
        return [];
      }
    } else {
      if (!this.mcpService.isConnected()) {
        throw new Error('MCP service not connected');
      }

      try {
        const tools = await this.mcpService.getTools();
        
        // Look for commit history tools
        const commitTool = Object.keys(tools).find(tool => 
          tool.toLowerCase().includes('commit') || 
          tool.toLowerCase().includes('history') ||
          tool.toLowerCase().includes('log')
        );

        if (commitTool) {
          const client = this.mcpService.getClient();
          if (client) {
            const args: Record<string, unknown> = { owner, repo };
            if (path) args.path = path;
            
            const result = await (client as unknown as { callTool: (params: { name: string; args: Record<string, unknown> }) => Promise<unknown> }).callTool({
              name: commitTool,
              args
            });
            return Array.isArray(result) ? result as MCPGitCommit[] : [];
          }
        }

        return [];
      } catch (error) {
        console.error('Failed to get commit history:', error);
        return [];
      }
    }
  }

  /**
   * Check if MCP service has specific capabilities
   */
  async hasCapability(capability: string): Promise<boolean> {
    if (this.isGitHubCopilot) {
      if (!this.githubMcpClient?.isConnected()) {
        return false;
      }
      
      try {
        const tools = await this.githubMcpClient.getTools();
        return Object.keys(tools).some(toolName => 
          toolName.toLowerCase().includes(capability.toLowerCase())
        );
      } catch {
        return false;
      }
    } else {
      return this.mcpService.hasCapability(capability);
    }
  }

  /**
   * Get available tools/capabilities
   */
  async getAvailableTools(): Promise<string[]> {
    try {
      if (this.isGitHubCopilot) {
        if (!this.githubMcpClient?.isConnected()) {
          return [];
        }
        const tools = await this.githubMcpClient.getTools();
        return Object.keys(tools);
      } else {
        const tools = await this.mcpService.getTools();
        return Object.keys(tools);
      }
    } catch (error) {
      console.error('Failed to get available tools:', error);
      return [];
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    if (this.isGitHubCopilot) {
      return this.githubMcpClient?.getConnectionStatus() || { isConnected: false };
    } else {
      return this.mcpService.getConnectionStatus();
    }
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.isGitHubCopilot) {
      await this.githubMcpClient?.close();
      this.githubMcpClient = null;
    } else {
      await this.mcpService.close();
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    if (this.isGitHubCopilot) {
      return this.githubMcpClient?.isConnected() || false;
    } else {
      return this.mcpService.isConnected();
    }
  }
} 