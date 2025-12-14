# MCP (Model Context Protocol) Setup Guide

> **Comprehensive guide to configuring and using MCP servers for enhanced AI agent capabilities**

## Table of Contents

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [Available MCP Servers](#available-mcp-servers)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Security Best Practices](#security-best-practices)
- [Usage with AI Agents](#usage-with-ai-agents)
- [Common Scenarios](#common-scenarios)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Introduction

Model Context Protocol (MCP) is a standardized way for AI agents to access external tools and services. This template comes pre-configured with 11 production-ready MCP servers that enable your AI coding assistant to:

- **Read and write files** with the filesystem server
- **Make HTTP requests** to external APIs
- **Search the web** for real-time information
- **Interact with GitHub** repositories, issues, and PRs
- **Manage databases** (SQLite, PostgreSQL)
- **Automate browsers** with Puppeteer
- **Store persistent memory** across sessions
- **Integrate with cloud services** (AWS, Docker, Slack)

By enabling the appropriate servers, you dramatically enhance what AI agents can accomplish automatically.

## Quick Start

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Enable Default Servers

The following servers work out-of-the-box with no additional configuration:

- ✅ **Filesystem** - Already enabled
- ✅ **Fetch** - Already enabled

### Step 3: Add API Keys (Optional)

For advanced features, add API keys to your `.env` file:

```bash
# Web Search
BRAVE_API_KEY=your_api_key_here

# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here

# AWS Services
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Database
POSTGRES_URL=postgresql://user:pass@localhost:5432/mydb

# Slack Integration
SLACK_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your_secret
```

### Step 4: Enable Servers

Edit `mcp.json` and set `"enabled": true` for servers you want to use:

```json
{
  "mcpServers": {
    "search": {
      "enabled": true // Change from false to true
    }
  }
}
```

### Step 5: Restart Your AI Agent

After modifying `mcp.json`, restart your IDE or AI agent to load the new configuration.

## Available MCP Servers

### 1. Filesystem Server ✅ (Enabled by Default)

**Purpose**: Read, write, list, and search files in your project.

**Capabilities**:

- Read file contents
- Write new files or update existing ones
- List directory contents
- Search for files by name or pattern
- Get file metadata (size, modified date, etc.)

**Setup**: No configuration required. Already enabled and sandboxed to project directory.

**Security**: Operations are restricted to the current project directory for safety.

**Use Cases**:

- Reading configuration files
- Generating code files
- Analyzing project structure
- Searching for specific patterns

---

### 2. Fetch Server ✅ (Enabled by Default)

**Purpose**: Make HTTP/HTTPS requests to external APIs and websites.

**Capabilities**:

- GET, POST, PUT, DELETE, PATCH requests
- Custom headers and authentication
- Request/response body handling
- Timeout configuration
- Rate limiting

**Setup**: No configuration required. Already enabled with 30-second timeout.

**Security**: Rate-limited to prevent abuse. Respects robots.txt for web scraping.

**Use Cases**:

- Calling REST APIs
- Fetching data from external services
- Web scraping (with respect to terms of service)
- Testing API endpoints

**Example**:

```javascript
// AI agent can make requests like:
fetch('https://api.github.com/repos/user/repo')
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

### 3. SQLite Database Server (Disabled by Default)

**Purpose**: Local database operations with SQLite.

**Capabilities**:

- Execute SQL queries
- Create and modify schemas
- Transaction support
- Data persistence across sessions

**Setup**:

1. Enable in `mcp.json`: `"database-sqlite": { "enabled": true }`
2. Database file will be created at `./local.db` automatically

**Use Cases**:

- Storing application data
- Local caching
- Testing database operations
- Rapid prototyping with persistence

**Example Queries**:

```sql
-- Create table
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);

-- Insert data
INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');

-- Query data
SELECT * FROM users WHERE email LIKE '%@example.com';
```

---

### 4. PostgreSQL Database Server (Disabled by Default)

**Purpose**: Production-grade database operations with PostgreSQL.

**Capabilities**:

- All SQLite capabilities plus:
- Advanced SQL features
- Better performance for large datasets
- Concurrent connections
- Full ACID compliance

**Setup**:

1. Set `POSTGRES_URL` in `.env`:
   ```bash
   POSTGRES_URL=postgresql://username:password@localhost:5432/database_name
   ```
2. Enable in `mcp.json`: `"database-postgres": { "enabled": true }`

**Connection String Format**:

```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

**Use Cases**:

- Production applications
- Complex queries and relationships
- High-performance requirements
- Team collaboration with shared database

---

### 5. Brave Search Server (Disabled by Default)

**Purpose**: Real-time web search capabilities.

**Capabilities**:

- Web search with current results
- News search
- Image search
- Fact-checking and verification
- No tracking or data collection

**Setup**:

1. Get free API key from [Brave Search API](https://brave.com/search/api/)
   - Free tier: 2,000 queries/month
   - Paid plans available for higher usage
2. Add to `.env`: `BRAVE_API_KEY=your_api_key_here`
3. Enable in `mcp.json`: `"search": { "enabled": true }`

**Use Cases**:

- Finding current information
- Research and fact-checking
- Competitor analysis
- Content verification

**Example**:

```javascript
// AI can search for: "latest TypeScript features 2024"
// Returns relevant articles, documentation, and discussions
```

---

### 6. GitHub Server (Disabled by Default)

**Purpose**: Comprehensive GitHub API integration.

**Capabilities**:

- Repository operations (clone, create, delete)
- Issue management (create, comment, close)
- Pull request workflow (create, review, merge)
- Code search across repositories
- GitHub Actions management
- Release management

**Setup**:

1. Create Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`, `read:org`
   - Copy the generated token
2. Add to `.env`: `GITHUB_TOKEN=ghp_your_token_here`
3. Enable in `mcp.json`: `"github": { "enabled": true }`

**Security**: Use fine-grained tokens with minimal required permissions.

**Use Cases**:

- Automated issue triaging
- PR creation and review
- Repository analysis
- CI/CD integration
- Release automation

---

### 7. Memory Server (Disabled by Default)

**Purpose**: Persistent memory and context storage for AI agents.

**Capabilities**:

- Store information across sessions
- Retrieve historical context
- Search previous conversations
- Manage long-term context

**Setup**:

1. Enable in `mcp.json`: `"memory": { "enabled": true }`
2. Memory stored in `.mcp-memory/` directory (gitignored)

**Use Cases**:

- Remembering project decisions
- Maintaining context across sessions
- Learning from past interactions
- Building knowledge base

**Storage Format**: JSON-based, human-readable, searchable.

---

### 8. Puppeteer Server (Disabled by Default)

**Purpose**: Headless browser automation and testing.

**Capabilities**:

- Navigate websites
- Take screenshots
- Generate PDFs
- Fill forms and click buttons
- Extract data from dynamic pages
- Run end-to-end tests

**Setup**:

1. Enable in `mcp.json`: `"puppeteer": { "enabled": true }`
2. Chrome will be downloaded automatically on first use (~150MB)

**System Requirements**:

- Node.js 18+
- ~500MB disk space (including Chrome)
- Linux/macOS/Windows supported

**Use Cases**:

- E2E testing
- Web scraping dynamic sites
- Generating PDFs from HTML
- Taking screenshots for documentation
- Automated form filling

**Example**:

```javascript
// Navigate to page, take screenshot
await page.goto('https://example.com');
await page.screenshot({ path: 'screenshot.png' });
```

---

### 9. AWS Server (Disabled by Default)

**Purpose**: Amazon Web Services integration.

**Capabilities**:

- S3: File storage and retrieval
- Lambda: Serverless function management
- DynamoDB: NoSQL database operations
- CloudWatch: Logging and monitoring

**Setup**:

1. Configure AWS credentials in `.env`:
   ```bash
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_REGION=us-east-1
   ```
2. Enable in `mcp.json`: `"aws": { "enabled": true }`

**Alternative**: Use AWS CLI credentials (`~/.aws/credentials`)

**Security**: Use IAM roles with least-privilege permissions.

**Use Cases**:

- Deploying serverless functions
- Managing S3 buckets
- Querying DynamoDB tables
- Analyzing CloudWatch logs

---

### 10. Docker Server (Disabled by Default)

**Purpose**: Container management and orchestration.

**Capabilities**:

- Start/stop containers
- Build images
- Manage volumes and networks
- View container logs
- Execute commands in containers

**Setup**:

1. Install Docker Desktop or Docker Engine
2. Start Docker daemon
3. Enable in `mcp.json`: `"docker": { "enabled": true }`

**System Requirements**:

- Docker 20.10+
- Appropriate OS permissions

**Use Cases**:

- Local development environments
- Testing in containers
- Managing microservices
- Database containers

---

### 11. Slack Server (Disabled by Default)

**Purpose**: Slack workspace integration.

**Capabilities**:

- Send messages
- Create and manage channels
- User management
- File uploads
- Notifications and alerts

**Setup**:

1. Create Slack app at https://api.slack.com/apps
2. Add bot token scopes: `chat:write`, `channels:read`, `users:read`
3. Install app to workspace
4. Add to `.env`:
   ```bash
   SLACK_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   ```
5. Enable in `mcp.json`: `"slack": { "enabled": true }`

**Use Cases**:

- Deployment notifications
- Error alerting
- Team communication automation
- Status updates

## Configuration

### Basic Configuration

MCP servers are configured in the `mcp.json` file at the project root:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-name"],
      "description": "What this server does",
      "enabled": false,
      "env": {
        "API_KEY": "${API_KEY}"
      },
      "notes": "Additional setup information"
    }
  }
}
```

### Configuration Options

| Option         | Type    | Required | Description                        |
| -------------- | ------- | -------- | ---------------------------------- |
| `command`      | string  | Yes      | Executable command (usually `npx`) |
| `args`         | array   | Yes      | Command arguments                  |
| `description`  | string  | No       | Human-readable description         |
| `enabled`      | boolean | Yes      | Whether server is active           |
| `env`          | object  | No       | Environment variables              |
| `notes`        | string  | No       | Setup instructions                 |
| `capabilities` | array   | No       | List of features                   |
| `security`     | object  | No       | Security configurations            |

### Environment Variable Substitution

Use `${VAR_NAME}` syntax in `env` fields to reference environment variables:

```json
"env": {
  "API_KEY": "${MY_API_KEY}",
  "REGION": "${AWS_REGION}"
}
```

Variables are resolved from:

1. `.env` file (recommended)
2. System environment variables
3. Shell environment

## Environment Variables

### Creating .env File

Create a `.env` file in the project root:

```bash
# Copy from template
cp .env.example .env

# Edit with your editor
nano .env  # or vim, code, etc.
```

### All Available Variables

```bash
# Application Configuration
NODE_ENV=development
DEBUG=true

# MCP Server: Brave Search
BRAVE_API_KEY=your_brave_api_key_here

# MCP Server: GitHub
GITHUB_TOKEN=ghp_your_github_personal_access_token

# MCP Server: PostgreSQL
POSTGRES_URL=postgresql://user:password@localhost:5432/database

# MCP Server: AWS
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# MCP Server: Slack
SLACK_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret

# Optional: Custom Configuration
API_TIMEOUT=30000
LOG_LEVEL=info
```

### Getting API Keys

| Service      | Where to Get                        | Free Tier                |
| ------------ | ----------------------------------- | ------------------------ |
| Brave Search | https://brave.com/search/api/       | 2,000 queries/month      |
| GitHub       | https://github.com/settings/tokens  | Unlimited (rate-limited) |
| AWS          | https://console.aws.amazon.com/iam/ | 12 months free tier      |
| Slack        | https://api.slack.com/apps          | Unlimited                |

## Security Best Practices

### 1. Never Commit Secrets

**Always keep `.env` in `.gitignore`:**

```gitignore
# Environment files
.env
.env.local
.env.*.local
```

**Check before committing:**

```bash
git status
# Ensure .env is not listed
```

### 2. Use Minimal Permissions

For API tokens, only grant necessary permissions:

- **GitHub**: `repo` scope only (not `admin:org` unless needed)
- **AWS**: Create IAM user with specific service permissions
- **Slack**: Minimum bot token scopes required

### 3. Rotate Keys Regularly

- Change API keys every 90 days
- Revoke old keys immediately after rotation
- Use different keys for development and production

### 4. Use Environment-Specific Keys

```bash
# Development
.env.development

# Production
.env.production

# Testing
.env.test
```

### 5. Enable Server Sandboxing

Filesystem server is sandboxed by default:

```json
"security": {
  "sandboxed": true,
  "allowedPaths": ["./"]
}
```

### 6. Monitor Usage

- Review API usage regularly
- Set up alerts for unusual patterns
- Use read-only tokens where possible

## Usage with AI Agents

### Cursor IDE

**Setup**:

1. Cursor automatically detects `mcp.json` in project root
2. No additional configuration needed
3. MCP servers available in AI context

**Verification**:

- Open Cursor settings
- Check "MCP" section
- Verify servers are loaded

### GitHub Copilot

**Setup**:

1. MCP configuration in `.github/copilot-instructions.md`
2. Servers available through Copilot Chat
3. Use `@workspace` to access MCP tools

**Example**:

```
@workspace search the web for latest TypeScript features
```

### Windsurf IDE

**Setup**:

1. Configuration in `.windsurfrules`
2. Similar to Cursor setup
3. Auto-detection of `mcp.json`

### Aider

**Setup**:

1. Configuration in `.aider.conf.yml`
2. MCP support through command line
3. Use `--mcp-config` flag

### Claude Desktop

**Setup**:

1. Open Claude Desktop settings
2. Add path to your project's `mcp.json`
3. Restart Claude Desktop

**macOS**:

```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows**:

```
%APPDATA%\Claude\claude_desktop_config.json
```

Add:

```json
{
  "mcpServers": {
    "project-name": {
      "command": "npx",
      "args": ["-y", "mcp-client", "/path/to/project/mcp.json"]
    }
  }
}
```

## Common Scenarios

### Scenario 1: Web Development with API Integration

**Enabled Servers**:

- ✅ Filesystem (read/write code)
- ✅ Fetch (call external APIs)
- ✅ GitHub (manage repository)

**Configuration**:

```json
{
  "mcpServers": {
    "filesystem": { "enabled": true },
    "fetch": { "enabled": true },
    "github": { "enabled": true }
  }
}
```

### Scenario 2: Data Analysis Project

**Enabled Servers**:

- ✅ Filesystem (read data files)
- ✅ PostgreSQL (query database)
- ✅ Puppeteer (scrape websites)

**Setup**:

```bash
# .env
POSTGRES_URL=postgresql://localhost:5432/analytics
```

### Scenario 3: DevOps Automation

**Enabled Servers**:

- ✅ GitHub (manage repos)
- ✅ Docker (container management)
- ✅ AWS (cloud deployment)
- ✅ Slack (notifications)

**Use Case**: Automated deployment pipeline with notifications.

### Scenario 4: Content Research

**Enabled Servers**:

- ✅ Brave Search (web research)
- ✅ Fetch (API calls)
- ✅ Memory (remember findings)
- ✅ Filesystem (save results)

**Use Case**: Research topic, save findings, build knowledge base.

## Troubleshooting

### Server Not Loading

**Problem**: MCP server doesn't appear in AI agent.

**Solutions**:

1. Check `enabled: true` in `mcp.json`
2. Restart your IDE/AI agent
3. Verify JSON syntax (no trailing commas)
4. Check console for error messages

### Authentication Errors

**Problem**: API key not working.

**Solutions**:

1. Verify key is correct in `.env`
2. Check key hasn't expired
3. Confirm sufficient permissions
4. Test key manually with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" https://api.example.com/test
   ```

### Rate Limiting

**Problem**: Too many requests error.

**Solutions**:

1. Implement request throttling
2. Upgrade to higher API tier
3. Cache responses when possible
4. Add delays between requests

### Connection Timeouts

**Problem**: Requests timing out.

**Solutions**:

1. Increase timeout in configuration:
   ```json
   "security": { "timeout": 60000 }
   ```
2. Check network connectivity
3. Verify service is available
4. Use async operations

### Permission Denied

**Problem**: Can't access files/services.

**Solutions**:

1. Check file permissions: `ls -la`
2. Verify API key scopes
3. Review security sandbox settings
4. Run with appropriate user permissions

### Package Not Found

**Problem**: `npx` can't find MCP server.

**Solutions**:

1. Check package name spelling
2. Verify npm registry is accessible
3. Clear npx cache: `npx clear-npx-cache`
4. Install globally: `npm install -g @modelcontextprotocol/server-name`

## Advanced Configuration

### Custom Server

Create your own MCP server:

```json
{
  "mcpServers": {
    "my-custom-server": {
      "command": "node",
      "args": ["./scripts/my-mcp-server.js"],
      "description": "My custom MCP server",
      "enabled": true
    }
  }
}
```

### Multiple Environments

Use different configs per environment:

```bash
# Development
mcp.dev.json

# Production
mcp.prod.json

# Testing
mcp.test.json
```

### Performance Optimization

```json
{
  "mcpServers": {
    "fetch": {
      "security": {
        "timeout": 10000,
        "maxConcurrent": 5,
        "rateLimit": {
          "requests": 100,
          "window": 60000
        }
      }
    }
  }
}
```

### Logging Configuration

Enable detailed logging:

```json
{
  "mcpServers": {
    "filesystem": {
      "logging": {
        "level": "debug",
        "file": ".mcp-logs/filesystem.log"
      }
    }
  }
}
```

## Resources

- **MCP Specification**: https://modelcontextprotocol.io/specification
- **Available Servers**: https://github.com/modelcontextprotocol/servers
- **Community Servers**: https://github.com/topics/mcp-server
- **Documentation**: https://modelcontextprotocol.io/docs

## Support

If you encounter issues:

1. Check this guide first
2. Review MCP server documentation
3. Check GitHub issues
4. Join community Discord
5. Open issue in this repository

---

**Last Updated**: December 2024  
**MCP Version**: 1.0  
**Template Version**: 1.0.0
