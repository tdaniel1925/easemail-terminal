const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');
  const env = {};

  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

async function applyMigration() {
  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260206_admin_features.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Applying admin features migration...');

  try {
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error('Migration failed:', error);

      // Try alternative approach - split and execute statements
      console.log('\nTrying alternative approach...');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

        // Use the REST API to execute raw SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql_string: statement })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Statement ${i + 1} failed:`, errorText);
          // Continue with next statement
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      }
    } else {
      console.log('Migration applied successfully!');
    }

    console.log('\nVerifying tables...');

    // Check if tables were created
    const { data: tables, error: tablesError } = await supabase
      .from('admin_notifications')
      .select('id')
      .limit(0);

    if (!tablesError) {
      console.log('✓ admin_notifications table exists');
    } else {
      console.log('✗ admin_notifications table not found:', tablesError.message);
    }

    const { data: impersonateTables, error: impersonateError } = await supabase
      .from('impersonate_sessions')
      .select('id')
      .limit(0);

    if (!impersonateError) {
      console.log('✓ impersonate_sessions table exists');
    } else {
      console.log('✗ impersonate_sessions table not found:', impersonateError.message);
    }

    const { data: loginTracking, error: loginError } = await supabase
      .from('user_login_tracking')
      .select('id')
      .limit(0);

    if (!loginError) {
      console.log('✓ user_login_tracking table exists');
    } else {
      console.log('✗ user_login_tracking table not found:', loginError.message);
    }

    console.log('\nMigration process completed!');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

applyMigration();
