#!/usr/bin/env node

/**
 * Security audit checker script
 * Parses pnpm audit JSON output and fails if vulnerabilities exceed threshold
 *
 * Usage:
 *   pnpm audit --json | node scripts/audit-check.js
 */

import { readFileSync } from 'node:fs';

const SEVERITY_LEVELS = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

const FAIL_ON_SEVERITY = 'high'; // Fail if high or critical vulnerabilities found
const MAX_VULNERABILITIES = 0; // Maximum number of vulnerabilities at fail level

function parseAuditResults(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return data;
  } catch (error) {
    console.error('Failed to parse audit JSON:', error.message);
    process.exit(1);
  }
}

function analyzeVulnerabilities(auditData) {
  const vulnerabilities = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    total: 0,
  };

  // Parse pnpm audit format
  if (auditData.metadata) {
    vulnerabilities.critical = auditData.metadata.vulnerabilities?.critical || 0;
    vulnerabilities.high = auditData.metadata.vulnerabilities?.high || 0;
    vulnerabilities.moderate = auditData.metadata.vulnerabilities?.moderate || 0;
    vulnerabilities.low = auditData.metadata.vulnerabilities?.low || 0;
    vulnerabilities.total = auditData.metadata.vulnerabilities?.total || 0;
  }

  return vulnerabilities;
}

function printReport(vulnerabilities) {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║      Security Audit Report                 ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const criticalColor = vulnerabilities.critical > 0 ? '\x1b[31m' : '\x1b[32m';
  const highColor = vulnerabilities.high > 0 ? '\x1b[31m' : '\x1b[32m';
  const moderateColor = vulnerabilities.moderate > 0 ? '\x1b[33m' : '\x1b[32m';
  const lowColor = vulnerabilities.low > 0 ? '\x1b[37m' : '\x1b[32m';
  const reset = '\x1b[0m';

  console.log(`${criticalColor}  Critical:  ${vulnerabilities.critical}${reset}`);
  console.log(`${highColor}  High:      ${vulnerabilities.high}${reset}`);
  console.log(`${moderateColor}  Moderate:  ${vulnerabilities.moderate}${reset}`);
  console.log(`${lowColor}  Low:       ${vulnerabilities.low}${reset}`);
  console.log(`\n  Total:     ${vulnerabilities.total}\n`);
}

function checkThreshold(vulnerabilities) {
  const failLevel = SEVERITY_LEVELS[FAIL_ON_SEVERITY];
  let failCount = 0;

  if (failLevel >= SEVERITY_LEVELS.critical) {
    failCount += vulnerabilities.critical;
  }
  if (failLevel >= SEVERITY_LEVELS.high) {
    failCount += vulnerabilities.high;
  }
  if (failLevel >= SEVERITY_LEVELS.moderate) {
    failCount += vulnerabilities.moderate;
  }
  if (failLevel >= SEVERITY_LEVELS.low) {
    failCount += vulnerabilities.low;
  }

  if (failCount > MAX_VULNERABILITIES) {
    console.error(
      `\x1b[31m✗ Found ${failCount} ${FAIL_ON_SEVERITY}+ severity vulnerabilities\x1b[0m`
    );
    console.error(`\x1b[31m  Threshold: ${MAX_VULNERABILITIES} allowed\x1b[0m`);
    console.error('\n  Run \x1b[33mpnpm audit\x1b[0m to see details');
    console.error('  Run \x1b[33mpnpm audit fix\x1b[0m to attempt automatic fixes\n');
    return false;
  }

  console.log('\x1b[32m✓ Security audit passed\x1b[0m\n');
  return true;
}

function main() {
  let input = '';

  // Read from stdin
  if (process.stdin.isTTY) {
    console.error('Error: This script expects piped input from pnpm audit');
    console.error('Usage: pnpm audit --json | node scripts/audit-check.js');
    process.exit(1);
  }

  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (chunk) => {
    input += chunk;
  });

  process.stdin.on('end', () => {
    if (!input.trim()) {
      console.log('\x1b[32m✓ No vulnerabilities found\x1b[0m\n');
      process.exit(0);
    }

    const auditData = parseAuditResults(input);
    const vulnerabilities = analyzeVulnerabilities(auditData);

    printReport(vulnerabilities);

    const passed = checkThreshold(vulnerabilities);
    process.exit(passed ? 0 : 1);
  });
}

main();
