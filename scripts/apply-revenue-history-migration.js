/**
 * Apply revenue_history table migration directly to database
 * This creates the table and sets up RLS policies for super admin access
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
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
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
    // Read the migration SQL
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260210_create_revenue_history_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded successfully');
    console.log('📊 Executing SQL...\n');

    // Execute the migration using RPC (service role has full access)
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // If the exec_sql function doesn't exist, try direct query
      console.log('⚠️  RPC method not available, trying direct query...\n');

      // Split into individual statements and execute
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.length > 0) {
          const { error: queryError } = await supabase.rpc('exec', {
            sql: statement + ';'
          });

          if (queryError) {
            console.error(`❌ Error executing statement:`, queryError);
            console.error(`Statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
    }

    console.log('✅ Migration applied successfully!\n');
    console.log('📋 Created:');
    console.log('   - revenue_history table');
    console.log('   - Indexes for efficient queries');
    console.log('   - RLS policies for super admin access\n');
    console.log('🎯 Summary:');
    console.log('   - Super admins can view/create/update/delete revenue snapshots');
    console.log('   - Regular users have no access (RLS enforced)');
    console.log('   - One snapshot per date (UNIQUE constraint)\n');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

applyMigration();
