import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function setSuperAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node set-super-admin-users-table.mjs <email>');
    process.exit(1);
  }

  console.log(`Setting ${email} as super admin in users table...`);

  try {
    // Update in users table
    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        is_super_admin: true
      })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      process.exit(1);
    }

    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    console.log('✅ Success! User is now a super admin!');
    console.log('   Email:', user.email);
    console.log('   User ID:', user.id);
    console.log('   Super Admin:', user.is_super_admin);
    console.log('\nPlease refresh your browser to see the Admin link in the sidebar.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setSuperAdmin();
