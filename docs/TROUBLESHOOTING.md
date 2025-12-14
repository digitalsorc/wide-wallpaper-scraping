# Troubleshooting Guide

Common issues and solutions for the Default Starter Template.

## Installation Issues

### pnpm Not Found

**Problem:** `pnpm: command not found`

**Solution:**

```bash
# Install pnpm globally
npm install -g pnpm

# Or use Corepack (Node 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

### Dependency Installation Fails

**Problem:** `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`

**Solution:**

```bash
# Update lockfile
pnpm install --no-frozen-lockfile

# Or remove and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Peer Dependency Warnings

**Problem:** Unmet peer dependency warnings

**Solution:**

```bash
# Install missing peer dependencies
pnpm add <missing-package>

# Or use --force (not recommended)
pnpm install --force
```

## Build Issues

### TypeScript Errors

**Problem:** Type checking fails

**Solution:**

```bash
# Check specific file
npx tsc src/problem-file.ts --noEmit

# Check all files
pnpm run typecheck

# View detailed errors
pnpm run typecheck --pretty false
```

### Path Alias Not Resolved

**Problem:** `Cannot find module '@/...'`

**Solution:**

```typescript
// Verify tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Build Output Missing

**Problem:** `dist/` folder is empty or missing files

**Solution:**

```bash
# Clean and rebuild
pnpm run clean
pnpm run build

# Check tsconfig include/exclude
cat tsconfig.json | grep -A 5 "include"
```

## Runtime Issues

### Module Not Found

**Problem:** `Error: Cannot find module './dist/index.js'`

**Solution:**

```bash
# Ensure build was successful
ls -la dist/

# Rebuild if necessary
pnpm run build

# Check package.json main field
cat package.json | grep "main"
```

### Environment Variables Not Loaded

**Problem:** `process.env.VARIABLE` is undefined

**Solution:**

```bash
# 1. Check .env file exists
ls -la .env

# 2. Verify .env format
# KEY=value (no spaces around =)
# No quotes needed for simple values

# 3. For Node.js apps, use dotenv
npm install dotenv
# Then in your code:
# import 'dotenv/config';
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use`

**Solution:**

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm run dev
```

## Test Issues

### Tests Failing

**Problem:** Tests that previously passed now fail

**Solution:**

```bash
# Clear test cache
pnpm run test -- --clearCache

# Run specific test
pnpm run test -- user.test.ts

# Run in debug mode
pnpm run test -- --reporter=verbose
```

### Coverage Not Generated

**Problem:** Coverage report is empty

**Solution:**

```bash
# Check vitest.config.ts
# Ensure coverage provider is configured

# Clean and regenerate
rm -rf coverage/
pnpm run test:coverage
```

### Mock Not Working

**Problem:** Mocks not being applied

**Solution:**

```typescript
// Ensure mock is defined before import
vi.mock('./module', () => ({
  default: vi.fn(),
}));

// Import after mock
import { Component } from './component';

// Clear mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
```

## Linting Issues

### Biome Check Fails

**Problem:** Linting errors

**Solution:**

```bash
# Auto-fix safe issues
pnpm run lint:fix

# Apply unsafe fixes
pnpm run lint:fix -- --unsafe

# Disable specific rule
// biome-ignore lint/rule-name: reason
const code = problematicCode();
```

### Prettier Conflicts with Biome

**Problem:** Conflicting formatting

**Solution:**

```bash
# Run in correct order
pnpm run lint:fix
pnpm run format

# Or use validate script
pnpm run validate
```

## MCP Server Issues

### MCP Server Not Loading

**Problem:** AI agent doesn't see MCP servers

**Solution:**

1. Check `mcp.json` syntax (valid JSON)
2. Verify `"enabled": true` for the server
3. Restart your IDE/AI agent
4. Check server command is correct

### MCP Server Authentication Fails

**Problem:** API key errors

**Solution:**

