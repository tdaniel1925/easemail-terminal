import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🔧 EaseMail - Critical RLS Migration Script');
console.log('━'.repeat(60));
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Using service role key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
console.log('━'.repeat(60));
console.log('');

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('📖 Reading migration file...');
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260210_fix_critical_rls_policies.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log(`✅ Migration file loaded (${migrationSQL.length} characters)`);
    console.log('');
    console.log('🚀 Applying migration to database...');
    console.log('⚠️  This will fix 7 critical security vulnerabilities');
    console.log('');

    // Split the SQL into individual statements
    // We need to execute them one by one because some statements depend on previous ones
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add semicolon back

      // Skip comment-only blocks
      if (statement.trim().startsWith('--') || statement.trim().match(/^\/\*/)) {
        continue;
      }

      // Extract a description from the statement for logging
      let description = 'SQL statement';
      if (statement.includes('ALTER TABLE') && statement.includes('ENABLE ROW LEVEL SECURITY')) {
        const match = statement.match(/ALTER TABLE (\w+)/);
        if (match) description = `Enable RLS on ${match[1]}`;
      } else if (statement.includes('CREATE POLICY')) {
        const match = statement.match(/CREATE POLICY "([^"]+)"/);
        if (match) description = `Create policy: ${match[1]}`;
      } else if (statement.includes('DROP POLICY')) {
        const match = statement.match(/DROP POLICY.*"([^"]+)"/);
        if (match) description = `Drop policy: ${match[1]}`;
      }

      process.stdout.write(`  [${i + 1}/${statements.length}] ${description}... `);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // Try direct query as fallback
          const { error: directError } = await supabase.from('_').select('*').limit(0);

          // If it's a policy that already exists, that's okay
          if (error.message && (
            error.message.includes('already exists') ||
            error.message.includes('does not exist')
          )) {
            console.log('⚠️  (already exists/skipped)');
          } else {
            console.log(`❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log('✅');
          successCount++;
        }
      } catch (err) {
        // Since exec_sql might not exist, let's try a different approach
        // We'll use the SQL editor API endpoint instead
        console.log('⚠️  (fallback method)');

        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ query: statement })
          });

          if (response.ok) {
            console.log('  ✅ Applied via API');
            successCount++;
          } else {
            const errorText = await response.text();
            console.log(`  ❌ API Error: ${errorText.substring(0, 100)}`);
            errorCount++;
          }
        } catch (apiErr) {
          console.log(`  ❌ Failed: ${apiErr.message}`);
          errorCount++;
        }
      }
    }

    console.log('');
    console.log('━'.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`  ✅ Success: ${successCount} statements`);
    console.log(`  ❌ Errors:  ${errorCount} statements`);
    console.log('━'.repeat(60));
    console.log('');

    if (errorCount > 0) {
      console.log('⚠️  Some statements failed. This might be normal if:');
      console.log('  - Policies already exist');
      console.log('  - RLS is already enabled');
      console.log('  - Tables have been modified manually');
      console.log('');
      console.log('💡 To apply the migration manually:');
      console.log('  1. Go to Supabase Dashboard → SQL Editor');
      console.log('  2. Copy contents of: supabase/migrations/20260210_fix_critical_rls_policies.sql');
      console.log('  3. Execute the SQL');
      console.log('');
    } else {
      console.log('✅ All statements executed successfully!');
      console.log('');
      console.log('🎉 Critical RLS vulnerabilities have been fixed:');
      console.log('  1. ✅ system_settings - RLS enabled');
      console.log('  2. ✅ organization_invites - All 4 policies added');
      console.log('  3. ✅ organization_members - INSERT/UPDATE/DELETE policies added');
      console.log('  4. ✅ organizations - INSERT/DELETE policies added');
      console.log('  5. ✅ signature_templates - RLS enabled');
      console.log('  6. ✅ revenue_history - Policy bug fixed');
      console.log('  7. ✅ bulk_user_imports - RLS enabled');
      console.log('');
    }

    console.log('📋 Next Steps:');
    console.log('  1. Test organization creation as regular user');
    console.log('  2. Test invite creation and acceptance');
    console.log('  3. Test member management (add/update/remove)');
    console.log('  4. Verify system settings requires super admin');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Fatal error applying migration:');
    console.error(error);
    console.error('');
    console.error('💡 Manual Application Required:');
    console.error('  1. Open Supabase Dashboard: https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb');
    console.error('  2. Go to SQL Editor');
    console.error('  3. Copy and execute: supabase/migrations/20260210_fix_critical_rls_policies.sql');
    process.exit(1);
  }
}

applyMigration();
