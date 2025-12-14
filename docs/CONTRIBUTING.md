# Contributing to Default Starter Template

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

### Our Pledge

We pledge to make participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**

- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **pnpm** 9+ (or npm/bun)
- **Git** 2.28+
- Code editor (VS Code, Cursor, or similar)

### Initial Setup

```bash
# 1. Fork the repository
# Click "Fork" button on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Default-Starter-Template-Repository.git
cd Default-Starter-Template-Repository

# 3. Add upstream remote
git remote add upstream https://github.com/digitalsorc/Default-Starter-Template-Repository.git

# 4. Install dependencies
pnpm install

# 5. Verify setup
pnpm run validate
```

### Stay Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Update your main branch
git checkout main
git merge upstream/main

# Push updates to your fork
git push origin main
```

## Development Workflow

### 1. Create a Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test improvements
- `chore/description` - Build/tooling changes

### 2. Make Your Changes

```typescript
// Follow existing code patterns
export function newFeature(input: string): string {
  // Validate input
  if (!input) {
    throw new ValidationError('Input is required');
  }

  // Process and return
  return `Processed: ${input}`;
}
```

### 3. Add Tests

```typescript
// tests/new-feature.test.ts
import { describe, it, expect } from 'vitest';
import { newFeature } from '../src/utils/new-feature';

describe('newFeature', () => {
  it('should process input correctly', () => {
    const result = newFeature('test');
    expect(result).toBe('Processed: test');
  });

  it('should throw when input is empty', () => {
    expect(() => newFeature('')).toThrow(ValidationError);
  });
});
```

### 4. Run Quality Checks

```bash
# Type check
pnpm run typecheck

# Lint and auto-fix
pnpm run lint:fix

# Format code
pnpm run format

# Run tests
pnpm run test

# Or run all checks
pnpm run validate
```

### 5. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new feature description"

# Push to your fork
git push origin feature/your-feature-name
```

## Coding Standards

### TypeScript

```typescript
// ✅ GOOD: Explicit types, validation, documentation
/**
 * Processes user data and returns result
 * @param userId - User identifier
 * @returns Processed user data
 * @throws {NotFoundError} When user doesn't exist
 */
export async function processUser(userId: string): Promise<UserResult> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await fetchUser(userId);
  if (!user) {
    throw new NotFoundError('User', userId);
  }

  return transformUser(user);
}

// ❌ BAD: any types, no validation, no documentation
export async function processUser(userId: any) {
  const user = await fetchUser(userId);
  return transformUser(user);
}
```

### Error Handling

```typescript
// ✅ GOOD: Specific error types, context
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  if (error instanceof NetworkError) {
    throw new ServiceUnavailableError('Service unavailable', error);
  }
  throw new InternalServerError('Operation failed', error as Error);
}

// ❌ BAD: Generic catch, no context
try {
  return await riskyOperation();
} catch (error) {
  throw new Error('Error occurred');
}
```

### Naming Conventions

| Type       | Convention       | Example           |
| ---------- | ---------------- | ----------------- |
| Files      | kebab-case       | `user-service.ts` |
| Classes    | PascalCase       | `UserService`     |
| Functions  | camelCase        | `getUserById`     |
| Constants  | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Interfaces | PascalCase       | `UserData`        |
| Types      | PascalCase       | `ApiResponse`     |

### Import Organization

```typescript
// 1. Node.js built-ins
import { readFile } from 'fs/promises';

// 2. External packages
import express from 'express';
import { z } from 'zod';

// 3. Internal modules
import { UserService } from './services/user-service';
import { logger } from './utils/logger';

// 4. Type imports
import type { Config } from './types/config';

// 5. Constants
import { DEFAULT_CONFIG } from './config/default';
```

## Testing Guidelines

### Test Structure

```typescript
describe('ComponentName', () => {
  let service: ServiceName;
  let mockDep: MockDependency;

  beforeEach(() => {
    // Arrange: Setup
    mockDep = createMockDependency();
    service = new ServiceName(mockDep);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('methodName', () => {
    it('should handle success case', () => {
      // Arrange
      const input = 'test';
      const expected = 'result';

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle error case', () => {
      // Arrange & Act & Assert
      expect(() => service.methodName('')).toThrow(ValidationError);
    });
  });
});
```

