# Architecture Documentation

## Overview

The Default Starter Template is designed as a production-ready foundation for TypeScript projects with emphasis on type safety, testability, AI agent compatibility, and developer experience.

## Design Principles

### 1. Type Safety First

- TypeScript strict mode enabled
- Explicit types for all public APIs
- Runtime validation with Zod
- Type guards for external data

### 2. Modular Architecture

- Loosely coupled modules
- Clear separation of concerns
- Dependency injection ready
- Easy to extend and modify

### 3. AI-Optimized

- Comprehensive MCP server integration
- Clear, self-documenting code
- Extensive inline documentation
- Predictable patterns

### 4. Developer Experience

- Zero-configuration setup
- Fast development cycles
- Comprehensive tooling
- Clear error messages

## Project Structure

```
.
├── .github/                    # GitHub configuration
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   ├── workflows/              # CI/CD workflows
│   │   ├── ci.yml              # Continuous integration
│   │   ├── security.yml        # Security scanning
│   │   └── release.yml         # Release automation
│   ├── dependabot.yml          # Dependency updates
│   ├── copilot-instructions.md # GitHub Copilot guide
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # This file
│   ├── CONTRIBUTING.md         # Contribution guidelines
│   ├── SECURITY.md             # Security policies
│   ├── TESTING.md              # Testing guide
│   ├── MCP_SETUP.md            # MCP server setup
│   ├── CONVENTIONS.md          # Coding conventions
│   └── FEATURES.md             # Feature documentation
│
├── scripts/                    # Build and automation scripts
│   ├── setup.js                # Environment setup
│   ├── generate-component.js   # Code generation
│   └── audit-check.js          # Security audit
│
├── src/                        # Source code
│   ├── index.ts                # Main entry point
│   ├── config/                 # Configuration management
│   │   └── default.ts          # Default configuration
│   ├── types/                  # TypeScript type definitions
│   │   └── config.ts           # Configuration types
│   ├── utils/                  # Utility functions
│   │   ├── errors.ts           # Custom error classes
│   │   ├── logger.ts           # Logging utilities
│   │   ├── validation.ts       # Input validation
│   │   ├── greet.ts            # Example utility
│   │   └── math.ts             # Example utility
│   └── services/               # Business logic (empty by default)
│
├── tests/                      # Test files
│   ├── greet.test.ts           # Example tests
│   └── math.test.ts            # Example tests
│
├── .cursorrules                # Cursor IDE configuration
├── .windsurfrules              # Windsurf IDE configuration
├── .aider.conf.yml             # Aider AI configuration
├── .editorconfig               # Editor configuration
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore patterns
├── .npmignore                  # npm publish ignore
├── .prettierrc.json            # Prettier configuration
├── .prettierignore             # Prettier ignore patterns
├── biome.json                  # Biome linter configuration
├── mcp.json                    # MCP server configuration
├── package.json                # Project dependencies and scripts
├── pnpm-lock.yaml              # Lock file
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts            # Vitest configuration
├── LICENSE                     # MIT License
└── README.md                   # Project readme
```

## Core Modules

### Configuration Layer (`src/config/`)

**Purpose**: Centralized configuration management

```typescript
// src/config/default.ts
export const DEFAULT_CONFIG: Config = {
  appName: 'Default Starter Template',
  version: '1.0.0',
  environment: 'development',
  debug: true,
};
```

**Responsibilities**:

- Load environment variables
- Provide default values
- Validate configuration
- Type-safe config access

### Type Definitions (`src/types/`)

**Purpose**: Centralized type definitions

```typescript
// src/types/config.ts
export interface Config {
  appName: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
}
```

**Responsibilities**:

- Define domain models
- API request/response types
- Configuration types
- Shared type utilities

### Utilities (`src/utils/`)

**Purpose**: Reusable helper functions

**Key Utilities**:

1. **Error Handling** (`errors.ts`)
   - Custom error classes
   - Error hierarchy
   - Type guards

2. **Logging** (`logger.ts`)
   - Structured logging
   - Log levels
   - Context support

3. **Validation** (`validation.ts`)
   - Zod schema validation
   - Type guards
   - Sanitization

**Design Pattern**:

```typescript
// Pure functions, no side effects
export function add(a: number, b: number): number {
  return a + b;
}

// With validation
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new ValidationError('Cannot divide by zero');
  }
  return a / b;
}
```

### Services (`src/services/`)

**Purpose**: Business logic and orchestration

**Pattern**:

```typescript
// Example service structure
export class UserService {
  constructor(
    private readonly db: Database,
    private readonly cache: Cache
  ) {}

  async getUserById(id: string): Promise<User> {
    // Check cache
    const cached = await this.cache.get(`user:${id}`);
    if (cached) return cached;

    // Fetch from database
    const user = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) throw new NotFoundError('User', id);

    // Cache result
    await this.cache.set(`user:${id}`, user, 3600);

    return user;
  }
}
```

**Responsibilities**:

- Implement business rules
- Coordinate between modules
- Handle transactions
- Manage state

## Data Flow

### Request Flow

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Validation  │ (Zod schemas)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Service    │ (Business logic)
│   Layer     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Response   │
└─────────────┘
```

### Error Flow

```
┌─────────────┐
│   Error     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Custom Error │ (ApplicationError)
│   Class     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Logger     │ (Structured logging)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Client    │ (Error response)
└─────────────┘
```

## Design Patterns

### 1. Error Handling Pattern

```typescript
// Define error hierarchy
class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
  }
}

class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

