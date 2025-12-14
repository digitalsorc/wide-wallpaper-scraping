#!/usr/bin/env node

/**
 * Dist Verification Script
 * Validates that build output is correct and complete
 */

import fs from 'node:fs';

const REQUIRED_FILES = ['dist/index.js', 'dist/index.d.ts'];

const REQUIRED_DIRS = ['dist'];

function checkFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required file: ${filePath}`);
    return false;
  }
  console.log(`✅ Found: ${filePath}`);
  return true;
}

function checkDirExists(dirPath) {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    console.error(`❌ Missing required directory: ${dirPath}`);
    return false;
  }
  console.log(`✅ Found directory: ${dirPath}`);
  return true;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  const result = [...arrayOfFiles];

  for (const file of files) {
    const filePath = `${dirPath}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      const subFiles = getAllFiles(filePath, result);
      result.push(...subFiles.slice(result.length));
    } else {
      result.push(filePath.replace('dist/', ''));
    }
  }

  return result;
}

function checkDistContent() {
  const distPath = 'dist';

  if (!fs.existsSync(distPath)) {
    console.error('❌ dist/ directory not found');
    return false;
  }

  const files = getAllFiles(distPath);

  if (files.length === 0) {
    console.error('❌ dist/ directory is empty');
    return false;
  }

  const jsFiles = files.filter((f) => f.endsWith('.js'));
  const dtsFiles = files.filter((f) => f.endsWith('.d.ts'));

  console.log(`📦 Build output: ${jsFiles.length} JS files, ${dtsFiles.length} declaration files`);

  if (jsFiles.length === 0) {
    console.error('❌ No JavaScript files in build output');
    return false;
  }

  if (dtsFiles.length === 0) {
    console.warn('⚠️  No TypeScript declaration files in build output');
  }

  return true;
}

function main() {
  console.log('🔍 Verifying build output...\n');

  let allChecks = true;

  // Check directories
  for (const dir of REQUIRED_DIRS) {
    if (!checkDirExists(dir)) {
      allChecks = false;
    }
  }

  // Check required files
  for (const file of REQUIRED_FILES) {
    if (!checkFileExists(file)) {
      allChecks = false;
    }
  }

  // Check dist content
  if (!checkDistContent()) {
    allChecks = false;
  }

  if (allChecks) {
    console.log('\n✅ Build output verification passed');
    process.exit(0);
  } else {
    console.error('\n❌ Build output verification failed');
    process.exit(1);
  }
}

main();
