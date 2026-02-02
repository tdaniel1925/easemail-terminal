const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bfswjaswmfwvpwvrsqdb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmc3dqYXN3bWZ3dnB3dnJzcWRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk5NTE1NywiZXhwIjoyMDg1NTcxMTU3fQ.0aG1V7HnAvTXz8dqbdBlEzqJhxBsz4st5MtFVdDUuBA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncUsers() {
  console.log('🔄 Fetching auth users...\n');

  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error:', authError);
    return;
  }

  console.log(`Found ${users.length} user(s) in auth.users\n`);

  if (users.length === 0) {
    console.log('⚠️  No users found. You need to sign up first!');
    return;
  }

  for (const user of users) {
    console.log(`Syncing: ${user.email} (${user.id})`);
    
    const { error: insertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (insertError) {
      console.error(`  ❌ Error:`, insertError.message);
    } else {
      console.log(`  ✅ Synced successfully!`);
    }
  }

  console.log('\n✅ User sync complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Apply the trigger migration manually in Supabase Dashboard');
  console.log('2. Try connecting your email again');
}

syncUsers().catch(console.error);
