import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, theme = 'default' } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Mermaid code is required' },
        { status: 400 }
      );
    }
    
    console.log('API received Mermaid code:', { code: code.substring(0, 100) + '...', theme });
    
    // Send the Mermaid code to the WebSocket server via HTTP
    try {
      const response = await fetch('http://localhost:3001/mermaid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, theme }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('WebSocket server response:', result);
      
      return NextResponse.json({
        success: true,
        message: result.message || 'Mermaid code sent to WebSocket server'
      });
    } catch (fetchError) {
      console.error('Failed to send to WebSocket server:', fetchError);
      return NextResponse.json(
        { error: 'WebSocket server not available' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Mermaid bridge API error:', error);
    return NextResponse.json(
      { error: 'Failed to process Mermaid code' },
      { status: 500 }
    );
  }
} 