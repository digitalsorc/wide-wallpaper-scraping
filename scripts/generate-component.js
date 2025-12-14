#!/usr/bin/env node

/**
 * Component/Service Generator Script
 * Generates boilerplate code for new components, services, or utilities
 *
 * Usage:
 *   node scripts/generate-component.js service UserService
 *   node scripts/generate-component.js util validation
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function toPascalCase(str) {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

const templates = {
  service: (name) => {
    const pascalName = toPascalCase(name);
    const camelName = toCamelCase(name);
    return `/**
 * ${pascalName} - Business logic for ${name}
 */

export class ${pascalName} {
  constructor() {
    // Initialize service
  }

  /**
   * Example method
   * @returns A greeting message
   */
  public greet(): string {
    return \`Hello from ${pascalName}!\`;
  }

  // Add more methods here
}

// Export singleton instance
export const ${camelName} = new ${pascalName}();
`;
  },

  util: (name) => {
    const pascalName = toPascalCase(name);
    return `/**
 * ${pascalName} utility functions
 */

/**
 * Example utility function
 * @param input - Input value
 * @returns Processed output
 */
export function process${pascalName}(input: string): string {
  // Add implementation
  return input;
}

/**
 * Validation function
 * @param value - Value to validate
 * @returns True if valid
 */
export function isValid${pascalName}(value: unknown): boolean {
  // Add validation logic
  return typeof value === 'string' && value.length > 0;
}
`;
  },

  test: (name, type) => {
    const pascalName = toPascalCase(name);
    const kebabName = toKebabCase(name);
    const importPath =
      type === 'service' ? `../src/services/${kebabName}` : `../src/utils/${kebabName}`;

    if (type === 'service') {
      return `import { describe, it, expect, beforeEach } from 'vitest';
import { ${pascalName} } from '${importPath}';

describe('${pascalName}', () => {
  let service: ${pascalName};

  beforeEach(() => {
    service = new ${pascalName}();
  });

  describe('greet', () => {
    it('should return greeting message', () => {
      // Arrange & Act
      const result = service.greet();

      // Assert
      expect(result).toBe('Hello from ${pascalName}!');
    });
  });

  // Add more tests here
});
`;
    }

    return `import { describe, it, expect } from 'vitest';
import { process${pascalName}, isValid${pascalName} } from '${importPath}';

describe('${name} utils', () => {
  describe('process${pascalName}', () => {
    it('should process input correctly', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = process${pascalName}(input);

      // Assert
      expect(result).toBe('test');
    });
  });

  describe('isValid${pascalName}', () => {
    it('should return true for valid input', () => {
      expect(isValid${pascalName}('valid')).toBe(true);
    });

    it('should return false for invalid input', () => {
      expect(isValid${pascalName}('')).toBe(false);
      expect(isValid${pascalName}(null)).toBe(false);
      expect(isValid${pascalName}(undefined)).toBe(false);
    });
  });
});
`;
  },
};

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function createFile(path, content) {
  if (existsSync(path)) {
    log(`File already exists: ${path}`, colors.yellow);
    return false;
  }

  ensureDir(dirname(path));
  writeFileSync(path, content);
  log(`Created: ${path}`, colors.green);
  return true;
}

function generateComponent(type, name) {
  const kebabName = toKebabCase(name);
  let srcPath;
  let testPath;

  switch (type) {
    case 'service':
      srcPath = join(rootDir, 'src', 'services', `${kebabName}.ts`);
      testPath = join(rootDir, 'tests', 'services', `${kebabName}.test.ts`);
      break;

    case 'util':
      srcPath = join(rootDir, 'src', 'utils', `${kebabName}.ts`);
      testPath = join(rootDir, 'tests', 'utils', `${kebabName}.test.ts`);
      break;

    default:
      log(`Unknown type: ${type}. Use 'service' or 'util'`, colors.red);
      process.exit(1);
  }

  log(`\n🚀 Generating ${type}: ${name}`, colors.blue);
  log('═'.repeat(50), colors.blue);

  const srcCreated = createFile(srcPath, templates[type](name));
  const testCreated = createFile(testPath, templates.test(name, type));

  if (srcCreated || testCreated) {
    log('\n✅ Generation complete!', colors.green);
    log('\nNext steps:', colors.blue);
    log(`  1. Implement the ${type} in: ${srcPath}`, colors.reset);
    log(`  2. Write tests in: ${testPath}`, colors.reset);
    log('  3. Run tests: pnpm run test', colors.reset);
    log('\n');
  } else {
    log('\n⚠ No files were created (all already exist)', colors.yellow);
  }
}

function main() {
  const [, , type, name] = process.argv;

  if (!type || !name) {
    log('\nUsage: node scripts/generate-component.js <type> <name>', colors.yellow);
    log('\nTypes:', colors.blue);
    log('  service  - Generate a service class', colors.reset);
    log('  util     - Generate utility functions', colors.reset);
    log('\nExamples:', colors.blue);
    log('  node scripts/generate-component.js service UserService', colors.reset);
    log('  node scripts/generate-component.js util validation', colors.reset);
    log('\n');
    process.exit(1);
  }

  generateComponent(type, name);
}

main();
