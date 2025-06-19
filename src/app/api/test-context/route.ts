import { RepositoryContextBuilder } from '../../../services/context/RepositoryContextBuilder';
import { RepositoryService } from '../../../services/mcp/repository-service';
import { MCPConfig } from '../../../types/ai';

export async function POST(request: Request) {
  try {
    const { repositoryUrl, userRequest, mcpConfig, checkToolsOnly }: {
      repositoryUrl: string;
      userRequest: string;
      mcpConfig?: MCPConfig;
      checkToolsOnly?: boolean;
    } = await request.json();

    if (!repositoryUrl || !userRequest) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: repositoryUrl and userRequest'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create a single RepositoryService instance
    const repoService = new RepositoryService();

    // If MCP config is provided, establish connection
    if (mcpConfig) {
      console.log('Connecting to MCP server:', mcpConfig.serverUrl);
      
      const connected = await repoService.connectToGitHub(mcpConfig);
      
      if (!connected) {
        return new Response(JSON.stringify({
          error: 'Failed to connect to MCP server',
          details: 'MCP connection failed'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.log('MCP connection established successfully');
      
      // Debug: Check what tools are available
      try {
        const availableTools = await repoService.getAvailableTools();
        console.log('Available MCP tools:', JSON.stringify(availableTools, null, 2));
        
        // If this is a tools-only check, return the tools
        if (checkToolsOnly) {
          return new Response(JSON.stringify({
            success: true,
            availableTools,
            toolCount: availableTools.length,
            mcpConfig: {
              serverUrl: mcpConfig.serverUrl,
              isConnected: true,
              isEnabled: mcpConfig.isEnabled
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.warn('Failed to get available tools:', error);
      }
    }

    // Test the Repository Context Builder with the connected service
    const contextBuilder = new RepositoryContextBuilder(repoService);
    
    console.log('Testing Repository Context Builder with:', {
      repositoryUrl,
      userRequest,
      hasMCPConfig: !!mcpConfig
    });

    const context = await contextBuilder.buildContext({
      repositoryUrl,
      userRequest,
      selectedFiles: []
    });

    console.log('Context Builder result:', {
      repositoryName: context.repository.name,
      fileCount: context.context.fileCount,
      intent: context.userRequest.intent,
      diagramType: context.userRequest.diagramType
    });

    return new Response(JSON.stringify({
      success: true,
      context,
      metadata: {
        repositoryName: context.repository.name,
        totalFiles: context.repository.structure.totalFiles,
        relevantFiles: context.context.fileCount,
        userIntent: context.userRequest.intent,
        suggestedDiagramType: context.userRequest.diagramType,
        fileTypes: context.context.fileTypes
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Test Context API error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to build repository context',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 