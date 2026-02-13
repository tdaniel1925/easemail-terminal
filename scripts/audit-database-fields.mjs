#!/usr/bin/env node

/**
 * Database Field Audit Script
 *
 * This script checks for common field name mismatches between:
 * - TypeScript interfaces
 * - Database queries
 * - API responses
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Common field name patterns that often have issues
const fieldPatterns = [
  'created_at',
  'updated_at',
  'deleted_at',
  'joined_at',
  'accepted_at',
  'expires_at',
  'sent_at',
  'received_at',
  'last_login_at',
  'verified_at',
];

// Known database tables and their correct field names (based on migrations)
const databaseSchema = {
  organization_members: ['id', 'organization_id', 'user_id', 'role', 'joined_at'], // NOT created_at!
  organization_invites: ['id', 'organization_id', 'email', 'role', 'token', 'invited_by', 'created_at', 'accepted_at', 'expires_at'],
  users: ['id', 'email', 'name', 'created_at', 'is_super_admin'],
  user_login_tracking: ['id', 'user_id', 'last_login_at', 'login_count', 'created_at'],
  audit_logs: ['id', 'organization_id', 'user_id', 'action', 'details', 'timestamp'], // NOT created_at!
};

const issues = [];

function findFiles(dir, extension) {
  const files = [];

  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          traverse(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(projectRoot, filePath);

  // Check for common problematic patterns

  // Pattern 1: .order('created_at') on organization_members
  if (content.includes('organization_members') && content.includes(".order('created_at'")) {
    issues.push({
      file: relativePath,
      issue: "Using .order('created_at') on organization_members (should be 'joined_at')",
      severity: 'HIGH',
    });
  }

  // Pattern 2: member.created_at when organization_members uses joined_at
  if (content.match(/member\.created_at|member\[['"]created_at['"]\]/)) {
    issues.push({
      file: relativePath,
      issue: "Accessing member.created_at (organization_members uses 'joined_at')",
      severity: 'HIGH',
    });
  }

  // Pattern 3: audit_logs with created_at instead of timestamp
  if (content.includes('audit_logs') && content.match(/\.order\(['"]created_at['"]\)/)) {
    issues.push({
      file: relativePath,
      issue: "Using .order('created_at') on audit_logs (should be 'timestamp')",
      severity: 'HIGH',
    });
  }

  // Pattern 4: Interface definitions that might be wrong
  const interfaceMatch = content.match(/interface\s+(\w*Member\w*)\s*{([^}]+)}/gs);
  if (interfaceMatch) {
    interfaceMatch.forEach(match => {
      if (match.includes('created_at') && !match.includes('joined_at')) {
        issues.push({
          file: relativePath,
          issue: "Member interface has 'created_at' but database uses 'joined_at'",
          severity: 'MEDIUM',
          details: match.substring(0, 200),
        });
      }
    });
  }

  // Pattern 5: Direct field access that might not exist
  const selectMatches = content.match(/\.select\(['"`]([^'"`]+)['"`]\)/g);
  if (selectMatches) {
    selectMatches.forEach(match => {
      if (match.includes('organization_members') && match.includes('created_at')) {
        issues.push({
          file: relativePath,
          issue: "Selecting 'created_at' from organization_members (field doesn't exist)",
          severity: 'HIGH',
        });
      }
    });
  }
}

console.log('🔍 Starting Database Field Audit...\n');

// Find all TypeScript and TSX files
const appDir = path.join(projectRoot, 'app');
const files = [
  ...findFiles(appDir, '.ts'),
  ...findFiles(appDir, '.tsx'),
];

console.log(`📁 Scanning ${files.length} files...\n`);

files.forEach(checkFile);

// Report findings
if (issues.length === 0) {
  console.log('✅ No field mismatch issues found!\n');
} else {
  console.log(`❌ Found ${issues.length} potential issues:\n`);

  // Group by severity
  const high = issues.filter(i => i.severity === 'HIGH');
  const medium = issues.filter(i => i.severity === 'MEDIUM');
  const low = issues.filter(i => i.severity === 'LOW');

  if (high.length > 0) {
    console.log('🔴 HIGH SEVERITY ISSUES:');
    high.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.issue}`);
      console.log(`   File: ${issue.file}`);
      if (issue.details) console.log(`   Details: ${issue.details}`);
    });
  }

  if (medium.length > 0) {
    console.log('\n\n🟡 MEDIUM SEVERITY ISSUES:');
    medium.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.issue}`);
      console.log(`   File: ${issue.file}`);
      if (issue.details) console.log(`   Details: ${issue.details}`);
    });
  }

  if (low.length > 0) {
    console.log('\n\n🟢 LOW SEVERITY ISSUES:');
    low.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.issue}`);
      console.log(`   File: ${issue.file}`);
    });
  }
}

console.log('\n📊 Audit Summary:');
console.log(`   Total Files Scanned: ${files.length}`);
console.log(`   Total Issues Found: ${issues.length}`);
console.log(`   High Severity: ${issues.filter(i => i.severity === 'HIGH').length}`);
console.log(`   Medium Severity: ${issues.filter(i => i.severity === 'MEDIUM').length}`);
console.log(`   Low Severity: ${issues.filter(i => i.severity === 'LOW').length}`);
console.log('\n✅ Audit complete!\n');

// Exit with error code if high severity issues found
if (issues.filter(i => i.severity === 'HIGH').length > 0) {
  process.exit(1);
}
