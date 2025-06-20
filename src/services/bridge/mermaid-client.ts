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
      await fetch('http://localhost:3000', { 
        method: 'HEAD',
        mode: 'no-cors' // This will work even with CORS restrictions
      });
      this.serverConnected = true;
      this.updateConnectionStatus();
    } catch {
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
    
    console.log('Updating connection status:', {
      serverConnected: this.serverConnected,
      socketConnected: socketConnected,
      wsReadyState: this.ws?.readyState,
      wsExists: !!this.ws
    });
    
    this.onConnectionChange({
      serverConnected: this.serverConnected,
      socketConnected: socketConnected
    });
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