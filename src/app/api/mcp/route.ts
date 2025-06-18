import { NextRequest, NextResponse } from 'next/server';
import { RepositoryService } from '@/services/mcp';
import { MCPConfig } from '@/types/ai';

// Global repository service instance
let repositoryService: RepositoryService | null = null;

export async function POST(request: NextRequest) {
  try {
    const { action, config, ...params } = await request.json();

    switch (action) {
      case 'connect':
        return await handleConnect(config);
      
      case 'disconnect':
        return await handleDisconnect();
      
      case 'status':
        return await handleGetStatus();
      
      case 'tools':
        return await handleGetTools();
      
      case 'repository-info':
        return await handleGetRepositoryInfo(params);
      
      case 'file-content':
        return await handleGetFileContent(params);
      
      case 'list-files':
        return await handleListFiles(params);
      
      case 'commit-history':
        return await handleGetCommitHistory(params);
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('MCP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleConnect(config: MCPConfig) {
  try {
    if (!repositoryService) {
      repositoryService = new RepositoryService();
    }

    const success = await repositoryService.connectToGitHub(config);
    
    if (success) {
      const status = repositoryService.getConnectionStatus();
      return NextResponse.json({ success: true, status });
    } else {
      return NextResponse.json(
        { error: 'Failed to connect to MCP server' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Connect error:', error);
    return NextResponse.json(
      { error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

async function handleDisconnect() {
  try {
    if (repositoryService) {
      await repositoryService.close();
      repositoryService = null;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}

async function handleGetStatus() {
  try {
    if (!repositoryService) {
      return NextResponse.json({ 
        connected: false, 
        status: { isConnected: false } 
      });
    }

    const status = repositoryService.getConnectionStatus();
    return NextResponse.json({ 
      connected: repositoryService.isConnected(), 
      status 
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}

async function handleGetTools() {
  try {
    if (!repositoryService || !repositoryService.isConnected()) {
      return NextResponse.json(
        { error: 'MCP service not connected' },
        { status: 400 }
      );
    }

    const tools = await repositoryService.getAvailableTools();
    return NextResponse.json({ tools });
  } catch (error) {
    console.error('Tools error:', error);
    return NextResponse.json(
      { error: 'Failed to get tools' },
      { status: 500 }
    );
  }
}

async function handleGetRepositoryInfo({ owner, repo }: { owner: string; repo: string }) {
  try {
    if (!repositoryService || !repositoryService.isConnected()) {
      return NextResponse.json(
        { error: 'MCP service not connected' },
        { status: 400 }
      );
    }

    const info = await repositoryService.getRepositoryInfo(owner, repo);
    return NextResponse.json({ info });
  } catch (error) {
    console.error('Repository info error:', error);
    return NextResponse.json(
      { error: 'Failed to get repository info' },
      { status: 500 }
    );
  }
}

async function handleGetFileContent({ owner, repo, path }: { owner: string; repo: string; path: string }) {
  try {
    if (!repositoryService || !repositoryService.isConnected()) {
      return NextResponse.json(
        { error: 'MCP service not connected' },
        { status: 400 }
      );
    }

    const content = await repositoryService.getFileContent(owner, repo, path);
    return NextResponse.json({ content });
  } catch (error) {
    console.error('File content error:', error);
    return NextResponse.json(
      { error: 'Failed to get file content' },
      { status: 500 }
    );
  }
}

async function handleListFiles({ owner, repo, path = '' }: { owner: string; repo: string; path?: string }) {
  try {
    if (!repositoryService || !repositoryService.isConnected()) {
      return NextResponse.json(
        { error: 'MCP service not connected' },
        { status: 400 }
      );
    }

    const files = await repositoryService.listFiles(owner, repo, path);
    return NextResponse.json({ files });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

async function handleGetCommitHistory({ owner, repo, path }: { owner: string; repo: string; path?: string }) {
  try {
    if (!repositoryService || !repositoryService.isConnected()) {
      return NextResponse.json(
        { error: 'MCP service not connected' },
        { status: 400 }
      );
    }

    const commits = await repositoryService.getCommitHistory(owner, repo, path);
    return NextResponse.json({ commits });
  } catch (error) {
    console.error('Commit history error:', error);
    return NextResponse.json(
      { error: 'Failed to get commit history' },
      { status: 500 }
    );
  }
} 