export interface MermaidMessage {
  type: 'mermaid-render';
  code: string;
  theme?: string;
  timestamp: number;
}

export interface ConnectionStatus {
  serverConnected: boolean;
  socketConnected: boolean;
}

export class MermaidBridgeClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onDiagramReceived: (code: string, theme: string) => void;
  private onConnectionChange: (status: ConnectionStatus) => void;
  private serverConnected: boolean = false;
  private statusCheckInterval: NodeJS.Timeout | null = null;
  private _lastStatus?: ConnectionStatus;

  constructor(
    onDiagramReceived: (code: string, theme: string) => void,
    onConnectionChange: (status: ConnectionStatus) => void = () => {}
  ) {
    this.onDiagramReceived = onDiagramReceived;
    this.onConnectionChange = onConnectionChange;
  }

  connect() {
    // Check if web server is accessible (server connection)
    this.checkServerConnection();
    
    // Connect to WebSocket bridge server
    this.connectWebSocket();
    
    // Start periodic status check
    this.startStatusCheck();
  }

  private async checkServerConnection() {
    try {
      // Use a simple GET request to check if the server is accessible
      // Remove 'no-cors' mode to get actual response status
      const response = await fetch('http://localhost:3000', { 
        method: 'GET',
        // Remove mode: 'no-cors' to get actual response
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      // Consider server connected if we get any response (even 404 is fine)
      this.serverConnected = response.ok || response.status < 500;
      this.updateConnectionStatus();
    } catch (error) {
      console.log('Server connection check failed:', error);
      this.serverConnected = false;
      this.updateConnectionStatus();
    }
  }

  private connectWebSocket() {
    try {
      this.ws = new WebSocket('ws://localhost:3001');
      
      this.ws.onopen = () => {
        console.log('Connected to Mermaid bridge server');
        this.reconnectAttempts = 0;
        this.updateConnectionStatus();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data: MermaidMessage = JSON.parse(event.data);
          
          if (data.type === 'mermaid-render') {
            console.log('Received Mermaid diagram from bridge server');
            this.onDiagramReceived(data.code, data.theme || 'default');
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('Disconnected from Mermaid bridge server');
        this.updateConnectionStatus();
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Force update connection status when error occurs
        // The WebSocket might still exist but be in error state
        this.updateConnectionStatus();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.updateConnectionStatus();
    }
  }

  private updateConnectionStatus() {
    // Consider socket connected only if WebSocket exists and is in OPEN state
    const socketConnected = this.ws?.readyState === WebSocket.OPEN;
    
    // Only call onConnectionChange if the status has actually changed
    if (
      this.serverConnected !== this._lastStatus?.serverConnected ||
      socketConnected !== this._lastStatus?.socketConnected
    ) {
      this._lastStatus = {
        serverConnected: this.serverConnected,
        socketConnected: socketConnected
      };
      
      console.log('Connection status changed:', this._lastStatus);
      
      this.onConnectionChange(this._lastStatus);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    // Stop periodic status check
    this.stopStatusCheck();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Update status to disconnected
    this.updateConnectionStatus();
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      serverConnected: this.serverConnected,
      socketConnected: this.ws?.readyState === WebSocket.OPEN
    };
  }

  private startStatusCheck() {
    // Clear any existing interval
    this.stopStatusCheck();
    
    this.statusCheckInterval = setInterval(() => {
      this.updateConnectionStatus();
    }, 2000); // Check every 2 seconds
  }

  private stopStatusCheck() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }
} 