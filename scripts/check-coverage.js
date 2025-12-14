#!/usr/bin/env node

/**
 * Coverage Threshold Checker
 * Ensures test coverage meets minimum requirements
 */

import fs from 'node:fs';

const COVERAGE_FILE = 'coverage/coverage-summary.json';
const THRESHOLDS = {
  statements: 80,
  branches: 70,
  functions: 80,
  lines: 80,
};

function checkCoverage() {
  if (!fs.existsSync(COVERAGE_FILE)) {
    console.error('❌ Coverage file not found. Run tests with coverage first.');
    return false;
  }

  const coverage = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf-8'));
  const total = coverage.total;

  console.log('📊 Code Coverage Report:\n');

  let allPassed = true;

  for (const [metric, threshold] of Object.entries(THRESHOLDS)) {
    const actual = total[metric].pct;
    const passed = actual >= threshold;
    const status = passed ? '✅' : '❌';

    console.log(`${status} ${metric.padEnd(12)}: ${actual.toFixed(2)}% (threshold: ${threshold}%)`);

    if (!passed) {
      allPassed = false;
    }
  }

  return allPassed;
}

function main() {
  const passed = checkCoverage();

  if (passed) {
    console.log('\n✅ Coverage thresholds met');
    process.exit(0);
  } else {
    console.error('\n❌ Coverage below thresholds');
    process.exit(1);
  }
}

main();
