#!/usr/bin/env node

/**
 * Pre-Deployment Safety Check Script
 *
 * Verifies all prerequisites are met before deploying critical fixes:
 * - Seat counting fix
 * - API key encryption
 * - Calendar timezone fix
 * - Multi-account support
 *
 * Run this before deploying to production!
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const { green, red, yellow, blue, cyan, bold, reset } = colors;

console.log(`
${cyan}╔════════════════════════════════════════════════════════════╗
║        EASEMAIL PRE-DEPLOYMENT SAFETY CHECK                ║
║        Critical Fixes Validation                           ║
╚════════════════════════════════════════════════════════════╝${reset}
`);

let allChecksPassed = true;
const warnings = [];
const errors = [];

// ==============================================================================
// CHECK 1: Environment Variables
// ==============================================================================

console.log(`${bold}📋 CHECK 1: Environment Variables${reset}\n`);

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ENCRYPTION_KEY',
  'RESEND_API_KEY',
];

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (!value) {
    console.log(`${red}   ✗ ${envVar} - NOT SET${reset}`);
    errors.push(`Missing environment variable: ${envVar}`);
    allChecksPassed = false;
  } else {
    const displayValue = envVar.includes('KEY') || envVar.includes('SECRET')
      ? `${value.substring(0, 8)}...[REDACTED]`
      : value;
    console.log(`${green}   ✓ ${envVar} - ${displayValue}${reset}`);
  }
}

// Check ENCRYPTION_KEY length
if (process.env.ENCRYPTION_KEY) {
  const keyLength = process.env.ENCRYPTION_KEY.length;
  if (keyLength < 32) {
    console.log(`${red}   ✗ ENCRYPTION_KEY too short (${keyLength} chars, need 32+)${reset}`);
    errors.push('ENCRYPTION_KEY must be at least 32 characters for AES-256');
    allChecksPassed = false;
  } else {
    console.log(`${green}   ✓ ENCRYPTION_KEY length valid (${keyLength} chars)${reset}`);
  }
}

console.log('');

// ==============================================================================
// CHECK 2: Database Connection & Migration
// ==============================================================================

console.log(`${bold}📋 CHECK 2: Database Connection & Migrations${reset}\n`);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test connection
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log(`${red}   ✗ Database connection failed: ${error.message}${reset}`);
      errors.push('Cannot connect to database');
      allChecksPassed = false;
    } else {
      console.log(`${green}   ✓ Database connection successful${reset}`);
    }
  } catch (err) {
    console.log(`${red}   ✗ Database connection error: ${err.message}${reset}`);
    errors.push('Database connection failed');
    allChecksPassed = false;
  }

  // Check if encryption functions exist
  try {
    const { data, error } = await supabase.rpc('encrypt_api_key', {
      plaintext: 'test',
      encryption_key: process.env.ENCRYPTION_KEY || 'test-key',
    });

    if (error && error.message.includes('does not exist')) {
      console.log(`${red}   ✗ Encryption functions not found in database${reset}`);
      console.log(`${yellow}      Run: npx supabase migration up${reset}`);
      errors.push('Database migration not applied');
      allChecksPassed = false;
    } else if (error) {
      console.log(`${yellow}   ⚠ Encryption function test failed: ${error.message}${reset}`);
      warnings.push('Encryption function exists but test failed - may need valid key');
    } else {
      console.log(`${green}   ✓ Encryption functions available${reset}`);
    }
  } catch (err) {
    console.log(`${yellow}   ⚠ Could not test encryption functions: ${err.message}${reset}`);
    warnings.push('Encryption function check inconclusive');
  }
} else {
  console.log(`${red}   ✗ Skipped - missing Supabase credentials${reset}`);
}

console.log('');

// ==============================================================================
// CHECK 3: Critical Files Exist
// ==============================================================================

console.log(`${bold}📋 CHECK 3: Critical Files${reset}\n`);

const criticalFiles = [
  'lib/encryption/api-keys.ts',
  'lib/utils/account-utils.ts',
  'supabase/migrations/20260213_encrypt_api_keys.sql',
  'app/api/messages/[id]/route.ts',
  'components/features/create-event-dialog.tsx',
  'lib/msgraph.ts',
];

for (const file of criticalFiles) {
  const fullPath = join(__dirname, '..', file);
  if (existsSync(fullPath)) {
    console.log(`${green}   ✓ ${file}${reset}`);
  } else {
    console.log(`${red}   ✗ ${file} - NOT FOUND${reset}`);
    errors.push(`Missing file: ${file}`);
    allChecksPassed = false;
  }
}

console.log('');

// ==============================================================================
// CHECK 4: Code Verification (Spot Checks)
// ==============================================================================

console.log(`${bold}📋 CHECK 4: Code Verification${reset}\n`);

// Check 4.1: Seat counting fix
try {
  const inviteAcceptPath = join(__dirname, '..', 'app/api/organization/invitations/[invitationId]/accept/route.ts');
  if (existsSync(inviteAcceptPath)) {
    const content = readFileSync(inviteAcceptPath, 'utf-8');
    if (content.includes("role === 'MEMBER'") && content.includes('Skipping seat increment')) {
      console.log(`${green}   ✓ Seat counting fix applied${reset}`);
    } else {
      console.log(`${red}   ✗ Seat counting fix NOT found${reset}`);
      errors.push('Seat counting fix missing');
      allChecksPassed = false;
    }
  }
} catch (err) {
  console.log(`${yellow}   ⚠ Could not verify seat counting fix${reset}`);
  warnings.push('Seat counting verification failed');
}

// Check 4.2: Encryption import
try {
  const wizardPath = join(__dirname, '..', 'app/api/admin/organizations/wizard/route.ts');
  if (existsSync(wizardPath)) {
    const content = readFileSync(wizardPath, 'utf-8');
    if (content.includes('encryptApiKey') && content.includes('lib/encryption/api-keys')) {
      console.log(`${green}   ✓ API key encryption import found${reset}`);
    } else {
      console.log(`${red}   ✗ API key encryption import NOT found${reset}`);
      errors.push('Encryption import missing in wizard');
      allChecksPassed = false;
    }
  }
} catch (err) {
  console.log(`${yellow}   ⚠ Could not verify encryption import${reset}`);
  warnings.push('Encryption import verification failed');
}

// Check 4.3: Timezone fix
try {
  const msGraphPath = join(__dirname, '..', 'lib/msgraph.ts');
  if (existsSync(msGraphPath)) {
    const content = readFileSync(msGraphPath, 'utf-8');
    if (content.includes('timezone?: string') && content.includes('meetingDetails.timezone')) {
      console.log(`${green}   ✓ Timezone fix applied${reset}`);
    } else {
      console.log(`${red}   ✗ Timezone fix NOT found${reset}`);
      errors.push('Timezone fix missing');
      allChecksPassed = false;
    }
  }
} catch (err) {
  console.log(`${yellow}   ⚠ Could not verify timezone fix${reset}`);
  warnings.push('Timezone verification failed');
}

// Check 4.4: Multi-account support
try {
  const messagesPath = join(__dirname, '..', 'app/api/messages/[id]/route.ts');
  if (existsSync(messagesPath)) {
    const content = readFileSync(messagesPath, 'utf-8');
    if (content.includes('getUserEmailAccount') && content.includes('account-utils')) {
      console.log(`${green}   ✓ Multi-account support added${reset}`);
    } else {
      console.log(`${red}   ✗ Multi-account support NOT found${reset}`);
      errors.push('Multi-account support missing');
      allChecksPassed = false;
    }
  }
} catch (err) {
  console.log(`${yellow}   ⚠ Could not verify multi-account support${reset}`);
  warnings.push('Multi-account verification failed');
}

console.log('');

// ==============================================================================
// CHECK 5: Git Status
// ==============================================================================

console.log(`${bold}📋 CHECK 5: Git Status${reset}\n`);

try {
  const { execSync } = await import('child_process');

  // Check if on main branch
  const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  if (branch === 'main') {
    console.log(`${green}   ✓ On main branch${reset}`);
  } else {
    console.log(`${yellow}   ⚠ On branch: ${branch} (not main)${reset}`);
    warnings.push(`Currently on ${branch}, not main`);
  }

  // Check for uncommitted changes
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (status.trim() === '') {
    console.log(`${green}   ✓ No uncommitted changes${reset}`);
  } else {
    console.log(`${yellow}   ⚠ Uncommitted changes detected${reset}`);
    warnings.push('Uncommitted changes present');
  }

  // Check if pushed to remote
  try {
    const unpushed = execSync('git log @{u}.. --oneline', { encoding: 'utf-8' });
    if (unpushed.trim() === '') {
      console.log(`${green}   ✓ All commits pushed to remote${reset}`);
    } else {
      console.log(`${yellow}   ⚠ Unpushed commits detected${reset}`);
      console.log(`${yellow}      Run: git push${reset}`);
      warnings.push('Unpushed commits present');
    }
  } catch (err) {
    console.log(`${yellow}   ⚠ Could not check remote status${reset}`);
  }

} catch (err) {
  console.log(`${yellow}   ⚠ Git checks skipped: ${err.message}${reset}`);
}

console.log('');

// ==============================================================================
// SUMMARY
// ==============================================================================

console.log(`${cyan}════════════════════════════════════════════════════════════${reset}\n`);
console.log(`${bold}📊 DEPLOYMENT READINESS SUMMARY${reset}\n`);

if (errors.length > 0) {
  console.log(`${red}${bold}❌ CRITICAL ERRORS (${errors.length}):${reset}`);
  errors.forEach((error, i) => {
    console.log(`${red}   ${i + 1}. ${error}${reset}`);
  });
  console.log('');
}

if (warnings.length > 0) {
  console.log(`${yellow}${bold}⚠️  WARNINGS (${warnings.length}):${reset}`);
  warnings.forEach((warning, i) => {
    console.log(`${yellow}   ${i + 1}. ${warning}${reset}`);
  });
  console.log('');
}

if (allChecksPassed && errors.length === 0) {
  console.log(`${green}${bold}✅ ALL CHECKS PASSED!${reset}`);
  console.log(`${green}   Your deployment is ready.${reset}\n`);

  if (warnings.length > 0) {
    console.log(`${yellow}   Note: ${warnings.length} warning(s) detected but not blocking.${reset}\n`);
  }

  console.log(`${cyan}Next steps:${reset}`);
  console.log(`   1. Add ENCRYPTION_KEY to production environment`);
  console.log(`   2. Run: npx supabase migration up (if not done)`);
  console.log(`   3. Deploy via: npm run build && npm start`);
  console.log(`   4. Run post-deployment tests`);
  console.log('');
  process.exit(0);
} else {
  console.log(`${red}${bold}❌ DEPLOYMENT BLOCKED${reset}`);
  console.log(`${red}   ${errors.length} critical error(s) must be fixed before deploying.${reset}\n`);

  console.log(`${cyan}Required actions:${reset}`);
  if (errors.some(e => e.includes('ENCRYPTION_KEY'))) {
    console.log(`   • Set ENCRYPTION_KEY environment variable (32+ chars)`);
  }
  if (errors.some(e => e.includes('migration'))) {
    console.log(`   • Run database migration: npx supabase migration up`);
  }
  if (errors.some(e => e.includes('Database connection'))) {
    console.log(`   • Check Supabase credentials in .env.local`);
  }
  if (errors.some(e => e.includes('Missing file'))) {
    console.log(`   • Ensure all files are committed: git add . && git commit`);
  }

  console.log('');
  process.exit(1);
}
