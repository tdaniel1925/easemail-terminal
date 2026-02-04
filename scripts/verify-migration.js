const { createClient } = require('@supabase/supabase-js');

async function verifyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🔍 Verifying migration for organization_invites table...\n');

  try {
    // Test 1: Check if we can select all columns including the new ones
    const { data, error } = await supabase
      .from('organization_invites')
      .select('id, email, role, token, expires_at, accepted_at')
      .limit(1);

    if (error) {
      console.error('❌ Error querying organization_invites:', error.message);

      if (error.message.includes('token') || error.message.includes('expires_at')) {
        console.log('\n⚠️  The token or expires_at columns are missing!');
        console.log('Please make sure you ran the migration SQL in the Supabase Dashboard.');
      }

      process.exit(1);
    }

    console.log('✅ Successfully queried organization_invites table');
    console.log('✅ Columns exist: id, email, role, token, expires_at, accepted_at');

    // Test 2: Verify column structure
    console.log('\n📊 Sample data structure:');
    if (data && data.length > 0) {
      console.log('   Existing invites found:', data.length);
      console.log('   Sample:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('   No existing invites (this is normal for a new system)');
    }

    console.log('\n🎉 Migration verification SUCCESSFUL!');
    console.log('✅ The organization invite system is ready to use!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to https://easemail-terminal.vercel.app');
    console.log('   2. Login as an organization owner/admin');
    console.log('   3. Navigate to your organization page');
    console.log('   4. Click "Invite Member" to test the invite flow');
    console.log('   5. Check your email for the beautiful invite');
    console.log('   6. Click the invite link to test acceptance');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

verifyMigration();
