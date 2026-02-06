import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bfswjaswmfwvpwvrsqdb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmc3dqYXN3bWZ3dnB3dnJzcWRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk5NTE1NywiZXhwIjoyMDg1NTcxMTU3fQ.0aG1V7HnAvTXz8dqbdBlEzqJhxBsz4st5MtFVdDUuBA';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function makeSuperAdmin() {
  const email = 'tdaniel@botmakers.ai';

  console.log(`Making ${email} a super admin...`);

  // Update user to be super admin
  const { data, error } = await supabase
    .from('users')
    .update({ is_super_admin: true })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.error(`No user found with email ${email}`);
    console.log('Checking if user exists...');

    const { data: userData, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (checkError) {
      console.error('Error checking user:', checkError);
      process.exit(1);
    }

    if (!userData || userData.length === 0) {
      console.error(`User ${email} does not exist in database. Please sign up first.`);
      process.exit(1);
    }

    console.log('User exists:', userData[0]);
    process.exit(1);
  }

  console.log('✅ Success! User is now a super admin:');
  console.log('   Email:', data[0].email);
  console.log('   Super Admin:', data[0].is_super_admin);
  console.log('   User ID:', data[0].id);

  // Verify
  const { data: verifyData } = await supabase
    .from('users')
    .select('email, is_super_admin, id')
    .eq('email', email)
    .single();

  if (verifyData) {
    console.log('\n✅ Verified:', verifyData);
  }
}

makeSuperAdmin();
