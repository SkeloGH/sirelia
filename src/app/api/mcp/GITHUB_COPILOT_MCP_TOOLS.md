# GitHub Copilot MCP Tools Reference

This document provides a comprehensive reference for all 47 tools available through the GitHub Copilot MCP (Model Context Protocol) server integration.

## 📊 Overview

- **Total Tools**: 47
- **Categories**: 8 main functional areas
- **Integration**: Model Context Protocol (MCP) server
- **Authentication**: GitHub OAuth token required

## 🔧 Tool Categories

### 📁 Repository Operations (5 tools)
Core repository file and version control operations.

| Tool | Description | Use Case |
|------|-------------|----------|
| `get_file_contents` | Get file or directory contents from a repository | Reading source code, documentation, or configuration files |
| `list_branches` | List all branches in a repository | Understanding repository structure and available versions |
| `list_commits` | Get list of commits with metadata | Analyzing commit history and changes over time |
| `get_commit` | Get detailed information about a specific commit | Understanding specific changes and their context |
| `list_tags` | List git tags in a repository | Finding release versions and important milestones |

### 🔍 Search Operations (4 tools)
Powerful search capabilities across GitHub's ecosystem.

| Tool | Description | Use Case |
|------|-------------|----------|
| `search_code` | Search for code across GitHub repositories | Finding specific code patterns, functions, or implementations |
| `search_repositories` | Search for GitHub repositories | Discovering relevant projects and codebases |
| `search_issues` | Search for issues in GitHub repositories | Finding bug reports, feature requests, and discussions |
| `search_users` | Search for GitHub users | Finding contributors, maintainers, and collaborators |

### 📋 Repository Management (6 tools)
Repository creation, modification, and file management.

| Tool | Description | Use Case |
|------|-------------|----------|
| `create_repository` | Create a new GitHub repository | Setting up new projects and codebases |
| `fork_repository` | Fork a GitHub repository | Creating personal copies for contribution or experimentation |
| `create_branch` | Create a new branch in a repository | Setting up feature branches for development |
| `create_or_update_file` | Create or update a single file | Making targeted changes to specific files |
| `delete_file` | Delete a file from a repository | Removing obsolete or unnecessary files |
| `push_files` | Push multiple files to a repository | Batch operations for multiple file changes |

### 🎫 Issue Management (5 tools)
Comprehensive issue tracking and management.

| Tool | Description | Use Case |
|------|-------------|----------|
| `create_issue` | Create a new issue | Reporting bugs, requesting features, or starting discussions |
| `get_issue` | Get issue details | Retrieving complete issue information and status |
| `get_issue_comments` | Get comments for an issue | Understanding discussion and progress on issues |
| `add_issue_comment` | Add a comment to an issue | Contributing to discussions and providing updates |
| `update_issue` | Edit an existing issue | Updating issue details, labels, or status |

### 🔄 Pull Request Operations (10 tools)
Complete pull request lifecycle management.

| Tool | Description | Use Case |
|------|-------------|----------|
| `create_pull_request` | Create a new pull request | Submitting code changes for review and integration |
| `get_pull_request` | Get pull request details | Understanding PR scope, changes, and status |
| `get_pull_request_comments` | Get comments for a pull request | Reviewing feedback and discussions |
| `get_pull_request_diff` | Get the diff of a pull request | Analyzing code changes and differences |
| `get_pull_request_files` | Get files changed in a pull request | Understanding the scope of changes |
| `get_pull_request_reviews` | Get reviews for a pull request | Tracking review status and feedback |
| `get_pull_request_status` | Get pull request status checks | Monitoring CI/CD pipeline status |
| `update_pull_request` | Edit an existing pull request | Updating PR description, title, or labels |
| `update_pull_request_branch` | Update pull request branch | Syncing with base branch or resolving conflicts |
| `merge_pull_request` | Merge a pull request | Completing the code review and integration process |

### 👀 Pull Request Reviews (5 tools)
Detailed review workflow management.

