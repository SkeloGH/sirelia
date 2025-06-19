import { RepositoryService } from '../mcp/repository-service';
import { 
  RepositoryContextRequest, 
  RepositoryContext, 
  RepositoryInfo, 
  FileStructure, 
  FileContent, 
  FileRelationship 
} from '../../types/context';
import { MCPFileInfo } from '../mcp/types';

export class RepositoryContextBuilder {
  private repoService: RepositoryService;

  constructor(repoService?: RepositoryService) {
    this.repoService = repoService || new RepositoryService();
  }

  async buildContext(request: RepositoryContextRequest): Promise<RepositoryContext> {
    const { repositoryUrl, userRequest, selectedFiles = [] } = request;

    // 1. Get basic repository info
    const repoInfo = await this.getRepositoryInfo(repositoryUrl);
    
    // 2. Get file structure
    const fileStructure = await this.getFileStructure(repositoryUrl);
    
    // 3. Determine relevant files
    const relevantFiles = await this.determineRelevantFiles(
      userRequest, 
      fileStructure, 
      selectedFiles
    );
    
    // 4. Get file contents
    const fileContents = await this.getFileContents(repositoryUrl, relevantFiles);
    
    // 5. Build context
    return this.assembleContext(repoInfo, fileStructure, fileContents, userRequest);
  }

  private async getRepositoryInfo(repositoryUrl: string): Promise<RepositoryInfo> {
    const { owner, repo } = this.parseRepositoryUrl(repositoryUrl);
    
    try {
      const mcpRepoInfo = await this.repoService.getRepositoryInfo(owner, repo);
      
      if (mcpRepoInfo) {
        return {
          name: mcpRepoInfo.name,
          description: mcpRepoInfo.description || '',
          owner: mcpRepoInfo.owner,
          repo: mcpRepoInfo.name,
          defaultBranch: mcpRepoInfo.defaultBranch,
          language: undefined, // Will be enhanced later
          topics: undefined // Will be enhanced later
        };
      }
    } catch (error) {
      console.warn('Failed to get repository info from MCP, using fallback:', error);
    }

    // Fallback: Create basic repository info from URL
    return {
      name: repo,
      description: `Repository: ${owner}/${repo}`,
      owner: owner,
      repo: repo,
      defaultBranch: 'main', // Default assumption
      language: undefined,
      topics: undefined
    };
  }

  private async getFileStructure(repositoryUrl: string): Promise<FileStructure> {
    const { owner, repo } = this.parseRepositoryUrl(repositoryUrl);
    
    try {
      const files = await this.repoService.listFiles(owner, repo);
      
      return {
        totalFiles: files.length,
        directories: this.groupByDirectory(files),
        fileTypes: this.analyzeFileTypes(files),
        structure: files
      };
    } catch (error) {
      console.warn('Failed to get file structure from MCP, using fallback:', error);
      
      // Fallback: Return empty structure
      return {
        totalFiles: 0,
        directories: {},
        fileTypes: {},
        structure: []
      };
    }
  }

  private async determineRelevantFiles(
    userRequest: string,
    fileStructure: FileStructure,
    selectedFiles: string[]
  ): Promise<string[]> {
    // Simple heuristic-based file selection
    const relevantPatterns = this.extractRelevantPatterns(userRequest);
    const relevantFiles = new Set(selectedFiles);

    // Add files matching patterns
    fileStructure.structure.forEach(file => {
      if (this.isFileRelevant(file, relevantPatterns)) {
        relevantFiles.add(file.path);
      }
    });

    // Limit to top 15 most relevant files
    return Array.from(relevantFiles).slice(0, 15);
  }

  private async getFileContents(
    repositoryUrl: string, 
    filePaths: string[]
  ): Promise<FileContent[]> {
    const { owner, repo } = this.parseRepositoryUrl(repositoryUrl);
    
    try {
      const contents = await Promise.all(
        filePaths.map(async (path) => {
          try {
            const content = await this.repoService.getFileContent(owner, repo, path);
            return {
              path,
              content: content || '',
              type: this.getFileType(path),
              size: content?.length || 0
            };
          } catch (error) {
            console.warn(`Failed to fetch ${path}:`, error);
            return { path, content: '', type: 'unknown', size: 0 };
          }
        })
      );

      return contents.filter(f => f.content.length > 0);
    } catch (error) {
      console.warn('Failed to get file contents from MCP, using fallback:', error);
      
      // Fallback: Return empty content array
      return [];
    }
  }

