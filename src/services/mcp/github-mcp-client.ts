import { MCPConfig } from '../../types/ai';
import { MCPConnectionStatus, MCPToolSet } from './types';

interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export class GitHubMCPClient {
  private config: MCPConfig | null = null;
  private connectionStatus: MCPConnectionStatus = {
    isConnected: false
  };
  private messageId = 1;

  /**
   * Connect to GitHub Copilot MCP server
   */
  async connect(config: MCPConfig): Promise<MCPConnectionStatus> {
    try {
      this.config = config;
      
      console.log('GitHub MCP: Connecting to:', config.serverUrl);
      
      // Test connection by sending an initialize request
      try {
        const response = await this.request({
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            clientInfo: {
              name: config.name || 'sirelia-mcp-client',
              version: '1.0.0'
            }
          }
        });
        
        console.log('GitHub MCP: Connection established successfully', response);
        
        this.connectionStatus = {
          isConnected: true,
          serverUrl: config.serverUrl,
          capabilities: ['tools']
        };
        
        return this.connectionStatus;
        
      } catch (error) {
        console.error('GitHub MCP: Initialization failed:', error);
        throw error;
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.connectionStatus = {
        isConnected: false,
        serverUrl: config.serverUrl,
        error: errorMessage
      };
      throw new Error(`Failed to connect to GitHub MCP server: ${errorMessage}`);
    }
  }

  /**
   * Send a request and wait for response
   */
  private async request(request: { method: string; params?: Record<string, unknown> }): Promise<unknown> {
    if (!this.config) {
      throw new Error('Not configured');
    }

    const id = this.messageId++;
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id,
      method: request.method,
      params: request.params
    };

    console.log('GitHub MCP: Sending request:', message);

    const response = await fetch(this.config.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.config.token && { 'Authorization': `Bearer ${this.config.token}` }),
        ...(this.config.headers || {})
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('GitHub MCP: Received response:', responseData);

    if (responseData.error) {
      throw new Error(`MCP Error: ${responseData.error.message}`);
    }

    return responseData.result;
  }

  /**
   * Get available tools
   */
  async getTools(): Promise<MCPToolSet> {
    try {
      const result = await this.request({
        method: 'tools/list',
        params: {}
      });
      
      return result as MCPToolSet;
    } catch (error) {
      console.error('GitHub MCP: Failed to get tools:', error);
      return {};
    }
  }

  /**
   * Call a specific tool
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    return this.request({
      method: 'tools/call',
      params: {
        name,
        arguments: args
      }
    });
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): MCPConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionStatus.isConnected;
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    this.connectionStatus.isConnected = false;
    this.config = null;
  }
} 