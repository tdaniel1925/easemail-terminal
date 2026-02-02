const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔄 Running MS Graph tokens migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250202_msgraph_tokens.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error && !error.message.includes('already exists')) {
        console.log('⚠️  Statement:', statement.substring(0, 100) + '...');
        console.log('⚠️  Error:', error.message);
      }
    }

    // Alternative: Try creating table directly
    console.log('Creating ms_graph_tokens table...');

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ms_graph_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          access_token TEXT NOT NULL,
          refresh_token TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          scope TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    });

    if (createError) {
      console.log('Trying direct SQL execution...');

      // Execute using raw SQL query
      const { data, error } = await supabase.from('ms_graph_tokens').select('*').limit(1);

      if (error && error.message.includes('does not exist')) {
        console.log('\n📝 Table needs to be created manually in Supabase dashboard.');
        console.log('Go to: https://supabase.com/dashboard/project/[your-project]/editor');
        console.log('\nRun this SQL:\n');
        console.log(migrationSQL);
        console.log('\n✅ After running the SQL, your Teams integration will work!');
      } else if (!error) {
        console.log('✅ ms_graph_tokens table already exists!');
      }
    } else {
      console.log('✅ ms_graph_tokens table created successfully!');
    }

    // Verify table exists
    const { data, error } = await supabase
      .from('ms_graph_tokens')
      .select('*')
      .limit(1);

    if (!error) {
      console.log('\n✅ MS Graph tokens table is ready!');
      console.log('\n🎉 Teams integration is now fully configured!');
      console.log('\n📱 Next steps:');
      console.log('  1. Visit /app/teams');
      console.log('  2. Click "Connect Teams"');
      console.log('  3. Authorize MS Graph');
      console.log('  4. See your Teams meetings!\n');
    } else {
      console.log('\n⚠️  Table verification:', error.message);
      console.log('\n📝 Please create the table manually using Supabase SQL Editor:');
      console.log('File: supabase/migrations/20250202_msgraph_tokens.sql\n');
    }
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.log('\n📝 Please run the migration manually in Supabase dashboard:');
    console.log('File: supabase/migrations/20250202_msgraph_tokens.sql\n');
  }
}

runMigration();
