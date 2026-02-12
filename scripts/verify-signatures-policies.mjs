import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('✅ Verifying signatures RLS policies...\n');

try {
  // Query policies using raw SQL
  const { data, error } = await supabase
    .from('pg_policies')
    .select('schemaname, tablename, policyname, cmd')
    .eq('tablename', 'signatures');

  if (error) {
    console.error('❌ Error querying policies:', error);
  } else if (data && data.length > 0) {
    console.log(`✅ Found ${data.length} RLS policies on signatures table:\n`);
    data.forEach(policy => {
      console.log(`   📋 ${policy.policyname}`);
      console.log(`      Command: ${policy.cmd}`);
    });

    const expectedPolicies = [
      'Users can view their own signatures',
      'Users can create their own signatures',
      'Users can update their own signatures',
      'Users can delete their own signatures'
    ];

    const foundPolicies = data.map(p => p.policyname);
    const missing = expectedPolicies.filter(p => !foundPolicies.includes(p));

    if (missing.length === 0) {
      console.log('\n✅ All required policies are present!');
      console.log('✅ Users should now be able to save signatures.');
    } else {
      console.log('\n⚠️  Missing policies:', missing);
    }
  } else {
    console.log('❌ No policies found! RLS may not be configured.');
  }

  // Check if RLS is enabled
  const { data: tableData, error: tableError } = await supabase
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('tablename', 'signatures')
    .eq('schemaname', 'public');

  if (!tableError && tableData && tableData.length > 0) {
    const rlsEnabled = tableData[0].rowsecurity;
    console.log(`\n🔒 RLS Enabled: ${rlsEnabled ? '✅ YES' : '❌ NO'}`);
  }

} catch (error) {
  console.error('Error:', error.message);
}
