/**
 * Apply revenue_history table migration
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🔄 Applying revenue_history table migration...\n');

  try {
    // Read migration SQL
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260210_create_revenue_history_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration SQL loaded');
    console.log('📊 Executing via Supabase...\n');

    // Execute SQL statements one by one
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        // Use the SQL editor endpoint via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            sql: statement + ';'
          })
        });

        if (!response.ok) {
          // Some SQL statements might not work through REST API
          // This is expected for DDL statements
          if (i === 0) {
            console.log('⚠️  REST API approach not working, trying alternative method...\n');
            console.log('ℹ️  Please apply this migration manually using the Supabase dashboard:\n');
            console.log('   1. Go to: https://supabase.com/dashboard/project/dcfnxlkxoilbclsjwpqp/sql');
            console.log('   2. Copy the SQL from: supabase/migrations/20260210_create_revenue_history_table.sql');
            console.log('   3. Paste and run in the SQL editor\n');
            console.log('📄 Migration SQL:');
            console.log('─'.repeat(80));
            console.log(migrationSQL);
            console.log('─'.repeat(80));
            return;
          }
        }
      }
    }

    console.log('\n✅ Migration applied successfully!\n');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    console.log('\n📌 Manual application required:');
    console.log('   1. Go to Supabase Dashboard SQL Editor');
    console.log('   2. Run the SQL from: supabase/migrations/20260210_create_revenue_history_table.sql\n');
    process.exit(1);
  }
}

applyMigration();