### Test Coverage

- **Minimum**: 70% overall
- **Critical paths**: 90%+
- **Edge cases**: Always test
- **Error paths**: Always test

### Running Tests

```bash
# Run all tests
pnpm run test

# Watch mode
pnpm run test:watch

# With coverage
pnpm run test:coverage

# Specific test file
pnpm run test -- user-service.test.ts
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, semicolons)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Build/tooling changes
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(auth): add JWT authentication"

# Bug fix
git commit -m "fix(api): resolve null pointer in user endpoint"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api): change response format

BREAKING CHANGE: API responses now return camelCase instead of snake_case"
```

### Commit Message Rules

- Use imperative mood ("add" not "added")
- First line: ≤50 characters
- Body: Wrap at 72 characters
- Reference issues: "Closes #123"
- Explain WHY, not WHAT

## Pull Request Process

### Before Submitting

- [ ] All tests pass: `pnpm run test`
- [ ] Code is linted: `pnpm run lint`
- [ ] Types check: `pnpm run typecheck`
- [ ] Build succeeds: `pnpm run build`
- [ ] Documentation updated
- [ ] Tests added for new features
- [ ] Commits follow conventional commits

### Submitting PR

1. **Push your branch** to your fork
2. **Open Pull Request** on GitHub
3. **Fill out PR template** completely
4. **Link related issues** (Closes #123)
5. **Wait for CI** checks to pass
6. **Respond to feedback** promptly

### PR Title Format

Follow conventional commits format:

```
feat(scope): add new feature
fix(scope): resolve issue with X
docs: update contributing guide
```

### PR Description

Use the template, include:

- Summary of changes
- Motivation and context
- Breaking changes (if any)
- Screenshots (if UI changes)
- Testing performed

### Review Process

- All PRs require at least 1 approval
- CI checks must pass
- No merge conflicts
- Branch must be up to date

### After Approval

```bash
# Rebase on latest main
git fetch upstream
git rebase upstream/main

# Resolve any conflicts
git add .
git rebase --continue

# Force push to update PR
git push origin feature/your-feature --force
```

## Issue Guidelines

### Before Creating Issue

- Search existing issues
- Check documentation
- Try latest version
- Reproduce bug (if applicable)

### Bug Reports

Include:

- Clear title
- Description of bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
  - Node version
  - OS
  - Package manager
- Error logs/screenshots

### Feature Requests

Include:

- Clear title
- Use case description
- Proposed solution
- Alternative solutions
- Examples
- Willingness to contribute

### Good vs Bad Issues

**Good:**

> **Title**: Button click throws TypeError in user profile
>
> **Description**: When clicking the "Save" button on the user profile page, a TypeError is thrown. This happens only when the email field is empty.
>
> **Steps to reproduce**:
>
> 1. Navigate to /profile
> 2. Clear email field
> 3. Click "Save"
> 4. See error in console
>
> **Expected**: Validation error message
> **Actual**: TypeError: Cannot read property 'value' of null
>
> **Environment**: Node 20.10, macOS, pnpm 9.0

**Bad:**

> **Title**: it doesn't work
>
> **Description**: button is broken

## Project Structure

When adding new code, follow this structure:

```
src/
├── config/       # Configuration management
├── services/     # Business logic
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
└── index.ts      # Main entry point

tests/
├── unit/         # Unit tests
├── integration/  # Integration tests
└── fixtures/     # Test data
```

## Need Help?

- **Documentation**: Check `/docs` directory
- **Discussions**: Use GitHub Discussions
- **Issues**: Create an issue
- **Discord**: Join our community (if available)

## Recognition

Contributors are recognized in:

- CHANGELOG.md
- GitHub contributors page
- Release notes (for significant contributions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉

Every contribution, no matter how small, is valuable and appreciated.
