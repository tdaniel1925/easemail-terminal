#!/usr/bin/env node

/**
 * Apply Encryption Migration to Remote Database
 *
 * Applies the 20260213_encrypt_api_keys.sql migration directly
 * to the production database.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

console.log('🔐 Applying Encryption Migration...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read the migration file
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260213_encrypt_api_keys.sql');
let migrationSQL;

try {
  migrationSQL = readFileSync(migrationPath, 'utf-8');
  console.log('✓ Migration file loaded');
} catch (err) {
  console.error('❌ Failed to read migration file:', err.message);
  process.exit(1);
}

// Split the migration into individual statements
// We need to execute each statement separately because Supabase RPC doesn't support multiple statements
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

console.log(`\n📝 Found ${statements.length} SQL statements to execute\n`);

// Execute each statement
for (let i = 0; i < statements.length; i++) {
  const statement = statements[i] + ';';

  // Skip comments
  if (statement.startsWith('--') || statement.startsWith('/*')) {
    continue;
  }

  console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

  try {
    // Execute using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

    if (error) {
      // Try alternative approach - direct query execution
      const { error: directError } = await supabase.from('_migrations').select('*').limit(0);

      console.log(`⚠️  RPC method not available, using Supabase Dashboard is recommended`);
      console.log(`   Statement: ${statement.substring(0, 100)}...`);

      // For critical functions, we can test if they exist
      if (statement.includes('CREATE OR REPLACE FUNCTION encrypt_api_key')) {
        console.log('   → This is the encrypt_api_key function');
      } else if (statement.includes('CREATE OR REPLACE FUNCTION decrypt_api_key')) {
        console.log('   → This is the decrypt_api_key function');
      } else if (statement.includes('CREATE EXTENSION IF NOT EXISTS pgcrypto')) {
        console.log('   → This enables the pgcrypto extension');
      }
    } else {
      console.log('✓ Statement executed successfully');
    }
  } catch (err) {
    console.log(`⚠️  Statement execution method not available: ${err.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANT: Direct SQL execution via API may not be supported.\n');
console.log('Please apply the migration using ONE of these methods:\n');
console.log('1. Supabase Dashboard (RECOMMENDED):');
console.log('   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
console.log('   - Copy contents of: supabase/migrations/20260213_encrypt_api_keys.sql');
console.log('   - Paste and run the SQL\n');

console.log('2. Supabase CLI (if linked to project):');
console.log('   - Run: npx supabase link --project-ref YOUR_PROJECT_REF');
console.log('   - Then: npx supabase db push\n');

console.log('3. Direct PostgreSQL Connection:');
console.log('   - Get connection string from Supabase Dashboard');
console.log('   - Run: psql YOUR_CONNECTION_STRING -f supabase/migrations/20260213_encrypt_api_keys.sql\n');

console.log('Migration file location:');
console.log(`   ${migrationPath}\n`);

console.log('After applying the migration, run the deployment check again:');
console.log('   node scripts/deploy-check.mjs\n');
