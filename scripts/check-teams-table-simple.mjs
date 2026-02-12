import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Checking ms_graph_tokens table...\n');

try {
  // Try to query the table
  const { data, error } = await supabase
    .from('ms_graph_tokens')
    .select('user_id, expires_at, created_at')
    .limit(10);

  if (error) {
    if (error.message.includes('does not exist')) {
      console.log('❌ Table "ms_graph_tokens" does NOT exist in database');
      console.log('\n📝 The migration file exists but may not have been applied.');
      console.log('   Run: npx supabase db push');
    } else {
      console.error('❌ Error querying table:', error);
    }
  } else {
    console.log('✅ Table "ms_graph_tokens" exists');
    console.log(`\n📊 Found ${data?.length || 0} MS Graph token(s)`);

    if (data && data.length > 0) {
      data.forEach(token => {
        const expired = new Date(token.expires_at) < new Date();
        console.log(`   - User: ${token.user_id}`);
        console.log(`     Status: ${expired ? '❌ EXPIRED' : '✅ Valid'}`);
        console.log(`     Created: ${new Date(token.created_at).toLocaleString()}`);
      });
    } else {
      console.log('\n   No users have connected MS Teams yet');
    }
  }
} catch (error) {
  console.error('Error:', error.message);
}
