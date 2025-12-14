# Testing Guide

Comprehensive guide to testing in the Default Starter Template.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Organization](#test-organization)
- [Mocking and Fixtures](#mocking-and-fixtures)
- [Best Practices](#best-practices)

## Testing Philosophy

### Testing Pyramid

```
      /\
     /  \    E2E Tests (Few)
    /____\
   /      \  Integration Tests (Some)
  /________\
 /          \ Unit Tests (Many)
/____________\
```

- **Unit Tests** (70%): Fast, isolated, test single functions
- **Integration Tests** (20%): Test component interactions
- **E2E Tests** (10%): Test full user workflows

### Goals

- **Confidence**: Changes don't break existing functionality
- **Documentation**: Tests serve as living documentation
- **Design**: Tests drive better API design
- **Regression Prevention**: Catch bugs before production

## Testing Stack

### Core Framework

- **Vitest**: Fast unit test framework
  - Jest-compatible API
  - Native TypeScript support
  - Built-in coverage
  - Watch mode with HMR

### Utilities

- **@vitest/ui**: Interactive test UI
- **@vitest/coverage-v8**: Code coverage
- **Type Testing**: TypeScript type assertions

## Running Tests

### Basic Commands

```bash
# Run all tests once
pnpm run test

# Watch mode (recommended for development)
pnpm run test:watch

# With coverage
pnpm run test:coverage

# Interactive UI
pnpm run test:ui
```

### Specific Tests

```bash
# Run single file
pnpm run test -- user-service.test.ts

# Run tests matching pattern
pnpm run test -- --grep="user"

# Run only changed tests
pnpm run test -- --changed
```

### Coverage

```bash
# Generate coverage report
pnpm run test:coverage

# View coverage report
open coverage/index.html
```

## Writing Tests

### AAA Pattern

Always follow Arrange-Act-Assert:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { greet } from '../src/utils/greet';

describe('greet', () => {
  it('should return greeting message', () => {
    // Arrange: Set up test data
    const name = 'World';
    const expected = 'Hello, World!';

    // Act: Execute the function
    const result = greet(name);

    // Assert: Verify the result
    expect(result).toBe(expected);
  });
});
```

### Test Structure

```typescript
describe('ModuleName', () => {
  // Setup shared variables
  let service: ServiceClass;
  let mockDep: MockType;

  beforeEach(() => {
    // Runs before each test
    mockDep = createMock();
    service = new ServiceClass(mockDep);
  });

  afterEach(() => {
    // Runs after each test
    vi.clearAllMocks();
  });

  describe('methodName', () => {
    it('should handle success case', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Test implementation
    });

    it('should handle edge cases', () => {
      // Test implementation
    });
  });
});
```

### Naming Conventions

**Good Test Names:**

```typescript
it('should return user when valid ID is provided');
it('should throw NotFoundError when user does not exist');
it('should cache result after first fetch');
it('should retry 3 times on network failure');
```

**Bad Test Names:**

```typescript
it('works');
it('test user');
it('edge case');
it('returns data');
```

### Assertions

```typescript
// Equality
expect(result).toBe(5); // Strict equality (===)
expect(result).toEqual({ id: 1 }); // Deep equality

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();
expect(result).toBeNull();
expect(result).toBeUndefined();
expect(result).toBeDefined();

// Numbers
expect(result).toBeGreaterThan(5);
expect(result).toBeLessThan(10);
expect(result).toBeCloseTo(0.3); // Floating point

// Strings
expect(result).toMatch(/pattern/);
expect(result).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toMatchObject({ id: 1 });

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(ValidationError);
expect(() => fn()).toThrow('error message');

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow(Error);
```

## Test Organization

### File Structure

```
tests/
├── unit/                    # Unit tests
│   ├── utils/
│   │   ├── validation.test.ts
│   │   └── logger.test.ts
│   └── services/
│       └── user-service.test.ts
├── integration/             # Integration tests
│   └── api/
│       └── user-api.test.ts
├── e2e/                     # End-to-end tests
│   └── workflows/
│       └── user-registration.test.ts
└── fixtures/                # Test data
    ├── users.json
    └── mock-api-responses.json
```

### File Naming

- Test files: `*.test.ts` or `*.spec.ts`
- Match source structure: `src/utils/greet.ts` → `tests/utils/greet.test.ts`

## Mocking and Fixtures

### Mocking Functions

```typescript
import { vi } from 'vitest';

// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue('result');
mockFn.mockResolvedValue('async result');

// Mock implementation
mockFn.mockImplementation((x) => x * 2);

// Verify calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg');
expect(mockFn).toHaveBeenCalledTimes(2);
```

### Mocking Modules

```typescript
// Mock entire module
vi.mock('./database', () => ({
  query: vi.fn(),
  connect: vi.fn(),
}));

// Partial mock
vi.mock('./database', async () => {
  const actual = await vi.importActual('./database');
  return {
    ...actual,
    query: vi.fn(),
  };
});
```

### Mock Factory Pattern

```typescript
// fixtures/mock-factories.ts
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    ...overrides,
  };
}