```bash
# 1. Check .env file
cat .env | grep API_KEY

# 2. Verify key is valid
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/test

# 3. Check environment variable substitution
# In mcp.json: "${VARIABLE_NAME}"
```

### MCP Server Timeout

**Problem:** Server operations hang

**Solution:**

```json
// Add timeout in mcp.json
{
  "security": {
    "timeout": 30000
  }
}
```

## Git Issues

### Husky Hooks Not Running

**Problem:** Pre-commit hooks don't run

**Solution:**

```bash
# Reinstall husky
rm -rf .husky
pnpm run prepare

# Verify hooks are executable
ls -la .husky/pre-commit

# Make executable if needed
chmod +x .husky/pre-commit
```

### Large Files Accidentally Committed

**Problem:** Node modules or build artifacts committed

**Solution:**

```bash
# Remove from git (keep locally)
git rm --cached -r node_modules/
git rm --cached -r dist/

# Update .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore

# Commit changes
git commit -m "chore: remove ignored files"
```

## Performance Issues

### Slow TypeScript Compilation

**Problem:** `tsc` takes too long

**Solution:**

```json
// Enable incremental compilation in tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

### Slow Test Execution

**Problem:** Tests take too long to run

**Solution:**

```typescript
// Run tests in parallel (Vitest does this by default)
// Reduce test timeout if applicable
test(
  'something',
  async () => {
    // ...
  },
  { timeout: 5000 }
);

// Use test.concurrent for independent tests
test.concurrent('test 1', async () => {});
test.concurrent('test 2', async () => {});
```

### High Memory Usage

**Problem:** Node process uses too much memory

**Solution:**

```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm run build

# Or in package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' tsc"
  }
}
```

## Security Issues

### Audit Vulnerabilities

**Problem:** `pnpm audit` shows vulnerabilities

**Solution:**

```bash
# Try automatic fix
pnpm audit fix

# Update specific package
pnpm update <package-name>@latest

# Check if vulnerability is in dev dependencies
pnpm audit --prod

# For unfixable vulnerabilities, assess risk
pnpm audit --json > audit-report.json
```

### Secret Accidentally Committed

**Problem:** Committed API key or secret

**Solution:**

```bash
# 1. Rotate/invalidate the secret immediately!

# 2. Remove from git history
# Install BFG Repo-Cleaner or git-filter-repo
git filter-repo --invert-paths --path .env

# 3. Force push (coordinate with team)
git push --force
```

## Platform-Specific Issues

### Windows Line Endings

**Problem:** `CRLF` vs `LF` issues

**Solution:**

```bash
# Configure git
git config --global core.autocrlf false

# Or use .gitattributes
echo "* text=auto eol=lf" > .gitattributes

# Convert existing files
dos2unix src/**/*.ts
```

### macOS Permission Denied

**Problem:** `EACCES` errors

**Solution:**

```bash
# Don't use sudo with npm/pnpm!
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to PATH
export PATH=~/.npm-global/bin:$PATH
```

## Getting Help

If you can't find a solution:

1. **Search Issues**: Check [GitHub Issues](https://github.com/digitalsorc/Default-Starter-Template-Repository/issues)
2. **Create Issue**: Use bug report template
3. **Ask Community**: GitHub Discussions
4. **Check Documentation**: Review all `/docs` files

### Creating a Good Bug Report

Include:

- **Problem description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Environment details**:
  ```bash
  node --version
  pnpm --version
  cat package.json | grep version
  echo $NODE_ENV
  ```
- **Error logs**
- **Screenshots** (if applicable)

## Common Error Messages

### `MODULE_NOT_FOUND`

→ Run `pnpm install` or check import path

### `ENOENT: no such file or directory`

→ File doesn't exist, check path

### `Cannot read property of undefined`

→ Variable is undefined, add null check

### `EADDRINUSE`

→ Port already in use, kill process or use different port

### `Permission denied`

→ Check file permissions, don't use sudo with npm/pnpm

### `Invalid or unexpected token`

→ Syntax error in code, check for typos

---

**Still having issues?** Create an issue with full details!
