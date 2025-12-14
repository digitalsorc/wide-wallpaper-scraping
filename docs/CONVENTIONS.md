# Development Conventions and Patterns

This document outlines the coding conventions, patterns, and best practices for this project.

## Code Style

### TypeScript

- Use TypeScript strict mode for all code
- Provide explicit return types for all exported functions
- Use `const` over `let` when possible
- Avoid `var` completely
- Use `unknown` instead of `any` for truly unknown types
- Handle all `undefined` and `null` cases explicitly

### Naming Conventions

- **Files**: kebab-case (e.g., `user-service.ts`)
- **Variables/Functions**: camelCase (e.g., `getUserData`)
- **Classes/Types/Interfaces**: PascalCase (e.g., `UserService`, `UserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Test Files**: `*.test.ts` suffix

### Import Organization

Organize imports in the following order:

1. External packages (node_modules)
2. Internal modules (relative imports)
3. Type imports
4. Constants and configuration

Example:

```typescript
import { readFile } from 'fs/promises';
import { parseData } from './utils/parser';
import type { UserData } from './types';
import { DEFAULT_CONFIG } from './config';
```

## Architecture Patterns

### Module Structure

- Keep modules loosely coupled
- One primary export per file when possible
- Prefer named exports over default exports
- Keep files focused and under 300 lines
- Organize code by feature/domain

### Error Handling

- Create custom error classes for domain errors
- Always use try-catch with async/await
- Provide meaningful error messages
- Include context in error objects
- Don't swallow errors silently

Example:

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

try {
  await processData(input);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed for ${error.field}: ${error.message}`);
  }
  throw error;
}
```

### Async Operations

- Use async/await over raw promises
- Handle concurrent operations with `Promise.all()`
- Implement timeouts for network operations
- Consider retry logic for flaky operations

Example:

```typescript
async function fetchMultiple(ids: string[]): Promise<Result[]> {
  const promises = ids.map((id) => fetchSingle(id));
  return Promise.all(promises);
}
```

### Type Guards

Use type guards for runtime type checking:

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string'
  );
}
```

## Testing Patterns

### Test Structure

Follow the AAA (Arrange-Act-Assert) pattern:

```typescript
describe('processUser', () => {
  it('should transform user data correctly', () => {
    // Arrange
    const input = { name: 'John', age: 30 };

    // Act
    const result = processUser(input);

    // Assert
    expect(result.name).toBe('John');
    expect(result.age).toBe(30);
  });
});
```

### Test Naming

Use descriptive test names that explain the scenario:

- ✅ `it('should return error when email is invalid')`
- ❌ `it('test email')`

### Mock External Dependencies

Always mock external dependencies in unit tests:

```typescript
import { vi } from 'vitest';

vi.mock('./database', () => ({
  query: vi.fn().mockResolvedValue([]),
}));
```

## Performance Considerations

### Optimize for Common Cases

- Use appropriate data structures (Map, Set, etc.)
- Avoid unnecessary iterations
- Consider memoization for expensive computations
- Use streaming for large data

### Lazy Loading

Load heavy modules only when needed:

```typescript
async function processLargeFile(path: string) {
  const { parse } = await import('./heavy-parser');
  return parse(path);
}
```

## Security Guidelines

### Input Validation

Always validate external input:

```typescript
function processInput(input: unknown): ProcessedData {
  if (!isValidInput(input)) {
    throw new ValidationError('Invalid input format');
  }
  return transform(input);
}
```

### Secrets Management

- Never commit secrets to version control
- Use environment variables for sensitive data
- Use `.env` for local development
- Validate required environment variables on startup

### Dependencies

- Check for vulnerabilities before adding dependencies
- Keep dependencies up to date
- Use `pnpm audit` regularly
- Review security advisories

## Documentation

### JSDoc Comments

Document public APIs with JSDoc:

```typescript
/**
 * Processes user data and returns formatted result
 * @param userId - The unique identifier of the user
 * @param options - Optional processing options
 * @returns Formatted user data
 * @throws {UserNotFoundError} When user doesn't exist
 */
export async function processUser(
  userId: string,
  options?: ProcessOptions
): Promise<FormattedUser> {
  // Implementation
}
```

### README Updates

Update documentation when:

- Adding new features
- Changing public APIs
- Adding configuration options
- Modifying setup/deployment process

## Git Workflow

### Commit Messages

Follow conventional commits format:

- `feat: add user authentication`
- `fix: resolve memory leak in parser`
- `docs: update API documentation`
- `refactor: simplify error handling`
- `test: add tests for validation`

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code passes all tests
- [ ] Code passes linting and formatting
- [ ] TypeScript compilation succeeds
- [ ] New code has tests
- [ ] Documentation is updated
- [ ] No secrets are committed
- [ ] Changes are minimal and focused

## Resources

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Vitest Documentation](https://vitest.dev/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
