require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🔄 Running user preferences migration...\n');

  try {
    // Check if table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('user_preferences')
      .select('id')
      .limit(1);

    if (!checkError || checkError.code !== '42P01') {
      console.log('✅ user_preferences table already exists!');
      console.log('Migration has been applied previously.\n');
      return;
    }

    console.log('📝 Table does not exist. Please run the migration SQL manually:');
    console.log('');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of: supabase/migrations/005_add_user_preferences.sql');
    console.log('4. Click "Run"');
    console.log('');
    console.log('Or use Supabase CLI:');
    console.log('  supabase db push');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigration();
