// Check database issue with email_accounts table
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bfswjaswmfwvpwvrsqdb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmc3dqYXN3bWZ3dnB3dnJzcWRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk5NTE1NywiZXhwIjoyMDg1NTcxMTU3fQ.0aG1V7HnAvTXz8dqbdBlEzqJhxBsz4st5MtFVdDUuBA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Checking email_accounts table...\n');

  // Check if table exists and get current records
  const { data, error } = await supabase
    .from('email_accounts')
    .select('*')
    .limit(5);

  if (error) {
    console.error('❌ Error accessing email_accounts table:', error);
    console.log('\nPossible issues:');
    console.log('1. Table does not exist');
    console.log('2. RLS (Row Level Security) is blocking access');
    console.log('3. Table structure mismatch');
  } else {
    console.log('✅ Table accessible!');
    console.log('\nCurrent records:', data.length);
    if (data.length > 0) {
      console.log('\nSample record structure:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('\n📭 No email accounts connected yet.');
    }
  }

  // Check users table
  console.log('\n🔍 Checking users table...\n');
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .limit(5);

  if (userError) {
    console.error('❌ Error accessing users table:', userError);
  } else {
    console.log('✅ Users table accessible!');
    console.log('Current users:', users.length);
    if (users.length > 0) {
      console.log('\nUser IDs:');
      users.forEach(u => console.log(`  - ${u.id} (${u.email})`));
    }
  }
}

checkDatabase().catch(console.error);
