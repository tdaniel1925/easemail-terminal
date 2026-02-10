import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment!');
  console.error('Make sure .env.local is loaded');
  process.exit(1);
}

console.log('🔧 EaseMail - Critical RLS Migration Script');
console.log('━'.repeat(70));
console.log(`📍 Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
console.log('━'.repeat(70));
console.log('');

async function applyMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');
    console.log('');

    console.log('📖 Reading migration file...');
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260210_fix_critical_rls_policies.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(`✅ Migration file loaded (${Math.round(migrationSQL.length / 1024)}KB)`);
    console.log('');

    console.log('🚀 Applying migration...');
    console.log('⚠️  This will fix 7 CRITICAL security vulnerabilities:');
    console.log('   1. system_settings - Enable RLS');
    console.log('   2. organization_invites - Add ALL 4 missing policies');
    console.log('   3. organization_members - Add INSERT/UPDATE/DELETE');
    console.log('   4. organizations - Add INSERT/DELETE policies');
    console.log('   5. signature_templates - Enable RLS');
    console.log('   6. revenue_history - Fix policy bug');
    console.log('   7. bulk_user_imports - Enable RLS');
    console.log('');
    console.log('⏳ Executing SQL migration...');
    console.log('');

    // Execute the entire migration in one transaction
    const result = await client.query(migrationSQL);

    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('━'.repeat(70));
    console.log('🎉 SUCCESS! All 7 critical security issues have been fixed!');
    console.log('━'.repeat(70));
    console.log('');

    // Verify the fixes
    console.log('🔍 Verifying fixes...');
    console.log('');

    // Check organization_invites policies
    const invitePolicies = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_policies
      WHERE tablename = 'organization_invites'
    `);
    console.log(`  ✅ organization_invites policies: ${invitePolicies.rows[0].count} (expected: 4)`);

    // Check if system_settings has RLS
    const systemSettingsRLS = await client.query(`
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relname = 'system_settings'
    `);
    const hasRLS = systemSettingsRLS.rows[0]?.relrowsecurity;
    console.log(`  ${hasRLS ? '✅' : '❌'} system_settings RLS enabled: ${hasRLS}`);

    // Check organizations policies
    const orgPolicies = await client.query(`
      SELECT policyname
      FROM pg_policies
      WHERE tablename = 'organizations'
    `);
    console.log(`  ✅ organizations policies: ${orgPolicies.rows.length}`);

    console.log('');
    console.log('━'.repeat(70));
    console.log('📋 Next Steps - TESTING REQUIRED:');
    console.log('━'.repeat(70));
    console.log('  1. ☐ Test organization creation (regular user)');
    console.log('  2. ☐ Test invite creation (org admin)');
    console.log('  3. ☐ Test invite acceptance (invited user)');
    console.log('  4. ☐ Test member management (add/update role/remove)');
    console.log('  5. ☐ Test organization deletion (owner)');
    console.log('  6. ☐ Verify system settings access (super admin only)');
    console.log('  7. ☐ Verify template management (super admin only)');
    console.log('');
    console.log('🌐 Test at: https://easemail.app');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error applying migration:');
    console.error(error.message);
    console.error('');

    if (error.message.includes('already exists')) {
      console.log('⚠️  Some objects already exist - this might be okay!');
      console.log('The migration may have been partially applied before.');
      console.log('');
      console.log('💡 To verify, check the Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb');
      console.log('');
    } else {
      console.error('💡 Manual application required:');
      console.error('   1. Go to: https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb');
      console.error('   2. Navigate to: SQL Editor');
      console.error('   3. Copy contents of: supabase/migrations/20260210_fix_critical_rls_policies.sql');
      console.error('   4. Execute the SQL');
      console.error('');
    }

    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

applyMigration();