| Tool | Description | Use Case |
|------|-------------|----------|
| `create_pending_pull_request_review` | Create a pending review | Starting a review session |
| `add_pull_request_review_comment_to_pending_review` | Add comment to pending review | Providing specific feedback on code |
| `create_and_submit_pull_request_review` | Create and submit a review | Completing a review in one operation |
| `delete_pending_pull_request_review` | Delete a pending review | Canceling an incomplete review |
| `submit_pending_pull_request_review` | Submit a pending review | Finalizing and submitting review comments |

### 🤖 Copilot Integration (2 tools)
AI-powered assistance for development workflows.

| Tool | Description | Use Case |
|------|-------------|----------|
| `assign_copilot_to_issue` | Assign Copilot to an issue | Getting AI assistance for issue resolution |
| `request_copilot_review` | Request Copilot review for a pull request | Getting AI-powered code review and suggestions |

### 🔔 Notifications (6 tools)
Comprehensive notification management system.

| Tool | Description | Use Case |
|------|-------------|----------|
| `list_notifications` | List GitHub notifications | Managing incoming activity and updates |
| `get_notification_details` | Get notification details | Understanding specific notification context |
| `dismiss_notification` | Dismiss a notification | Marking notifications as handled |
| `manage_notification_subscription` | Manage notification subscription | Controlling notification preferences |
| `manage_repository_notification_subscription` | Manage repository notifications | Setting repository-specific notification rules |
| `mark_all_notifications_read` | Mark all notifications as read | Bulk notification management |

### 🔒 Security & Scanning (4 tools)
Security analysis and vulnerability management.

| Tool | Description | Use Case |
|------|-------------|----------|
| `get_code_scanning_alert` | Get code scanning alert details | Investigating security vulnerabilities |
| `list_code_scanning_alerts` | List code scanning alerts | Monitoring security issues across repositories |
| `get_secret_scanning_alert` | Get secret scanning alert details | Investigating exposed secrets and credentials |
| `list_secret_scanning_alerts` | List secret scanning alerts | Monitoring for exposed sensitive information |

### 👤 User Management (1 tool)
User profile and authentication management.

| Tool | Description | Use Case |
|------|-------------|----------|
| `get_me` | Get authenticated user profile | Retrieving current user information and permissions |

### 🏷️ Tag Management (1 tool)
Git tag operations and management.

| Tool | Description | Use Case |
|------|-------------|----------|
| `get_tag` | Get details about a specific git tag | Understanding release information and metadata |

## 🚀 Usage Examples

### Basic Repository Analysis
```typescript
// Get repository structure
const branches = await mcpClient.callTool('list_branches', { repository: 'owner/repo' });
const mainBranch = await mcpClient.callTool('get_file_contents', { 
  repository: 'owner/repo', 
  path: 'README.md' 
});
```

### Code Search and Discovery
```typescript
// Find specific code patterns
const searchResults = await mcpClient.callTool('search_code', {
  query: 'function generateMermaidDiagram',
  repository: 'owner/repo'
});
```

### Issue and PR Management
```typescript
// Create and manage issues
const issue = await mcpClient.callTool('create_issue', {
  repository: 'owner/repo',
  title: 'Add Mermaid diagram generation',
  body: 'Implement AI-powered diagram generation from codebase analysis'
});

// Get PR details for review
const prDetails = await mcpClient.callTool('get_pull_request', {
  repository: 'owner/repo',
  pull_number: 123
});
```

## 🔧 Integration Notes

- **Authentication**: Requires valid GitHub OAuth token
- **Rate Limits**: Subject to GitHub API rate limiting
- **Permissions**: Tool availability depends on repository access and user permissions
- **Error Handling**: Implement proper error handling for network issues and API limits
- **Caching**: Consider caching frequently accessed data to improve performance

## 📚 Related Documentation

- [MCP Setup Guide](../MCP_SETUP.md)
- [Repository Context Builder](../services/context/RepositoryContextBuilder.ts)
- [GitHub MCP Client](../services/mcp/github-mcp-client.ts)
- [Contribution Guidelines](../../../CONTRIBUTING.md)