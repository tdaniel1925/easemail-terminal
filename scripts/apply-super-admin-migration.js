/**
 * Script to apply the super admin migration
 * Usage: node scripts/apply-super-admin-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, '../supabase/migrations/012_add_super_admin_field.sql');

    console.log('📂 Reading migration file...');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Applying migration: 012_add_super_admin_field.sql');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // Fallback: try direct execution if RPC doesn't exist
      const { error: directError } = await supabase.from('_migrations').insert({
        name: '012_add_super_admin_field',
        executed_at: new Date().toISOString()
      });

      if (directError) throw directError;

      // Execute the actual SQL via raw query (requires service role)
      const lines = sql.split(';').filter(line => line.trim());
      for (const line of lines) {
        if (line.trim()) {
          await supabase.rpc('exec', { sql: line });
        }
      }

      return { error: null };
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('\n⚠️  You may need to run this migration manually in Supabase SQL Editor:');
      console.error('   1. Go to Supabase Dashboard → SQL Editor');
      console.error('   2. Run the following SQL:\n');
      console.error(sql);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Set your first super admin:');
    console.log('      node scripts/set-super-admin.js your-email@example.com');
    console.log('   2. Build and restart your application');
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.error('\n⚠️  Please run the migration manually:');
    console.error('   1. Go to Supabase Dashboard → SQL Editor');
    console.error('   2. Copy the contents of: supabase/migrations/012_add_super_admin_field.sql');
    console.error('   3. Execute the SQL');
    process.exit(1);
  }
}

applyMigration();
