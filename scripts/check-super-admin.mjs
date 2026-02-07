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

async function checkSuperAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: node scripts/check-super-admin.mjs <email>');
    process.exit(1);
  }

  console.log(`Checking if ${email} is a super admin...\n`);

  // Check in users table
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('id, email, name, is_super_admin')
    .eq('email', email)
    .single();

  if (userError) {
    console.log('❌ User not found in users table');
    console.log('Error:', userError.message);
    return;
  }

  console.log('User found in users table:');
  console.log('- ID:', userRecord.id);
  console.log('- Email:', userRecord.email);
  console.log('- Name:', userRecord.name);
  console.log('- Is Super Admin:', userRecord.is_super_admin ? '✅ YES' : '❌ NO');

  // Check auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userRecord.id);

  if (authError) {
    console.log('\n❌ Error fetching auth user:', authError.message);
  } else {
    console.log('\n✅ Auth user exists');
    console.log('- Email confirmed:', authUser.user.email_confirmed_at ? 'YES' : 'NO');
    console.log('- Created at:', authUser.user.created_at);
  }
}

checkSuperAdmin().catch(console.error);
