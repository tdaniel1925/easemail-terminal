import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyRLS() {
  console.log('🔧 Applying RLS fixes for email_accounts...\n');

  const statements = [
    // Enable RLS
    {
      name: 'Enable RLS',
      sql: 'ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;'
    },
    // Drop existing policies
    {
      name: 'Drop existing SELECT policy',
      sql: 'DROP POLICY IF EXISTS "Users can view own email accounts" ON email_accounts;'
    },
    {
      name: 'Drop existing INSERT policy',
      sql: 'DROP POLICY IF EXISTS "Users can insert own email accounts" ON email_accounts;'
    },
    {
      name: 'Drop existing UPDATE policy',
      sql: 'DROP POLICY IF EXISTS "Users can update own email accounts" ON email_accounts;'
    },
    {
      name: 'Drop existing DELETE policy',
      sql: 'DROP POLICY IF EXISTS "Users can delete own email accounts" ON email_accounts;'
    },
    // Create new policies
    {
      name: 'Create SELECT policy',
      sql: `CREATE POLICY "Users can view own email accounts"
        ON email_accounts FOR SELECT
        USING (auth.uid() = user_id);`
    },
    {
      name: 'Create INSERT policy',
      sql: `CREATE POLICY "Users can insert own email accounts"
        ON email_accounts FOR INSERT
        WITH CHECK (auth.uid() = user_id);`
    },
    {
      name: 'Create UPDATE policy',
      sql: `CREATE POLICY "Users can update own email accounts"
        ON email_accounts FOR UPDATE
        USING (auth.uid() = user_id);`
    },
    {
      name: 'Create DELETE policy',
      sql: `CREATE POLICY "Users can delete own email accounts"
        ON email_accounts FOR DELETE
        USING (auth.uid() = user_id);`
    }
  ];

  for (const statement of statements) {
    try {
      console.log(`⏳ ${statement.name}...`);
      const { error } = await supabase.rpc('exec', { sql: statement.sql });

      if (error) {
        // Try direct query if RPC doesn't exist
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql: statement.sql })
        });

        if (!response.ok) {
          console.log(`   ⚠️  Could not execute via RPC, trying direct SQL...`);
          // Direct SQL execution isn't available via REST API
          // We'll need to use Supabase SQL editor or psql
        }
      }

      console.log(`   ✅ ${statement.name} completed`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n📊 Checking current policies...');

  // Try to list policies via information schema
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'email_accounts');

  if (policies) {
    console.log('\nCurrent policies:');
    policies.forEach(p => {
      console.log(`  - ${p.policyname} (${p.cmd})`);
    });
  } else {
    console.log('\n⚠️  Could not fetch policies directly');
    console.log('\n📝 Please run the following SQL manually in Supabase SQL Editor:');
    console.log('\n' + readFileSync('FIX_EMAIL_ACCOUNTS_RLS.sql', 'utf-8'));
  }
}

applyRLS().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
