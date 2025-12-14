#!/usr/bin/env node

/**
 * Setup script with auto-detection and dependency installation
 * Detects runtime environment and installs dependencies automatically
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

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

function exec(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    return false;
  }
}

function checkCommand(command) {
  try {
    const whichCommand = process.platform === 'win32' ? 'where' : 'which';
    execSync(`${whichCommand} ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function detectRuntime() {
  log('\n🔍 Detecting runtime environment...', colors.blue);

  const hasBun = checkCommand('bun');
  const hasPnpm = checkCommand('pnpm');
  const hasNpm = checkCommand('npm');

  if (hasBun) {
    log('✓ Bun detected', colors.green);
    return 'bun';
  }

  if (hasPnpm) {
    log('✓ pnpm detected', colors.green);
    return 'pnpm';
  }

  if (hasNpm) {
    log('✓ npm detected', colors.green);
    return 'npm';
  }

  log('✗ No package manager found!', colors.red);
  return null;
}

function installPnpm() {
  log('\n📦 Installing pnpm...', colors.blue);
  const success = exec('npm install -g pnpm');
  if (success) {
    log('✓ pnpm installed successfully', colors.green);
    return true;
  }
  log('✗ Failed to install pnpm', colors.red);
  return false;
}

function installDependencies(runtime) {
  log('\n📦 Installing dependencies...', colors.blue);

  const commands = {
    bun: 'bun install',
    pnpm: 'pnpm install',
    npm: 'npm install',
  };

  const command = commands[runtime];
  if (!command) {
    log('✗ Unknown runtime', colors.red);
    return false;
  }

  const success = exec(command);
  if (success) {
    log('✓ Dependencies installed successfully', colors.green);
    return true;
  }
  log('✗ Failed to install dependencies', colors.red);
  return false;
}

function checkLockfile() {
  const lockfiles = {
    'bun.lockb': 'bun',
    'pnpm-lock.yaml': 'pnpm',
    'package-lock.json': 'npm',
  };

  for (const [file, runtime] of Object.entries(lockfiles)) {
    if (existsSync(file)) {
      log(`✓ Found ${file}`, colors.green);
      return runtime;
    }
  }

  return null;
}

async function main() {
  log('\n🚀 Starting setup...', colors.blue);
  log('═══════════════════════════════════════\n', colors.blue);

  // Check for existing lockfile
  const lockfileRuntime = checkLockfile();
  if (lockfileRuntime) {
    log(`📄 Lockfile suggests using: ${lockfileRuntime}`, colors.yellow);
  }

  // Detect runtime
  let runtime = detectRuntime();

  // If no runtime detected, try to install pnpm
  if (!runtime) {
    log('\n⚠ No package manager detected. Installing pnpm...', colors.yellow);
    if (installPnpm()) {
      runtime = 'pnpm';
    } else {
      log('\n❌ Setup failed. Please install Node.js and npm first.', colors.red);
      process.exit(1);
    }
  }

  // Install dependencies
  const success = installDependencies(runtime);

  if (success) {
    log('\n═══════════════════════════════════════', colors.green);
    log('✅ Setup completed successfully!', colors.green);
    log('\nNext steps:', colors.blue);
    log(`  ${runtime} run dev       - Start development server`, colors.reset);
    log(`  ${runtime} run build     - Build for production`, colors.reset);
    log(`  ${runtime} run test      - Run tests`, colors.reset);
    log(`  ${runtime} run lint:fix  - Fix linting issues`, colors.reset);
    log('\n');
  } else {
    log('\n❌ Setup failed. Please check the errors above.', colors.red);
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, colors.red);
  process.exit(1);
});
