# GitHub Copilot Agent Instructions - Production Build Rules

## 🎯 PRIMARY DIRECTIVE

**ZERO BUILD FAILURES TOLERANCE**

Every code change you generate MUST:

1. ✅ Compile without TypeScript errors
2. ✅ Pass all linting rules
3. ✅ Pass all existing tests
4. ✅ Include new tests for new functionality
5. ✅ Build successfully to dist/

**If ANY validation fails, you MUST fix it before considering the task complete.**

## 🤖 Autonomous Agent Workflow

### Step 1: Requirement Analysis (MANDATORY)

Before writing ANY code:

```bash
# 1. Understand the project structure
ls -la src/ tests/ docs/

# 2. Check existing patterns
grep -r "similar_pattern" src/

# 3. Review types
cat src/types/index.ts

# 4. Check dependencies
cat package.json
```

**Questions to answer:**

- What files will this change affect?
- Are there similar implementations to reference?
- What types/interfaces already exist?
- Do I need new dependencies?

### Step 2: Code Generation (STRICT RULES)

#### TypeScript Requirements

**ALWAYS:**

```typescript
// ✅ Explicit return types
export function processData(input: string): ProcessedData {
  // implementation
}

// ✅ Type guards for runtime safety
function isValidData(data: unknown): data is ValidData {
  return typeof data === 'object' && data !== null && 'id' in data;
}

// ✅ Error handling with custom errors
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  throw new ApplicationError('Operation failed', 'OP_FAILED', 500);
}

// ✅ JSDoc for exported functions
/**
 * Processes user data and returns transformed result
 * @param input - Raw user input string
 * @returns Processed data object
 * @throws {ValidationError} If input is invalid
 */
export function processUserData(input: string): ProcessedData {
  // implementation
}
```

**NEVER:**

```typescript
// ❌ No explicit return type
export function processData(input: string) {
  // DON'T DO THIS
}

// ❌ Using 'any' type
function badFunction(data: any): any {
  // DON'T DO THIS
}

// ❌ Unhandled errors
async function riskyOperation() {
  await externalAPI(); // DON'T DO THIS - wrap in try/catch
}

// ❌ No type guard
function isValid(data: unknown): boolean {
  return data.id !== undefined; // DON'T DO THIS - not type-safe
}
```

#### File Organization Rules

**Service Pattern:**

```typescript
// src/services/user-service.ts

import { logger } from '@/utils/logger';
import { ApplicationError } from '@/utils/errors';
import type { User, CreateUserDto } from '@/types';

export class UserService {
  // NOTE: 'UserRepository' is a placeholder type. Replace with your actual repository type or import as needed.
  constructor(private readonly repository: UserRepository) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      logger.info('Creating user', { email: dto.email });

      const user = await this.repository.create(dto);

      logger.info('User created', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to create user', { error, dto });
      throw new ApplicationError('User creation failed', 'USER_CREATE_FAILED', 500);
    }
  }
}
```

**Utility Pattern:**

```typescript
// src/utils/validation.ts

import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

/**
 * Validates object against schema
 * @param data - Data to validate
 * @param schema - Zod schema
 * @throws {ValidationError} If validation fails
 */
export function validate<T>(data: unknown, schema: z.ZodSchema<T>): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError('Validation failed', result.error.flatten().fieldErrors);
  }

  return result.data;
}
```

### Step 3: Test Generation (MANDATORY)

**For EVERY new function/class, generate corresponding tests:**

```typescript
// tests/services/user-service.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '@/services/user-service';
import { ApplicationError } from '@/utils/errors';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
    };
    service = new UserService(mockRepository);
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const dto = { email: 'test@example.com', name: 'Test User' };
      const expectedUser = { id: '123', ...dto };

      mockRepository.create.mockResolvedValue(expectedUser);

      const result = await service.createUser(dto);

      expect(result).toEqual(expectedUser);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ApplicationError on repository failure', async () => {
      const dto = { email: 'test@example.com', name: 'Test User' };
      mockRepository.create.mockRejectedValue(new Error('DB error'));

      await expect(service.createUser(dto)).rejects.toThrow(ApplicationError);
    });
  });
});
```

**Test Coverage Rules:**

1. Test happy path (success case)
2. Test error scenarios
3. Test edge cases (empty input, null, undefined)
4. Test boundary conditions
5. Mock external dependencies
6. Aim for >80% coverage

### Step 4: Validation (AUTO-RUN)

**After generating code, IMMEDIATELY run:**

```bash
# 1. Type check
pnpm run typecheck

# 2. Lint check
pnpm run lint

# 3. Run tests
pnpm run test

# 4. Build
pnpm run build

# 5. Full validation
pnpm run validate-build
```

**If ANY step fails:**

1. Read error message carefully
2. Identify root cause
3. Fix the issue
4. Re-run validation
5. Repeat until ALL checks pass

### Step 5: Build Output Verification

**After successful build:**

```bash
# Verify dist/ directory
ls -la dist/

# Check entry point exists
cat dist/index.js | head -20

# Verify type declarations
find dist -name "*.d.ts"
```

## 📋 Pre-Completion Checklist

Before marking any task as complete:

- [ ] All TypeScript errors resolved (`pnpm run typecheck` passes)
- [ ] All linting errors fixed (`pnpm run lint` passes)
- [ ] All tests passing (`pnpm run test` passes)
- [ ] Test coverage ≥80% for new code
- [ ] Build succeeds (`pnpm run build` passes)
- [ ] dist/ directory contains expected files
- [ ] No console.log() or debug code left
- [ ] JSDoc added for exported functions
- [ ] Error handling implemented
- [ ] Tests cover happy path + error cases
- [ ] Code follows project patterns
- [ ] No unused imports or variables

## 🎯 Quality Gates (NEVER BYPASS)

**Gate 1: Type Check**

```bash
pnpm run typecheck
# Must exit with code 0
```

**Gate 2: Linting**

```bash
pnpm run lint
# Must exit with code 0
```

**Gate 3: Tests**

```bash
pnpm run test
# Must exit with code 0
```

**Gate 4: Build**

```bash
pnpm run build
# Must exit with code 0
```

**Gate 5: Complete Validation**

```bash
pnpm run validate-build
# ALL checks must pass
```

## 🚀 Final Validation

Before considering task complete:

```bash
# Run full CI pipeline locally
pnpm run ci

# This runs:
# 1. typecheck
# 2. lint
# 3. test
# 4. build

# If ALL pass, code is ready!
```

## 📚 Reference Documentation

- **Project Architecture**: `docs/ARCHITECTURE.md`
- **Testing Guide**: `docs/TESTING.md`
- **MCP Setup**: `docs/MCP_SETUP.md`
- **Security**: `docs/SECURITY.md`
- **Contributing**: `docs/CONTRIBUTING.md`
- **TypeScript**: `tsconfig.json`
- **Vitest**: `vitest.config.ts`

## ✅ Success Indicators

You've succeeded when:

- ✅ `pnpm run ci` exits with code 0
- ✅ `dist/` directory exists and is populated
- ✅ All tests pass with >80% coverage
- ✅ No TypeScript, linting, or build errors
- ✅ Code follows all project patterns
- ✅ Documentation is updated (if needed)

**Remember: It's better to take 5 extra minutes to validate thoroughly than to produce code that breaks CI/CD.**
