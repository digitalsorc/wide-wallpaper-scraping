#!/usr/bin/env node

/**
 * Build Validation Script
 * Ensures code will build successfully before commit
 * Run automatically by git hooks or manually
 */

import { execSync } from 'node:child_process';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔍 ${description}...`, colors.blue);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} passed`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, colors.red);
    return false;
  }
}

function main() {
  log('🚀 Running Build Validation\n', colors.blue);

  const checks = [
    {
      name: 'TypeScript Type Check',
      command: 'pnpm run typecheck',
      critical: true,
    },
    {
      name: 'Linting',
      command: 'pnpm run lint',
      critical: true,
    },
    {
      name: 'Unit Tests',
      command: 'pnpm run test',
      critical: true,
    },
    {
      name: 'Build',
      command: 'pnpm run build',
      critical: true,
    },
    {
      name: 'Build Output Verification',
      command: 'node scripts/verify-dist.js',
      critical: true,
    },
  ];

  const results = [];

  for (const check of checks) {
    const passed = runCommand(check.command, check.name);
    results.push({ ...check, passed });

    if (!passed && check.critical) {
      log('\n❌ CRITICAL CHECK FAILED', colors.red);
      log('Build validation aborted. Fix errors and try again.', colors.yellow);
      process.exit(1);
    }
  }

  const allPassed = results.every((r) => r.passed);

  if (allPassed) {
    log('\n✅ ALL VALIDATION CHECKS PASSED', colors.green);
    log('Code is ready for commit/deployment', colors.green);
    process.exit(0);
  } else {
    log('\n⚠️  SOME CHECKS FAILED', colors.yellow);
    log('Review errors above and fix before committing', colors.yellow);
    process.exit(1);
  }
}

main();
