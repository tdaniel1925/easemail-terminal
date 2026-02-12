import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Checking signatures table RLS policies...\n');

try {
  // Check table structure
  const { data: columns, error: colError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'signatures'
        ORDER BY ordinal_position;
      `
    })
    .catch(() => null);

  if (!colError && columns) {
    console.log('📋 Table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
  }

  // Check RLS policies
  const { data: policies, error: polError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies
        WHERE tablename = 'signatures';
      `
    })
    .catch(() => null);

  if (!polError && policies) {
    console.log('\n🔒 RLS Policies:');
    policies.forEach(pol => {
      console.log(`\n   Policy: ${pol.policyname}`);
      console.log(`   Command: ${pol.cmd}`);
      console.log(`   Using: ${pol.qual || 'N/A'}`);
      console.log(`   Check: ${pol.with_check || 'N/A'}`);
    });
  }

  // Try to insert as a test user
  console.log('\n🧪 Testing INSERT policy...');

  const { data: testUser } = await supabase.auth.admin.listUsers();
  if (testUser?.users && testUser.users.length > 0) {
    const userId = testUser.users[0].id;
    console.log(`   Using test user: ${userId}`);

    // Try direct insert with service role (should work)
    const { data: insertData, error: insertError } = await supabase
      .from('signatures')
      .insert({
        user_id: userId,
        name: 'Test Signature',
        content: 'Test Content',
        is_default: false,
      })
      .select();

    if (insertError) {
      console.log('   ❌ INSERT failed:', insertError.message);
    } else {
      console.log('   ✅ INSERT successful (service role)');

      // Clean up
      if (insertData && insertData[0]) {
        await supabase.from('signatures').delete().eq('id', insertData[0].id);
      }
    }
  }

} catch (error) {
  console.error('Error:', error);
}
