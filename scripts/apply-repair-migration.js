const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyRepairMigration() {
  // Create Supabase client with service role
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read the repair migration SQL
  const sqlPath = path.join(__dirname, '../supabase/migrations/99999999_repair_organization_invites.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Applying repair migration to add token and expires_at columns...\n');

  try {
    // Execute the SQL using Supabase
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, we'll use the REST API directly
      console.log('Trying direct SQL execution...');

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Repair migration applied successfully!');
      console.log('The organization_invites table now has token, expires_at, and accepted_at columns.');
    } else {
      console.log('✅ Repair migration applied successfully!');
      console.log('Result:', data);
    }
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n📋 Please apply this SQL manually in the Supabase Dashboard SQL Editor:');
    console.log('👉 https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb/sql/new\n');
    console.log('SQL to execute:');
    console.log('─'.repeat(80));
    console.log(sql);
    console.log('─'.repeat(80));
    process.exit(1);
  }
}

applyRepairMigration();
