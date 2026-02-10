/**
 * Setup super admin user
 * 1. Ensure is_super_admin column exists
 * 2. Set specified user as super admin
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupSuperAdmin() {
  const email = process.argv[2] || 'tdaniel@botmakers.ai';

  console.log('🔧 Setting up super admin...\n');
  console.log(`📧 Email: ${email}\n`);

  try {
    // Step 1: Check if user exists
    console.log('1️⃣ Checking if user exists...');
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name, is_super_admin')
      .eq('email', email);

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError.message);
      console.log('\n💡 The is_super_admin column might not exist yet.');
      console.log('   Please run this migration first:');
      console.log('   supabase/migrations/012_add_super_admin_field.sql\n');
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.error(`❌ User ${email} not found in database`);
      console.log('\n💡 Please ensure this user has signed up first.\n');
      process.exit(1);
    }

    const user = users[0];
    console.log(`✅ User found: ${user.name || user.email} (ID: ${user.id})`);
    console.log(`   Current super admin status: ${user.is_super_admin ?? 'column does not exist'}\n`);

    // Step 2: Check if already super admin
    if (user.is_super_admin === true) {
      console.log('✨ User is already a super admin!');
      return;
    }

    // Step 3: Set as super admin
    console.log('2️⃣ Setting user as super admin...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_super_admin: true })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Error updating user:', updateError.message);

      if (updateError.message.includes('column "is_super_admin" of relation "users" does not exist')) {
        console.log('\n💡 The is_super_admin column does not exist!');
        console.log('   Run this SQL in Supabase Dashboard:\n');
        console.log('   ALTER TABLE public.users');
        console.log('   ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE NOT NULL;\n');
        console.log('   CREATE INDEX idx_users_super_admin ON public.users(is_super_admin)');
        console.log('   WHERE is_super_admin = TRUE;\n');
      }

      process.exit(1);
    }

    // Step 4: Verify
    console.log('3️⃣ Verifying update...');
    const { data: verifyUser } = await supabase
      .from('users')
      .select('id, email, name, is_super_admin')
      .eq('id', user.id)
      .single();

    if (verifyUser?.is_super_admin) {
      console.log('✅ Success! User is now a super admin\n');
      console.log('👤 Super Admin Details:');
      console.log(`   Name: ${verifyUser.name || 'N/A'}`);
      console.log(`   Email: ${verifyUser.email}`);
      console.log(`   ID: ${verifyUser.id}`);
      console.log(`   Super Admin: ${verifyUser.is_super_admin}\n`);
      console.log('🎉 You can now access super admin features!');
    } else {
      console.error('❌ Verification failed - super admin status not set');
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

console.log('═'.repeat(60));
console.log('🔐 EaseMail Super Admin Setup');
console.log('═'.repeat(60));
console.log();

setupSuperAdmin();