// Use in services
try {
  const result = await operation();
  return result;
} catch (error) {
  if (error instanceof SpecificError) {
    throw new ApplicationError(...);
  }
  throw error;
}
```

### 2. Configuration Pattern

```typescript
// Environment-based configuration
function getConfig(): Config {
  const env = process.env['NODE_ENV'] || 'development';

  const base = {
    appName: 'My App',
    debug: env === 'development',
  };

  return base;
}
```

### 3. Validation Pattern

```typescript
// Schema-based validation with Zod
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  age: z.number().int().min(18).optional(),
});

function validateUser(data: unknown): User {
  return userSchema.parse(data);
}
```

### 4. Logging Pattern

```typescript
// Structured logging with context
logger.info('User created', {
  userId: user.id,
  email: user.email,
  timestamp: new Date(),
});

// Error logging
logger.error('Operation failed', error, {
  operation: 'createUser',
  input: sanitized,
});
```

## MCP Integration

### Architecture

```
┌─────────────────┐
│   AI Agent      │
│ (Cursor/Copilot)│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   mcp.json      │ (Configuration)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  MCP Servers    │
├─────────────────┤
│ • Filesystem    │
│ • Fetch         │
│ • Database      │
│ • Search        │
│ • GitHub        │
│ • Memory        │
│ • Puppeteer     │
│ • AWS           │
│ • Docker        │
│ • Slack         │
└─────────────────┘
```

### Server Configuration

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"],
      "enabled": true
    }
  }
}
```

## Testing Architecture

### Test Pyramid

```
       /\       E2E Tests
      /  \      (Slow, Comprehensive)
     /____\
    /      \    Integration Tests
   /________\   (Medium speed)
  /          \  Unit Tests
 /____________\ (Fast, Focused)
```

### Test Organization

```
tests/
├── unit/           # Isolated function tests
├── integration/    # Module interaction tests
└── e2e/            # Full workflow tests
```

### Mocking Strategy

```typescript
// Mock external dependencies
vi.mock('./database', () => ({
  query: vi.fn(),
}));

// Use in tests
describe('UserService', () => {
  it('should fetch user', async () => {
    mockQuery.mockResolvedValue(userData);
    const result = await service.getUser('123');
    expect(result).toEqual(userData);
  });
});
```

## Build and Deployment

### Build Process

```
Source Code (.ts)
       ↓
TypeScript Compiler
       ↓
JavaScript (.js) + Type Definitions (.d.ts)
       ↓
Distribution (dist/)
```

### CI/CD Pipeline

```
Push to GitHub
       ↓
GitHub Actions
       ├─> Type Check
       ├─> Lint
       ├─> Test
       ├─> Security Scan
       └─> Build
       ↓
Artifacts Ready for Deploy
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**

   ```typescript
   async function loadHeavyModule() {
     const { HeavyModule } = await import('./heavy-module');
     return new HeavyModule();
   }
   ```

2. **Caching**

   ```typescript
   const cache = new Map<string, CachedValue>();

   function getCached(key: string): Value | null {
     const entry = cache.get(key);
     if (entry && !isExpired(entry)) {
       return entry.value;
     }
     return null;
   }
   ```

3. **Parallel Execution**
   ```typescript
   async function fetchMultiple(ids: string[]): Promise<Result[]> {
     const promises = ids.map((id) => fetchSingle(id));
     return Promise.all(promises);
   }
   ```

## Security Architecture

### Defense in Depth

```
┌─────────────────┐
│  Input Layer    │ (Validation, Sanitization)
├─────────────────┤
│ Business Logic  │ (Authorization, Rate Limiting)
├─────────────────┤
│  Data Layer     │ (Parameterized Queries)
├─────────────────┤
│ Infrastructure  │ (Environment Isolation)
└─────────────────┘
```

### Security Layers

1. **Input Validation**
   - Zod schema validation
   - Type guards
   - Sanitization

2. **Authentication/Authorization**
   - JWT tokens
   - Role-based access
   - Permission checks

3. **Data Protection**
   - Parameterized queries
   - Encryption at rest
   - Secure transmission

4. **Monitoring**
   - Audit logging
   - Error tracking
   - Security alerts

## Scalability

### Horizontal Scaling

- Stateless design
- Shared nothing architecture
- Load balancer ready
- Session storage externalized

### Vertical Scaling

- Efficient algorithms
- Resource pooling
- Memory management
- CPU optimization

## Extension Points

### Adding New Features

1. **Add Types** (`src/types/`)
2. **Add Service** (`src/services/`)
3. **Add Tests** (`tests/`)
4. **Update Documentation**

### Adding MCP Server

1. Update `mcp.json`
2. Add environment variables to `.env.example`
3. Document in `docs/MCP_SETUP.md`

### Adding Dependencies

```bash
# Check security first
npm info package-name

# Add dependency
pnpm add package-name

# Add types if needed
pnpm add -D @types/package-name
```

## Future Considerations

### Potential Additions

- **API Framework**: Express, Fastify, or similar
- **Database ORM**: Prisma, TypeORM, or Drizzle
- **Authentication**: Passport, Auth0 integration
- **GraphQL**: Apollo Server
- **WebSockets**: Socket.io
- **Queue System**: Bull, BullMQ
- **Caching**: Redis integration
- **Monitoring**: Prometheus, Grafana

### Migration Paths

The template is designed to evolve:

- Start simple (current state)
- Add features as needed
- Maintain backwards compatibility
- Document breaking changes

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Last Updated**: December 2024
