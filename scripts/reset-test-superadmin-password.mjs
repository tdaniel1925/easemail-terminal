/**
 * Reset test super admin password
 */

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

const testEmail = 'superadmin@test.com';
const testPassword = 'SuperAdmin123!';

console.log('🔐 Resetting test super admin password...\n');

async function resetPassword() {
  // Find user in public.users table
  const { data: userRecord } = await supabase
    .from('users')
    .select('id, email, is_super_admin')
    .eq('email', testEmail)
    .single();

  if (!userRecord) {
    console.error('❌ User not found in database');
    console.log('Run: node scripts/create-test-super-admin.mjs');
    process.exit(1);
  }

  console.log(`✅ Found user: ${userRecord.email}`);
  console.log(`   ID: ${userRecord.id}`);
  console.log(`   Super Admin: ${userRecord.is_super_admin}\n`);

  // Update password in auth
  console.log('🔄 Updating password in auth system...');
  const { data, error } = await supabase.auth.admin.updateUserById(
    userRecord.id,
    { password: testPassword }
  );

  if (error) {
    console.error('❌ Failed to update password:', error.message);
    process.exit(1);
  }

  console.log('✅ Password updated successfully!\n');
  console.log('═'.repeat(50));
  console.log('🧪 Test Credentials:');
  console.log('═'.repeat(50));
  console.log(`Email:    ${testEmail}`);
  console.log(`Password: ${testPassword}`);
  console.log('═'.repeat(50));
  console.log('\n✨ Tests can now login successfully!');
}

resetPassword().catch(console.error);
