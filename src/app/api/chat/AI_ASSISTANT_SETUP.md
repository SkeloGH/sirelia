# AI Assistant Setup Guide

This guide explains how to set up and use the AI assistant feature in Sirelia for generating Mermaid diagrams from your codebase.

## Overview

The AI assistant feature allows you to:
- Chat with AI to generate Mermaid diagrams
- Use multiple AI providers (OpenAI, Anthropic, Custom)
- Stream responses in real-time
- Automatically extract and render Mermaid code from AI responses
- Get context-aware diagram suggestions

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already included in the project:
- `ai` - Vercel's AI SDK for streaming responses
- `openai-edge` - OpenAI API client for Edge Runtime
- `@anthropic-ai/sdk` - Anthropic Claude API client

### 2. Configure AI Provider

1. Open the **Configuration** tab in the left panel
2. Expand the **AI Agent Configuration** section
3. Choose your preferred AI provider:
   - **OpenAI**: GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo
   - **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
   - **Custom**: For custom AI providers (placeholder implementation)

### 3. Enter API Key

1. Get an API key from your chosen provider:
   - **OpenAI**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Anthropic**: [https://console.anthropic.com/](https://console.anthropic.com/)

2. Enter your API key in the configuration form
3. Adjust settings as needed:
   - **Temperature**: Controls creativity (0.0 = focused, 2.0 = creative)
   - **Max Tokens**: Maximum response length (100-8000)
4. Click **Save Configuration**

### 4. Connect Repository (Optional but Recommended)

1. In the **Repository Connection** section, enter your GitHub repository URL
2. Optionally provide a GitHub Personal Access Token for private repos
3. Click **Connect Repository**

## Using the AI Assistant

### Basic Usage

1. Open the **Assistant** tab in the left panel
2. Type your request in the input field, for example:
   - "Generate a component architecture diagram"
   - "Create a database schema diagram"
   - "Show me a sequence diagram for user authentication"

3. Press Enter or click the Send button
4. The AI will respond with streaming text and automatically extract any Mermaid diagrams

### Quick Actions

Use the quick action buttons for common requests:
- **Generate Login Flow**: Creates a user authentication flow diagram
- **Component Architecture**: Generates a component hierarchy diagram
- **Database Schema**: Creates a database relationship diagram
- **User Flow Sequence**: Generates a sequence diagram for user interactions

### Features

#### Real-time Streaming
- Responses stream in real-time as the AI generates them
- No waiting for complete responses before seeing content

#### Automatic Mermaid Detection
- The assistant automatically detects Mermaid code blocks in responses
- Detected diagrams are immediately rendered in the right panel

#### Context Awareness
- When a repository is connected, the AI can reference your actual codebase
- Provides more accurate and relevant diagram suggestions

#### Error Handling
- Graceful error handling for API failures
- Clear error messages for configuration issues
- Fallback responses when AI is unavailable

## API Implementation Details

### Chat API Endpoint

The `/api/chat` endpoint handles AI conversations:

```typescript
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "Generate a flowchart" }
  ],
  "config": {
    "provider": "openai",
    "apiKey": "your-api-key",
    "model": "gpt-4o-mini",
    "temperature": 0.3,
    "maxTokens": 4000
  }
}
```

### Streaming Response

The API returns a streaming response with proper headers:
- `Content-Type: text/plain; charset=utf-8`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

### System Prompt

The AI is configured with a specialized system prompt for Mermaid diagram generation:

```
You are an AI assistant specialized in generating Mermaid diagrams from codebases.

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

Always respond with clear explanations and well-formatted Mermaid code blocks.
```

## Troubleshooting

### Common Issues

1. **"AI not configured" error**
   - Make sure you've entered an API key in the Configuration tab
   - Verify the API key is valid and has sufficient credits

2. **"Repository not connected" warning**
   - Connect a repository in the Configuration tab for better context
   - Public repos work without tokens, private repos require GitHub tokens

3. **Streaming not working**
   - Check browser compatibility (requires modern browsers with ReadableStream support)
   - Verify network connectivity and API endpoint accessibility

4. **No diagrams generated**
   - Try more specific prompts like "Create a flowchart showing..."
   - Check that the AI response contains Mermaid code blocks

### Testing

Use the test page at `/test` to verify API functionality:
1. Navigate to `http://localhost:3000/test`
2. Click "Test API" to verify the endpoint works
3. Check the response for expected output

## Security Considerations

- API keys are stored locally in browser localStorage
- No API keys are sent to external servers except the configured AI providers
- Consider using environment variables for production deployments
- Implement proper authentication for multi-user environments

## Future Enhancements

- **MCP Integration**: Enhanced repository context through Model Context Protocol
- **Multi-repository Support**: Work with multiple repositories simultaneously
- **Diagram Templates**: Pre-built diagram templates for common use cases
- **Export Functionality**: Export diagrams as PNG, SVG, or PDF
- **Collaboration Features**: Share and collaborate on diagrams
- **Custom Themes**: Customizable diagram styling and themes

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your API configuration
3. Test with the `/test` endpoint
4. Review browser console for error messages
5. Ensure all dependencies are properly installed 