import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

async function testEmailAccountsQuery() {
  console.log('🔍 Testing email accounts query...\n');

  // Test with service role (should always work)
  console.log('1. Testing with SERVICE ROLE KEY:');
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data: serviceAccounts, error: serviceError } = await serviceClient
    .from('email_accounts')
    .select('*');

  if (serviceError) {
    console.error('   ❌ Service role error:', serviceError);
  } else {
    console.log(`   ✅ Found ${serviceAccounts.length} email accounts`);
    serviceAccounts.forEach(acc => {
      console.log(`      - ${acc.email} (${acc.provider}) - User: ${acc.user_id}`);
    });
  }

  console.log('\n2. Testing RLS policies:');
  console.log('   Querying email_accounts policies...');

  const { data: policies, error: policiesError } = await serviceClient
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'email_accounts');

  if (policiesError) {
    console.error('   ❌ Error fetching policies:', policiesError);
  } else {
    console.log(`   ✅ Found ${policies.length} policies:`);
    policies.forEach(p => {
      console.log(`      - ${p.policyname} (${p.cmd})`);
    });
  }

  console.log('\n3. Testing RLS status:');
  const { data: tableInfo, error: tableError } = await serviceClient
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('tablename', 'email_accounts');

  if (tableError) {
    console.error('   ❌ Error checking RLS status:', tableError);
  } else if (tableInfo && tableInfo.length > 0) {
    console.log(`   RLS enabled: ${tableInfo[0].rowsecurity}`);
  }

  console.log('\n✅ Test complete!');
  console.log('\nℹ️  If RLS is enabled and policies exist, users should be able to query their own email accounts.');
}

testEmailAccountsQuery().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
