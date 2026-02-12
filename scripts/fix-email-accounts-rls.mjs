import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixEmailAccountsRLS() {
  console.log('🔧 Fixing RLS policies for email_accounts table...\n');

  try {
    // Drop existing policies
    console.log('1. Dropping existing policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view own email accounts" ON email_accounts;
        DROP POLICY IF EXISTS "Users can insert own email accounts" ON email_accounts;
        DROP POLICY IF EXISTS "Users can update own email accounts" ON email_accounts;
        DROP POLICY IF EXISTS "Users can delete own email accounts" ON email_accounts;
      `
    });

    // Enable RLS
    console.log('2. Enabling RLS on email_accounts...');
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;`
    });

    // Create new policies
    console.log('3. Creating RLS policies...');

    const policies = `
      -- Users can view their own email accounts
      CREATE POLICY "Users can view own email accounts"
        ON email_accounts FOR SELECT
        USING (auth.uid() = user_id);

      -- Users can insert their own email accounts
      CREATE POLICY "Users can insert own email accounts"
        ON email_accounts FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      -- Users can update their own email accounts
      CREATE POLICY "Users can update own email accounts"
        ON email_accounts FOR UPDATE
        USING (auth.uid() = user_id);

      -- Users can delete their own email accounts
      CREATE POLICY "Users can delete own email accounts"
        ON email_accounts FOR DELETE
        USING (auth.uid() = user_id);
    `;

    await supabase.rpc('exec_sql', { sql: policies });

    console.log('\n✅ RLS policies applied successfully!');

    // Verify policies
    console.log('\n4. Verifying policies...');
    const { data: verifyData, error: verifyError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT policyname, cmd, qual, with_check
        FROM pg_policies
        WHERE tablename = 'email_accounts'
        ORDER BY policyname;
      `
    });

    if (verifyError) {
      console.error('Error verifying policies:', verifyError);
    } else {
      console.log('Current policies:', verifyData);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

fixEmailAccountsRLS();
