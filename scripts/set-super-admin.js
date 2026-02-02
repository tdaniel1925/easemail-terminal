/**
 * Script to set a user as super admin
 * Usage: node scripts/set-super-admin.js <user-email>
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node scripts/set-super-admin.js <user-email>');
  console.error('   Example: node scripts/set-super-admin.js admin@example.com');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setSuperAdmin() {
  try {
    console.log(`🔍 Looking for user: ${email}`);

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, is_super_admin')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error(`❌ User not found: ${email}`);
      console.error('   Make sure the user has logged in at least once.');
      process.exit(1);
    }

    console.log(`✓ Found user: ${user.name || user.email}`);
    console.log(`  User ID: ${user.id}`);
    console.log(`  Current super admin status: ${user.is_super_admin}`);

    if (user.is_super_admin) {
      console.log(`✓ User is already a super admin!`);
      process.exit(0);
    }

    // Set super admin flag
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_super_admin: true })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Failed to set super admin:', updateError.message);
      process.exit(1);
    }

    console.log(`✅ Success! ${user.name || email} is now a super admin.`);
    console.log(`   They can now access:`);
    console.log(`   - /app/admin/users`);
    console.log(`   - /app/admin/organizations`);
    console.log(`   - /app/admin/analytics`);
    console.log(`   - /app/sms`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setSuperAdmin();