// In test
const user = createMockUser({ name: 'Jane' });
```

### Fixtures

```typescript
// fixtures/users.json
{
  "validUser": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "adminUser": {
    "id": "user-456",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}

// Loading fixtures
import users from '../fixtures/users.json';

const validUser = users.validUser;
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✅ GOOD: Tests behavior
it('should format user display name', () => {
  const user = { firstName: 'John', lastName: 'Doe' };
  expect(formatDisplayName(user)).toBe('John Doe');
});

// ❌ BAD: Tests implementation details
it('should call toUpperCase on firstName', () => {
  const spy = vi.spyOn(String.prototype, 'toUpperCase');
  formatDisplayName({ firstName: 'John', lastName: 'Doe' });
  expect(spy).toHaveBeenCalled();
});
```

### 2. One Assertion Per Test (Generally)

```typescript
// ✅ GOOD: Single clear assertion
it('should return user with correct ID', () => {
  const user = getUser('123');
  expect(user.id).toBe('123');
});

it('should return user with correct name', () => {
  const user = getUser('123');
  expect(user.name).toBe('John');
});

// ❌ BAD: Multiple unrelated assertions
it('should return correct user', () => {
  const user = getUser('123');
  expect(user.id).toBe('123');
  expect(user.name).toBe('John');
  expect(user.email).toContain('@');
  expect(user.role).toBe('user');
});
```

### 3. Test Edge Cases

```typescript
describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  // Edge cases
  it('should handle division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  it('should handle decimal results', () => {
    expect(divide(10, 3)).toBeCloseTo(3.333, 2);
  });
});
```

### 4. Keep Tests Independent

```typescript
// ✅ GOOD: Each test is independent
describe('UserService', () => {
  beforeEach(() => {
    // Fresh setup for each test
    mockDatabase.clear();
  });

  it('should create user', async () => {
    await service.createUser(userData);
    expect(mockDatabase.users).toHaveLength(1);
  });

  it('should update user', async () => {
    // Sets up its own data
    await service.createUser(userData);
    await service.updateUser('123', updates);
    expect(mockDatabase.users[0].name).toBe('Updated');
  });
});

// ❌ BAD: Tests depend on each other
describe('UserService', () => {
  let userId: string;

  it('should create user', async () => {
    const user = await service.createUser(userData);
    userId = user.id; // DON'T DO THIS
  });

  it('should update user', async () => {
    await service.updateUser(userId, updates); // Depends on previous test
  });
});
```

### 5. Use Descriptive Setup

```typescript
// ✅ GOOD: Clear setup
describe('calculateDiscount', () => {
  it('should apply 10% discount for premium users', () => {
    const user = { isPremium: true };
    const price = 100;

    const result = calculateDiscount(price, user);

    expect(result).toBe(90);
  });
});

// ❌ BAD: Unclear setup
describe('calculateDiscount', () => {
  it('should work', () => {
    const u = { p: true };
    const p = 100;
    expect(calculateDiscount(p, u)).toBe(90);
  });
});
```

## Coverage Goals

### Target Coverage

- **Overall**: 80%+
- **Critical paths**: 90%+
- **Utilities**: 85%+
- **Configuration**: 70%+

### Viewing Coverage

```bash
# Generate coverage
pnpm run test:coverage

# View in browser
open coverage/index.html

# View in terminal
cat coverage/coverage-summary.json
```

### Coverage Report

```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
All files           |   85.5  |   80.2   |   88.9  |   85.5
 src/utils          |   92.3  |   87.5   |   95.0  |   92.3
  validation.ts     |   95.0  |   90.0   |  100.0  |   95.0
  logger.ts         |   88.5  |   85.0   |   90.0  |   88.5
```

## Continuous Integration

Tests run automatically on:

- Every push
- Every pull request
- Scheduled daily runs

### CI Commands

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: pnpm run test

- name: Check coverage
  run: pnpm run test:coverage
```

## Debugging Tests

### VS Code Debugger

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest Tests",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["run", "test"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debug Single Test

```typescript
// Add .only to focus on one test
it.only('should debug this test', () => {
  debugger; // Add breakpoint
  const result = functionUnderTest();
  expect(result).toBe(expected);
});
```

### Console Logging

```typescript
it('should process data', () => {
  const input = { data: 'test' };
  console.log('Input:', input);

  const result = processData(input);
  console.log('Result:', result);

  expect(result).toBeDefined();
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Happy Testing!** 🧪
