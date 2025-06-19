export interface MermaidMessage {
  type: 'mermaid-render';
  code: string;
  theme?: string;
  timestamp: number;
}

export class MermaidBridgeClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onDiagramReceived: (code: string, theme: string) => void;
  private onConnectionChange: (connected: boolean) => void;

  constructor(
    onDiagramReceived: (code: string, theme: string) => void,
    onConnectionChange: (connected: boolean) => void = () => {}
  ) {
    this.onDiagramReceived = onDiagramReceived;
    this.onConnectionChange = onConnectionChange;
  }

  connect() {
    try {
      this.ws = new WebSocket('ws://localhost:3001');
      
      this.ws.onopen = () => {
        console.log('Connected to Mermaid MCP bridge');
        this.reconnectAttempts = 0;
        this.onConnectionChange(true);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data: MermaidMessage = JSON.parse(event.data);
          
          if (data.type === 'mermaid-render') {
            console.log('Received Mermaid diagram from MCP bridge');
            this.onDiagramReceived(data.code, data.theme || 'default');
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('Disconnected from Mermaid MCP bridge');
        this.onConnectionChange(false);
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
} 