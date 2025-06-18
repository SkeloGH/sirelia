import { experimental_createMCPClient, MCPClientError } from 'ai';
import { MCPConfig } from '../../types/ai';
import { MCPConnectionStatus, MCPToolSet } from './types';

export class MCPService {
  private client: Awaited<ReturnType<typeof experimental_createMCPClient>> | null = null;
  private config: MCPConfig | null = null;
  private connectionStatus: MCPConnectionStatus = {
    isConnected: false
  };

  /**
   * Connect to an MCP server
   */
  async connect(config: MCPConfig): Promise<MCPConnectionStatus> {
    try {
      this.config = config;
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers
      };

      if (config.token) {
        headers['Authorization'] = `Bearer ${config.token}`;
        console.log('MCP: Using token for authentication');
      } else {
        console.log('MCP: No token provided - attempting unauthenticated connection');
      }

      console.log('MCP: Connecting to server:', config.serverUrl);
      console.log('MCP: Headers:', headers);

      // Create MCP client
      this.client = await experimental_createMCPClient({
        transport: {
          type: 'sse',
          url: config.serverUrl,
          headers
        },
        name: config.name || 'sirelia-mcp-client',
        onUncaughtError: (error) => {
          console.error('MCP Client uncaught error:', error);
          this.connectionStatus.error = error instanceof Error ? error.message : String(error);
        }
      });

      console.log('MCP: Client created successfully, testing connection...');

      // Test connection by getting tools
      const tools = await this.client.tools();
      
      console.log('MCP: Connection successful, available tools:', Object.keys(tools));
      
      this.connectionStatus = {
        isConnected: true,
        serverUrl: config.serverUrl,
        capabilities: Object.keys(tools)
      };

      return this.connectionStatus;
    } catch (error) {
      const errorMessage = error instanceof MCPClientError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Unknown MCP connection error';

      console.error('MCP: Connection failed:', errorMessage);
      console.error('MCP: Full error:', error);

      this.connectionStatus = {
        isConnected: false,
        serverUrl: config.serverUrl,
        error: errorMessage
      };

      throw new Error(`Failed to connect to MCP server: ${errorMessage}`);
    }
  }

  /**
   * Get the current connection status
   */
  getConnectionStatus(): MCPConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Get tools from the MCP server
   */
  async getTools(): Promise<MCPToolSet> {
    if (!this.client) {
      throw new Error('MCP client not connected. Call connect() first.');
    }

    try {
      const tools = await this.client.tools();
      return tools as unknown as MCPToolSet;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get MCP tools: ${errorMessage}`);
    }
  }

  /**
   * Check if a specific capability is available
   */
  async hasCapability(capability: string): Promise<boolean> {
    try {
      const tools = await this.getTools();
      return Object.keys(tools).some(toolName => 
        toolName.toLowerCase().includes(capability.toLowerCase())
      );
    } catch {
      return false;
    }
  }

  /**
   * Close the MCP connection
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        console.error('Error closing MCP client:', error);
      } finally {
        this.client = null;
        this.connectionStatus = {
          isConnected: false
        };
      }
    }
  }

  /**
   * Check if the client is connected
   */
  isConnected(): boolean {
    return this.connectionStatus.isConnected && this.client !== null;
  }

  /**
   * Get the underlying MCP client for advanced usage
   */
  getClient() {
    return this.client;
  }
} 