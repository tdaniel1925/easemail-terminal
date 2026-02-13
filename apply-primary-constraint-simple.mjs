#!/usr/bin/env node

import pkg from 'pg';
const { Client } = pkg;
import { config } from 'dotenv';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

async function applyMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('🔧 Applying migration: unique_primary_account_per_user\n');

    // Step 1: Drop index if exists
    console.log('Step 1: Dropping existing index (if exists)...');
    try {
      await client.query('DROP INDEX IF EXISTS unique_primary_per_user;');
      console.log('✅ Old index dropped (if existed)\n');
    } catch (err) {
      console.log('ℹ️  No existing index to drop\n');
    }

    // Step 2: Create the unique index
    console.log('Step 2: Creating unique index...');
    const createIndexSQL = `
      CREATE UNIQUE INDEX unique_primary_per_user
      ON email_accounts (user_id)
      WHERE is_primary = true;
    `;

    await client.query(createIndexSQL);
    console.log('✅ Unique index created!\n');

    // Step 3: Add comment
    console.log('Step 3: Adding index comment...');
    const commentSQL = `
      COMMENT ON INDEX unique_primary_per_user IS
      'Ensures each user can have only one primary email account. Prevents API errors when querying for primary account with .single()';
    `;

    await client.query(commentSQL);
    console.log('✅ Comment added\n');

    // Verify the index exists
    console.log('🔍 Verifying index creation...\n');
    const verifySQL = `
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'email_accounts'
      AND indexname = 'unique_primary_per_user';
    `;

    const result = await client.query(verifySQL);

    if (result.rows.length > 0) {
      console.log('✅ Index verified:');
      console.log(`   Name: ${result.rows[0].indexname}`);
      console.log(`   Definition: ${result.rows[0].indexdef}`);
      console.log('');
      console.log('🎉 SUCCESS! Migration applied successfully!');
      console.log('');
      console.log('💡 What this does:');
      console.log('   - Prevents users from having multiple primary accounts');
      console.log('   - Fixes the 400 errors in compose/categorize endpoints');
      console.log('   - Ensures .single() queries work correctly');
    } else {
      console.log('⚠️  Warning: Index not found after creation');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code === '23505') {
      console.error('\n💡 This means a duplicate primary account still exists.');
      console.error('   Run: node fix-primary-account.mjs');
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

applyMigration();
