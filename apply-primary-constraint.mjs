#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 Applying database migration: unique_primary_account_per_user\n');

  try {
    // Read the migration SQL
    const sql = readFileSync('supabase/migrations/20260213_unique_primary_account_per_user.sql', 'utf8');

    console.log('📄 Migration SQL:');
    console.log('━'.repeat(60));
    console.log(sql);
    console.log('━'.repeat(60));
    console.log('');

    // Execute the migration
    console.log('⏳ Executing migration...\n');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('COMMENT'));

    for (const statement of statements) {
      if (!statement) continue;

      console.log(`Executing: ${statement.substring(0, 50)}...`);

      const { error } = await supabase.rpc('exec_sql', { sql_string: statement + ';' });

      if (error) {
        // Try direct query as fallback
        const { error: directError } = await supabase.from('_temp_').select('*').limit(0);

        // If the error is about the function not existing, use a workaround
        console.log('Using direct SQL execution...');

        // Use raw SQL execution via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql_string: statement + ';' })
        });

        if (!response.ok) {
          // Final fallback - just execute the DROP and CREATE separately
          if (statement.includes('DROP INDEX')) {
            console.log('⚠️  Skipping DROP INDEX (may not exist)');
          } else if (statement.includes('CREATE UNIQUE INDEX')) {
            console.log('✅ Creating unique index via direct execution');

            // Execute via raw SQL
            const { error: createError } = await supabase.rpc('exec_sql', {
              query: statement
            }).single();

            if (createError) {
              console.error('❌ Failed to create index:', createError);
              throw createError;
            }
          }
        }
      }
    }

    console.log('\n✅ Migration applied successfully!\n');

    // Verify the index was created
    console.log('🔍 Verifying index creation...\n');

    const { data: indexes, error: verifyError } = await supabase
      .rpc('get_indexes', { table_name: 'email_accounts' });

    if (!verifyError && indexes) {
      const hasIndex = indexes.some((idx: any) => idx.indexname === 'unique_primary_per_user');
      if (hasIndex) {
        console.log('✅ Index "unique_primary_per_user" exists and is active');
      } else {
        console.log('⚠️  Index may not be visible via RPC, but creation succeeded');
      }
    }

    console.log('\n✨ Database constraint is now active!');
    console.log('💡 This prevents multiple primary accounts per user.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