  private assembleContext(
    repoInfo: RepositoryInfo,
    fileStructure: FileStructure,
    fileContents: FileContent[],
    userRequest: string
  ): RepositoryContext {
    return {
      repository: {
        name: repoInfo.name,
        description: repoInfo.description,
        structure: fileStructure,
        relevantFiles: fileContents
      },
      userRequest: {
        original: userRequest,
        intent: this.analyzeIntent(userRequest),
        diagramType: this.detectDiagramType(userRequest)
      },
      context: {
        fileCount: fileContents.length,
        totalSize: fileContents.reduce((sum, f) => sum + f.size, 0),
        fileTypes: this.getFileTypeDistribution(fileContents),
        relationships: this.buildBasicRelationships(fileContents)
      }
    };
  }

  // Helper methods
  private parseRepositoryUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    return { owner: match[1], repo: match[2] };
  }

  private groupByDirectory(files: MCPFileInfo[]): Record<string, MCPFileInfo[]> {
    const directories: Record<string, MCPFileInfo[]> = {};
    
    files.forEach(file => {
      const dir = file.path.split('/').slice(0, -1).join('/') || 'root';
      if (!directories[dir]) {
        directories[dir] = [];
      }
      directories[dir].push(file);
    });
    
    return directories;
  }

  private analyzeFileTypes(files: MCPFileInfo[]): Record<string, number> {
    const fileTypes: Record<string, number> = {};
    
    files.forEach(file => {
      if (file.type === 'file') {
        const type = this.getFileType(file.path);
        fileTypes[type] = (fileTypes[type] || 0) + 1;
      }
    });
    
    return fileTypes;
  }

  private extractRelevantPatterns(request: string): string[] {
    const patterns = [];
    const lowerRequest = request.toLowerCase();
    
    if (lowerRequest.includes('component')) patterns.push('component', 'ui', 'react');
    if (lowerRequest.includes('api')) patterns.push('api', 'route', 'endpoint');
    if (lowerRequest.includes('database')) patterns.push('database', 'model', 'schema');
    if (lowerRequest.includes('service')) patterns.push('service', 'util', 'helper');
    if (lowerRequest.includes('page')) patterns.push('page', 'view', 'screen');
    if (lowerRequest.includes('layout')) patterns.push('layout', 'template');
    if (lowerRequest.includes('config')) patterns.push('config', 'setting');
    if (lowerRequest.includes('test')) patterns.push('test', 'spec');
    
    return patterns;
  }

  private isFileRelevant(file: MCPFileInfo, patterns: string[]): boolean {
    if (file.type !== 'file') return false;
    
    const fileName = file.path.toLowerCase();
    return patterns.some(pattern => fileName.includes(pattern));
  }

  private getFileType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      'ts': 'typescript', 'tsx': 'typescript-react',
      'js': 'javascript', 'jsx': 'javascript-react',
      'json': 'json', 'md': 'markdown',
      'css': 'stylesheet', 'scss': 'stylesheet',
      'html': 'html', 'xml': 'xml',
      'yml': 'yaml', 'yaml': 'yaml',
      'txt': 'text', 'log': 'log'
    };
    return typeMap[ext || ''] || 'unknown';
  }

  private getFileTypeDistribution(files: FileContent[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    files.forEach(file => {
      distribution[file.type] = (distribution[file.type] || 0) + 1;
    });
    
    return distribution;
  }

  private buildBasicRelationships(files: FileContent[]): FileRelationship[] {
    const relationships: FileRelationship[] = [];
    
    // Simple import/export relationship detection
    files.forEach(file => {
      if (file.type.includes('typescript') || file.type.includes('javascript')) {
        const imports = this.extractImports(file.content);
        imports.forEach(importPath => {
          relationships.push({
            from: file.path,
            to: importPath,
            type: 'import'
          });
        });
      }
    });
    
    return relationships;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    
    // Match import statements
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private analyzeIntent(request: string): string {
    const lower = request.toLowerCase();
    if (lower.includes('architecture')) return 'architecture';
    if (lower.includes('flow')) return 'flow';
    if (lower.includes('sequence')) return 'sequence';
    if (lower.includes('database')) return 'database';
    if (lower.includes('component')) return 'component';
    if (lower.includes('dependency')) return 'dependency';
    return 'general';
  }

  private detectDiagramType(request: string): string {
    const lower = request.toLowerCase();
    if (lower.includes('sequence')) return 'sequenceDiagram';
    if (lower.includes('database')) return 'entityRelationshipDiagram';
    if (lower.includes('flow')) return 'flowchart';
    if (lower.includes('class')) return 'classDiagram';
    if (lower.includes('component')) return 'graph';
    if (lower.includes('architecture')) return 'graph';
    return 'graph';
  }
} 