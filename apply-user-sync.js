const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://bfswjaswmfwvpwvrsqdb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmc3dqYXN3bWZ3dnB3dnJzcWRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk5NTE1NywiZXhwIjoyMDg1NTcxMTU3fQ.0aG1V7HnAvTXz8dqbdBlEzqJhxBsz4st5MtFVdDUuBA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyUserSyncMigration() {
  console.log('🔄 Applying user sync trigger migration...\n');

  const migration = fs.readFileSync('supabase/migrations/004_add_user_sync_trigger.sql', 'utf8');

  // Apply migration using Supabase Admin API
  const { data, error } = await supabase.rpc('exec_sql', { sql: migration }).catch(async () => {
    // If RPC doesn't work, use direct SQL execution
    console.log('Attempting to apply migration via SQL editor...');
    console.log('\n📋 Please run this SQL in Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/bfswjaswmfwvrsqdb/editor');
    console.log('\n' + migration);
    return { data: null, error: null };
  });

  if (error) {
    console.error('❌ Error:', error);
    console.log('\n📝 Manual Steps Required:');
    console.log('1. Go to: https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the migration from: supabase/migrations/004_add_user_sync_trigger.sql');
    console.log('4. Run the migration');
  } else {
    console.log('✅ Migration applied successfully!');
  }

  // Now sync any existing auth users
  console.log('\n🔄 Checking for existing auth users to sync...\n');

  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }

  if (users && users.length > 0) {
    console.log(`Found ${users.length} auth user(s). Syncing to public.users...`);

    for (const user of users) {
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
        }, {
          onConflict: 'id'
        });

      if (insertError) {
        console.error(`❌ Failed to sync user ${user.email}:`, insertError);
      } else {
        console.log(`✅ Synced: ${user.email}`);
      }
    }
  } else {
    console.log('No auth users found to sync.');
  }

  console.log('\n✅ User sync complete! You can now connect your email.');
}

applyUserSyncMigration().catch(console.error);
