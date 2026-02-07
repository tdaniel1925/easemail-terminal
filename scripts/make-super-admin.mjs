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

async function makeSuperAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node make-super-admin.mjs <email>');
    process.exit(1);
  }

  console.log(`Making ${email} a super admin...`);

  try {
    // Get user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      process.exit(1);
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      console.error(`User not found: ${email}`);
      console.error('Please create the account first.');
      process.exit(1);
    }

    console.log('Found user:', user.id);

    // Check if already a super admin
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (existingProfile?.is_super_admin) {
      console.log('✓ User is already a super admin!');
      process.exit(0);
    }

    // Make user a super admin
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_super_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      process.exit(1);
    }

    console.log('✅ Success! User is now a super admin!');
    console.log('   Email:', email);
    console.log('   User ID:', user.id);
    console.log('   Can now create organizations');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeSuperAdmin();
