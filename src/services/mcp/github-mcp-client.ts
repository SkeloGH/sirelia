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
  private eventSource: EventSource | null = null;
  private config: MCPConfig | null = null;
  private connectionStatus: MCPConnectionStatus = {
    isConnected: false
  };
  private messageId = 1;
  private pendingRequests = new Map<string | number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();

  /**
   * Connect to GitHub Copilot MCP server
   */
  async connect(config: MCPConfig): Promise<MCPConnectionStatus> {
    try {
      this.config = config;
      
      console.log('GitHub MCP: Connecting to:', config.serverUrl);
      
      // Create EventSource for SSE transport
      const url = new URL(config.serverUrl);
      if (config.token) {
        url.searchParams.set('token', config.token);
      }
      
      this.eventSource = new EventSource(url.toString());
      
      // Set up event handlers
      this.eventSource.onopen = () => {
        console.log('GitHub MCP: SSE connection opened');
        this.connectionStatus.isConnected = true;
        this.connectionStatus.serverUrl = config.serverUrl;
      };
      
      this.eventSource.onmessage = (event) => {
        this.handleMessage(event.data);
      };
      
      this.eventSource.onerror = (error) => {
        console.error('GitHub MCP: SSE error:', error);
        this.connectionStatus.error = 'SSE connection error';
        this.connectionStatus.isConnected = false;
      };
      
      // Wait for connection to establish
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);
        
        this.eventSource!.onopen = () => {
          clearTimeout(timeout);
          resolve();
        };
        
        this.eventSource!.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error(`Connection failed: ${error}`));
        };
      });
      
      // Test connection by getting server info
      try {
        await this.request({
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
        
        console.log('GitHub MCP: Connection established successfully');
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
    if (!this.eventSource) {
      throw new Error('Not connected to MCP server');
    }

    const id = this.messageId++;
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id,
      method: request.method,
      params: request.params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      // Send message via POST request since SSE is read-only
      fetch(this.config!.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config!.token && { 'Authorization': `Bearer ${this.config!.token}` })
        },
        body: JSON.stringify(message)
      }).catch(error => {
        this.pendingRequests.delete(id);
        reject(error);
      });
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: string) {
    try {
      const message: MCPMessage = JSON.parse(data);
      console.log('GitHub MCP: Received message:', message);
      
      if (message.id && this.pendingRequests.has(message.id)) {
        const { resolve, reject } = this.pendingRequests.get(message.id)!;
        this.pendingRequests.delete(message.id);
        
        if (message.error) {
          reject(new Error(message.error.message));
        } else {
          resolve(message.result);
        }
      }
    } catch (error) {
      console.error('GitHub MCP: Failed to parse message:', error);
    }
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
    return this.connectionStatus.isConnected && this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.connectionStatus = {
      isConnected: false
    };
    
    // Reject all pending requests
    for (const { reject } of this.pendingRequests.values()) {
      reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();
  }
} 