#!/usr/bin/env node

/**
 * Push all environment variables from .env.local to Vercel
 * Usage: node push-env-to-vercel.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Pushing environment variables to Vercel...\n');

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.error('❌ Error: .env.local file not found');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const lines = envContent.split('\n');

let success = 0;
let skipped = 0;
const errors = [];

console.log('📝 Processing environment variables...\n');

for (const line of lines) {
  // Skip empty lines and comments
  if (!line.trim() || line.trim().startsWith('#')) {
    continue;
  }

  // Parse key=value
  const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!match) {
    continue;
  }

  const [, key, value] = match;

  // Remove quotes if present
  let cleanValue = value.trim();
  if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
      (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
    cleanValue = cleanValue.slice(1, -1);
  }

  try {
    console.log(`Setting ${key}...`);

    // Try to add to production, preview, and development
    for (const env of ['production', 'preview', 'development']) {
      try {
        execSync(
          `npx vercel env add ${key} ${env}`,
          {
            input: cleanValue + '\n',
            stdio: ['pipe', 'pipe', 'pipe'],
            encoding: 'utf-8'
          }
        );
      } catch (err) {
        // Variable might already exist, that's okay
        if (err.message.includes('already exists')) {
          // Try to remove and re-add
          try {
            execSync(`npx vercel env rm ${key} ${env} --yes`, { stdio: 'ignore' });
            execSync(
              `npx vercel env add ${key} ${env}`,
              {
                input: cleanValue + '\n',
                stdio: ['pipe', 'pipe', 'pipe'],
                encoding: 'utf-8'
              }
            );
          } catch (removeErr) {
            // Couldn't remove, skip
          }
        }
      }
    }

    success++;
    console.log(`  ✅ ${key} set successfully\n`);
  } catch (error) {
    skipped++;
    errors.push({ key, error: error.message });
    console.log(`  ⚠️  ${key} skipped (may already exist)\n`);
  }
}

console.log('\n═══════════════════════════════════════');
console.log(`✅ Successfully set: ${success}`);
console.log(`⚠️  Skipped: ${skipped}`);
console.log('═══════════════════════════════════════\n');

if (errors.length > 0 && errors.length < 10) {
  console.log('Errors:');
  errors.forEach(({ key, error }) => {
    console.log(`  - ${key}: ${error}`);
  });
  console.log('');
}

console.log('🎉 Done! Your environment variables are set.');
console.log('\n💡 Next steps:');
console.log('   1. Verify in Vercel Dashboard: https://vercel.com/dashboard');
console.log('   2. Redeploy your project:');
console.log('      npx vercel --prod');
console.log('');
