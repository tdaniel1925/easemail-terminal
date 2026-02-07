import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local
const envPath = join(__dirname, '..', '.env.local');
const envFile = readFileSync(envPath, 'utf8');
const env = {};

envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createTestSuperAdmin() {
  const testEmail = 'superadmin@test.com';
  const testPassword = 'SuperAdmin123!';

  console.log('Creating test super admin user...');

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email, is_super_admin')
    .eq('email', testEmail)
    .single();

  if (existingUser) {
    console.log('Test super admin already exists:', existingUser.email);
    console.log('Is super admin:', existingUser.is_super_admin);

    // Make sure they're a super admin
    if (!existingUser.is_super_admin) {
      await supabase
        .from('users')
        .update({ is_super_admin: true })
        .eq('id', existingUser.id);
      console.log('Updated user to be super admin');
    }

    console.log('\nTest credentials:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    return;
  }

  // Check if auth user exists
  let authUserId;
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const existingAuthUser = authUsers?.users.find(u => u.email === testEmail);

  if (existingAuthUser) {
    console.log('✓ Auth user already exists:', existingAuthUser.id);
    authUserId = existingAuthUser.id;

    // Update password
    await supabase.auth.admin.updateUserById(authUserId, {
      password: testPassword,
    });
    console.log('✓ Updated auth user password');
  } else {
    // Create user in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

    if (authError || !authUser.user) {
      console.error('Failed to create auth user:', authError);
      process.exit(1);
    }

    console.log('✓ Created auth user:', authUser.user.id);
    authUserId = authUser.user.id;
  }

  // Create or update user in users table
  const { data: existingUserRecord } = await supabase
    .from('users')
    .select('id')
    .eq('id', authUserId)
    .single();

  if (existingUserRecord) {
    // Update existing user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email: testEmail,
        name: 'Test Super Admin',
        is_super_admin: true,
      })
      .eq('id', authUserId);

    if (updateError) {
      console.error('Failed to update user record:', updateError);
      process.exit(1);
    }
    console.log('✓ Updated user record with super admin privileges');
  } else {
    // Create new user
    const { error: userError } = await supabase.from('users').insert({
      id: authUserId,
      email: testEmail,
      name: 'Test Super Admin',
      is_super_admin: true,
    });

    if (userError) {
      console.error('Failed to create user record:', userError);
      process.exit(1);
    }
    console.log('✓ Created user record with super admin privileges');
  }

  console.log('✓ Created user record with super admin privileges');

  // Create user preferences with onboarding completed
  const { error: prefsError } = await supabase.from('user_preferences').insert({
    user_id: authUserId,
    onboarding_completed: true,
  });

  if (prefsError) {
    console.log('Note: Could not create preferences:', prefsError.message);
  } else {
    console.log('✓ Created user preferences (onboarding completed)');
  }

  console.log('\n✅ Test super admin created successfully!');
  console.log('\nTest credentials:');
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);
  console.log('\nYou can now run the tests with:');
  console.log('npx playwright test tests/11-admin-features.spec.ts --project=chromium --workers=1');
}

createTestSuperAdmin().catch(console.error);
