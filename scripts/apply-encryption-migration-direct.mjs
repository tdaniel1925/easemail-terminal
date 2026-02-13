#!/usr/bin/env node

/**
 * Apply Encryption Migration to Remote Database
 * Uses direct SQL execution via Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

console.log('🔐 Applying Encryption Migration to Remote Database...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define the SQL statements individually
const statements = [
  {
    name: 'Enable pgcrypto extension',
    sql: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
  },
  {
    name: 'Create encrypt_api_key function',
    sql: `
      CREATE OR REPLACE FUNCTION encrypt_api_key(plaintext TEXT, encryption_key TEXT)
      RETURNS TEXT AS $function$
      BEGIN
          RETURN encode(
              encrypt(
                  plaintext::bytea,
                  encryption_key::bytea,
                  'aes'
              ),
              'base64'
          );
      END;
      $function$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  },
  {
    name: 'Create decrypt_api_key function',
    sql: `
      CREATE OR REPLACE FUNCTION decrypt_api_key(ciphertext TEXT, encryption_key TEXT)
      RETURNS TEXT AS $function$
      BEGIN
          RETURN convert_from(
              decrypt(
                  decode(ciphertext, 'base64'),
                  encryption_key::bytea,
                  'aes'
              ),
              'utf8'
          );
      EXCEPTION
          WHEN OTHERS THEN
              RETURN NULL;
      END;
      $function$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  }
];

// Execute each statement
for (const statement of statements) {
  try {
    console.log(`📝 ${statement.name}...`);

    // Use the SQL editor interface
    const { data, error } = await supabase.rpc('exec_sql', {
      query: statement.sql
    });

    if (error) {
      // Try alternative: Use a raw query approach
      // Note: Supabase client doesn't support raw SQL execution directly
      // We need to use the REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ query: statement.sql })
      });

      if (!response.ok) {
        console.log(`   ⚠️  Direct execution not supported via REST API`);
        console.log(`   ℹ️  You'll need to apply this via Supabase Dashboard SQL Editor`);
      } else {
        console.log(`   ✅ ${statement.name} - Success`);
      }
    } else {
      console.log(`   ✅ ${statement.name} - Success`);
    }
  } catch (err) {
    console.log(`   ⚠️  Could not execute directly: ${err.message}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('\n💡 MIGRATION APPLICATION METHODS:\n');

console.log('METHOD 1: Supabase Dashboard SQL Editor (RECOMMENDED)\n');
console.log('1. Go to: https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb/sql/new');
console.log('2. Copy and paste the following SQL:\n');

console.log('--- START SQL ---');
statements.forEach(stmt => {
  console.log(`-- ${stmt.name}`);
  console.log(stmt.sql.trim());
  console.log('');
});
console.log('--- END SQL ---\n');

console.log('METHOD 2: Install PostgreSQL client and run:\n');
console.log('psql "postgresql://postgres.bfswjaswmfwvpwvrsqdb:ttandSellaBella1234@aws-0-us-west-2.pooler.supabase.com:5432/postgres" -f supabase/migrations/20260213_encrypt_api_keys.sql\n');

console.log('After applying, verify with:');
console.log('   node scripts/deploy-check.mjs\n');
