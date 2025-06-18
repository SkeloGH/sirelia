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
   * Safely call a tool on the standard MCP client
   * 
   * Note: According to the AI SDK documentation (https://ai-sdk.dev/docs/reference/ai-sdk-core/create-mcp-client),
   * the MCP client is primarily designed to work with generateText for tool conversion between MCP tools and AI SDK tools.
   * Direct tool calling is not the primary use case, but we provide this method as a fallback.
   */
  private async safeCallStandardTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const client = this.mcpService.getClient();
    
    if (!client) {
      throw new Error('MCP client not available');
    }

    try {
      // Get the tools from the client
      const tools = await client.tools();
      
      // Check if the tool exists
      if (!(toolName in tools)) {
        throw new Error(`Tool '${toolName}' not found in available tools: ${Object.keys(tools).join(', ')}`);
      }

      const tool = tools[toolName];
      
      // The AI SDK MCP client tools are designed to work with generateText
      // For direct tool execution, we need to access the underlying tool implementation
      if (typeof tool.execute === 'function') {
        // Use type assertion to avoid complex type issues with the AI SDK
        // The AI SDK has complex generic types that make direct calling difficult
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (tool.execute as any)(args);
      }
      
      throw new Error(`Tool '${toolName}' does not have an execute method`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown tool call error';
      throw new Error(`Failed to call tool '${toolName}': ${errorMessage}`);
    }
  }

  /**
   * Find a tool by name pattern
   */
  private async findToolByPattern(patterns: string[]): Promise<string | null> {
    try {
      const tools = await this.mcpService.getTools();
      const toolNames = Object.keys(tools);
      
      for (const pattern of patterns) {
        const found = toolNames.find(tool => 
          tool.toLowerCase().includes(pattern.toLowerCase())
        );
        if (found) {
          return found;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to find tool by pattern:', error);
      return null;
    }
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
        // Look for repository info tools
        const repoInfoTool = await this.findToolByPattern(['repository', 'repo']);

        if (repoInfoTool) {
          const result = await this.safeCallStandardTool(repoInfoTool, { owner, repo });
          return result as MCPRepositoryInfo;
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
        // Look for file content tools
        const fileTool = await this.findToolByPattern(['file', 'content', 'read']);

        if (fileTool) {
          const result = await this.safeCallStandardTool(fileTool, { owner, repo, path });
          return (result as { content?: string; data?: string })?.content || (result as { content?: string; data?: string })?.data || null;
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
        // Look for file listing tools
        const listTool = await this.findToolByPattern(['list', 'files', 'directory']);

        if (listTool) {
          const result = await this.safeCallStandardTool(listTool, { owner, repo, path });
          return Array.isArray(result) ? result as MCPFileInfo[] : [];
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
        // Look for commit history tools
        const commitTool = await this.findToolByPattern(['commit', 'history', 'log']);

        if (commitTool) {
          const args: Record<string, unknown> = { owner, repo };
          if (path) args.path = path;
          
          const result = await this.safeCallStandardTool(commitTool, args);
          return Array.isArray(result) ? result as MCPGitCommit[] : [];
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