# Default Starter Template

> 🚀 Production-ready starter template for AI coding agents with zero-setup configuration

[![CI](https://github.com/digitalsorc/Default-Starter-Template-Repository/workflows/CI/badge.svg)](https://github.com/digitalsorc/Default-Starter-Template-Repository/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🤖 **AI Agent Ready** - Pre-configured with MCP servers and agent guides
- ⚡ **Modern Stack** - Bun/pnpm, TypeScript strict mode, Vitest
- 🔧 **Zero Setup** - Clone and run with automatic dependency detection
- 📦 **MCP Servers** - Filesystem, DB, Search, APIs via `mcp.json`
- 🎯 **Type Safe** - Full TypeScript strict mode with comprehensive checks
- 🧪 **Testing Ready** - Vitest configured with coverage support
- 🎨 **Code Quality** - ESLint (Biome) + Prettier pre-configured
- 🔄 **CI/CD** - GitHub Actions workflows included
- 📚 **Well Documented** - Agent guides, conventions, and patterns

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/digitalsorc/Default-Starter-Template-Repository.git
cd Default-Starter-Template-Repository

# Auto-setup (detects Bun/pnpm/npm and installs dependencies)
npm run setup

# Start development
pnpm run dev        # or: bun run dev

# Run tests
pnpm run test

# Build for production
pnpm run build
```

## 📋 Prerequisites

- **Node.js** 18+ (Node 20 recommended)
- **Package Manager**: One of:
  - [Bun](https://bun.sh/) (recommended for speed)
  - [pnpm](https://pnpm.io/) (recommended for efficiency)
  - npm (comes with Node.js)

The setup script will auto-detect your package manager or install pnpm if needed.

## 🛠️ Available Scripts

| Command                  | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `npm run setup`          | Auto-detect environment and install dependencies |
| `pnpm run dev`           | Run application in development mode              |
| `pnpm run build`         | Build for production                             |
| `pnpm run test`          | Run tests once                                   |
| `pnpm run test:watch`    | Run tests in watch mode                          |
| `pnpm run test:coverage` | Run tests with coverage report                   |
| `pnpm run lint`          | Check code quality                               |
| `pnpm run lint:fix`      | Fix linting issues                               |
| `pnpm run format`        | Format code with Prettier                        |
| `pnpm run format:check`  | Check code formatting                            |
| `pnpm run typecheck`     | Type check without building                      |
| `pnpm run ci`            | Run all CI checks (typecheck, lint, test)        |

## 🤖 AI Agent Support

This template is optimized for AI coding agents with comprehensive guides:

### Cursor IDE

- `.cursorrules` - Project conventions and coding standards
- `mcp.json` - Model Context Protocol server configuration

### GitHub Copilot

- `.github/copilot-instructions.md` - Development guidelines and patterns

### MCP Servers

Pre-configured servers for enhanced AI capabilities:

- **Filesystem** (enabled) - File operations
- **Fetch** (enabled) - HTTP/API requests
- **Database** (optional) - SQLite operations
- **Search** (optional) - Brave Search integration
- **GitHub** (optional) - GitHub API access

See [docs/MCP_SETUP.md](docs/MCP_SETUP.md) for detailed configuration.

## 📁 Project Structure

```
.
├── .github/
│   ├── workflows/          # CI/CD workflows
│   └── copilot-instructions.md  # GitHub Copilot guide
├── docs/                   # Documentation
│   └── MCP_SETUP.md       # MCP server configuration
├── scripts/
│   └── setup.js           # Auto-setup script
├── src/
│   ├── config/            # Configuration files
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── index.ts           # Main entry point
├── tests/                 # Test files
├── .cursorrules           # Cursor IDE rules
├── biome.json            # Biome (ESLint) config
├── mcp.json              # MCP server config
├── package.json          # Dependencies and scripts
├── prettier.config.json  # Prettier config
├── tsconfig.json         # TypeScript config
└── vitest.config.ts      # Vitest config
```

## 🔧 Configuration

### TypeScript

- **Strict Mode**: All strict checks enabled
- **Target**: ES2022
- **Module**: ESNext with bundler resolution
- See `tsconfig.json` for full configuration

### Code Quality

- **Biome**: Fast linter and formatter
- **Prettier**: Code formatting
- Both configured to work together

### Testing

- **Vitest**: Fast unit testing framework
- **Coverage**: v8 provider with multiple reporters
- Configured for TypeScript and ES modules

## 🔐 Environment Variables

Create a `.env` file for sensitive configuration:

```bash
# API Keys (for MCP servers)
BRAVE_API_KEY=your_brave_search_api_key
GITHUB_TOKEN=your_github_token

# Application Config
NODE_ENV=development
DEBUG=true
```

**Note**: `.env` is in `.gitignore` to prevent committing secrets.

## 🎯 Usage Example

```typescript
import { greet, add, multiply } from './src';

// Use the greeting function
console.log(greet('World')); // Output: Hello, World!

// Use math utilities
const sum = add(5, 3); // 8
const product = multiply(4, 7); // 28
```

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run tests in watch mode (for development)
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

Test files follow the `*.test.ts` naming convention and are located in the `tests/` directory.

## 📦 Adding Dependencies

```bash
# Production dependency
pnpm add package-name

# Development dependency
pnpm add -D package-name
```

Always check for security vulnerabilities before adding new packages.

## 🚢 Deployment

### Build for Production

```bash
pnpm run build
```

The compiled output will be in the `dist/` directory.

### CI/CD

GitHub Actions workflows are pre-configured:

- **CI**: Runs on push/PR - tests, lints, builds
- **Release**: Triggered on version tags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm run ci`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern TypeScript and industry best practices
- Optimized for AI coding agent workflows
- Inspired by the needs of rapid, production-quality development

## 📚 Documentation

- [MCP Setup Guide](docs/MCP_SETUP.md) - Model Context Protocol configuration
- [Cursor Rules](.cursorrules) - Project conventions for Cursor IDE
- [Copilot Instructions](.github/copilot-instructions.md) - GitHub Copilot guidelines

## 🔗 Links

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Biome Documentation](https://biomejs.dev/)
- [pnpm Documentation](https://pnpm.io/)
- [Bun Documentation](https://bun.sh/)

---

**Made with ❤️ for developers and AI agents**
