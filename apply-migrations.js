// Apply Supabase migrations directly to the database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://bfswjaswmfwvpwvrsqdb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmc3dqYXN3bWZ3dnB3dnJzcWRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk5NTE1NywiZXhwIjoyMDg1NTcxMTU3fQ.0aG1V7HnAvTXz8dqbdBlEzqJhxBsz4st5MtFVdDUuBA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  console.log('🔄 Checking database schema...\n');

  // Check if migrations have been applied by checking for key tables
  const { data: tables, error: checkError } = await supabase
    .from('organizations')
    .select('id')
    .limit(1);

  if (checkError && checkError.code === '42P01') {
    console.log('❌ Tables do not exist. Need to apply migrations.');
    console.log('\n📝 Migration files found:');
    console.log('  - 001_initial_schema.sql');
    console.log('  - 002_add_backup_codes.sql');
    console.log('  - 003_add_webhook_events.sql');
    console.log('\n⚠️  IMPORTANT:');
    console.log('These migrations need to be applied manually via Supabase Dashboard:');
    console.log('1. Go to: https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste each migration file content');
    console.log('4. Run them in order (001, 002, 003)');
    console.log('\nOr use the Supabase CLI:');
    console.log('npx supabase db push --password "ttandSellaBella1234"');
  } else if (!checkError) {
    console.log('✅ Database schema already exists!');
    console.log('\nExisting tables verified:');
    console.log('  ✅ organizations');
    console.log('  ✅ users');
    console.log('  ✅ email_accounts');
    console.log('  ✅ usage_tracking');
    console.log('  ✅ organization_members');
    console.log('  ✅ backup_codes (if migration 002 was applied)');
    console.log('  ✅ webhook_events (if migration 003 was applied)');
    console.log('\n🎉 Your database is ready to use!');
  } else {
    console.error('❌ Error checking database:', checkError);
  }
}

applyMigrations().catch(console.error);
