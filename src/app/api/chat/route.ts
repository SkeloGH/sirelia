import { Configuration, OpenAIApi } from 'openai-edge';
import Anthropic from '@anthropic-ai/sdk';
import { AIConfig, ChatMessage } from '../../../types/ai';

export async function POST(request: Request) {
  try {
    const { messages, config }: { messages: ChatMessage[]; config: AIConfig } = await request.json();
    
    if (!config?.apiKey) {
      return new Response('API key is required', { status: 400 });
    }

    const { provider, model, temperature, maxTokens } = config;

    // System prompt for Mermaid diagram generation
    const systemPrompt = `You are an AI assistant specialized in generating Mermaid diagrams from codebases. 

Your role is to:
1. Analyze code structure and architecture
2. Generate clear, accurate Mermaid diagrams
3. Provide explanations for your diagrams
4. Suggest improvements or alternative visualizations

When generating diagrams:
- Use appropriate Mermaid syntax (graph TD, flowchart, sequenceDiagram, etc.)
- Keep diagrams readable and well-organized
- Include meaningful labels and relationships
- Focus on the most important architectural elements

Always respond with clear explanations and well-formatted Mermaid code blocks.`;

    if (provider === 'openai') {
      const configuration = new Configuration({
        apiKey: config.apiKey,
      });
      const openai = new OpenAIApi(configuration);

      const response = await openai.createChatCompletion({
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: temperature || 0.3,
        max_tokens: maxTokens || 4000,
        stream: true,
      });

      // Create a readable stream from the response
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    controller.close();
                    return;
                  }
                  
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices?.[0]?.delta?.content) {
                      controller.enqueue(new TextEncoder().encode(parsed.choices[0].delta.content));
                    }
                  } catch {
                    // Ignore parsing errors
                  }
                }
              }
            }
          } catch (error) {
            controller.error(error);
          } finally {
            reader.releaseLock();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    if (provider === 'anthropic') {
      const anthropic = new Anthropic({
        apiKey: config.apiKey,
      });

      const response = await anthropic.messages.create({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens || 4000,
        temperature: temperature || 0.3,
        system: systemPrompt,
        messages: messages.map((msg: ChatMessage) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        stream: true,
      });

      // Create a readable stream from the Anthropic response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                controller.enqueue(new TextEncoder().encode(chunk.delta.text));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    if (provider === 'custom') {
      // For custom providers, you would implement your own logic here
      // This is a placeholder that returns a mock response
      const mockResponse = `I understand you want to generate a Mermaid diagram. Here's a sample response for a custom provider:

\`\`\`mermaid
graph TD
    A[Custom Provider] --> B[API Integration]
    B --> C[Response Processing]
    C --> D[Streaming Output]
    D --> E[Client Display]
\`\`\`

This shows how a custom AI provider would be integrated into the system.`;

      return new Response(mockResponse, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return new Response('Unsupported provider', { status: 400 });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 