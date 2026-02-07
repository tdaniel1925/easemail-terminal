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

async function recreateSuperAdmin() {
  const testEmail = 'superadmin@test.com';
  const testPassword = 'SuperAdmin123!';

  console.log('Deleting existing super admin if exists...');

  // Find existing user in users table
  const { data: existingUserRecord } = await supabase
    .from('users')
    .select('id')
    .eq('email', testEmail)
    .single();

  if (existingUserRecord) {
    console.log('✓ Found existing user record, deleting from users table...');
    await supabase.from('users').delete().eq('id', existingUserRecord.id);
    console.log('✓ Deleted user from users table');
  }

  // Find and delete existing auth user
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const existingAuthUser = authUsers?.users.find(u => u.email === testEmail);

  if (existingAuthUser) {
    console.log('✓ Found existing auth user, deleting...');
    await supabase.auth.admin.deleteUser(existingAuthUser.id);
    console.log('✓ Deleted existing auth user');
  }

  console.log('Creating new super admin...');

  // Create fresh auth user
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

  // Create user in users table
  const { error: userError } = await supabase.from('users').insert({
    id: authUser.user.id,
    email: testEmail,
    name: 'Test Super Admin',
    is_super_admin: true,
  });

  if (userError) {
    console.error('Failed to create user record:', userError);
    process.exit(1);
  }

  console.log('✓ Created user record with super admin privileges');

  // Create user preferences
  const { error: prefsError } = await supabase.from('user_preferences').insert({
    user_id: authUser.user.id,
    onboarding_completed: true,
  });

  if (prefsError) {
    console.log('Note: Could not create preferences:', prefsError.message);
  } else {
    console.log('✓ Created user preferences');
  }

  console.log('\n✅ Test super admin recreated successfully!');
  console.log('\nTest credentials:');
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);
}

recreateSuperAdmin().catch(console.error);
