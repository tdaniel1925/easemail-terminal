#!/usr/bin/env node

import { readFileSync } from 'fs';
import postgres from 'postgres';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

console.log('🔐 Applying Encryption Migration to Remote Database...\n');

// Get connection string from env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.log('\nPlease set your Supabase database connection string:');
  console.log('You can find it in: Supabase Dashboard > Settings > Database > Connection string (Direct)');
  process.exit(1);
}

const sql = postgres(connectionString, {
  max: 1,
  ssl: 'require'
});

async function applyMigration() {
  console.log('📖 Reading migration file...');
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260213_encrypt_api_keys.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf8');

  console.log('📝 Parsing migration statements...\n');

  // Split into individual statements, handling functions properly
  // Functions use $$ ... $$ delimiters
  const lines = migrationSQL.split('\n');
  const statements = [];
  let current = '';
  let inFunction = false;
  let dollarCount = 0;

  for (const line of lines) {
    // Skip comment-only lines
    if (line.trim().startsWith('--') && current.trim() === '') {
      continue;
    }

    current += line + '\n';

    // Track $$ for function bodies
    const matches = line.match(/\$\$/g);
    if (matches) {
      dollarCount += matches.length;
      inFunction = dollarCount % 2 !== 0;
    }

    // Complete statement when we hit ; outside of function
    if (line.trim().endsWith(';') && !inFunction) {
      const stmt = current.trim();
      if (stmt.length > 0 && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\s+/g, ' ');

    try {
      await sql.unsafe(stmt);
      console.log(`[${i + 1}/${statements.length}] ✅ ${preview}...`);
      success++;
    } catch (error) {
      // Some errors are expected (like "already exists")
      if (
        error.message?.includes('already exists') ||
        error.message?.includes('does not exist') ||
        error.message?.includes('duplicate')
      ) {
        console.log(`[${i + 1}/${statements.length}] ⚠️  ${preview}...`);
        console.log(`         Already exists (skipping)`);
        skipped++;
      } else {
        console.log(`[${i + 1}/${statements.length}] ❌ ${preview}...`);
        console.log(`         Error: ${error.message.split('\n')[0]}`);
        failed++;
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`📊 Migration Results:`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ⚠️  Skipped: ${skipped} (already exist)`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('='.repeat(70));

  if (failed > 0) {
    console.log('\n⚠️  Some statements failed. Check errors above.');
  } else {
    console.log('\n✅ Encryption migration applied successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify with: node scripts/deploy-check.mjs');
    console.log('2. Test encryption: Check that new organizations encrypt API keys');
  }

  await sql.end();
}

applyMigration().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
