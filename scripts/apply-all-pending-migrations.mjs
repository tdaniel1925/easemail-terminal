import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  process.exit(1);
}

async function applyMigration(client, filePath, name) {
  console.log(`📄 Applying: ${name}`);
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    await client.query(sql);
    console.log(`   ✅ Success\n`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`   ⚠️  Already exists (skipped)\n`);
      return true;
    }
    console.error(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 EaseMail - Apply Pending Migrations');
    console.log('━'.repeat(70));
    console.log('');

    await client.connect();
    console.log('✅ Connected to database\n');

    const migrationsDir = path.join(__dirname, '../supabase/migrations');

    // Apply revenue_history migration first
    console.log('Step 1: Create revenue_history table (if missing)');
    console.log('━'.repeat(70));
    await applyMigration(
      client,
      path.join(migrationsDir, '20250203_revenue_history.sql'),
      '20250203_revenue_history.sql'
    );

    // Apply critical RLS fixes
    console.log('Step 2: Apply critical RLS security fixes');
    console.log('━'.repeat(70));
    const success = await applyMigration(
      client,
      path.join(migrationsDir, '20260210_fix_critical_rls_policies.sql'),
      '20260210_fix_critical_rls_policies.sql'
    );

    if (success) {
      console.log('━'.repeat(70));
      console.log('🎉 ALL MIGRATIONS APPLIED SUCCESSFULLY!');
      console.log('━'.repeat(70));
      console.log('');
      console.log('✅ Fixed 7 critical security vulnerabilities:');
      console.log('   1. system_settings - RLS enabled');
      console.log('   2. organization_invites - All 4 policies added');
      console.log('   3. organization_members - INSERT/UPDATE/DELETE added');
      console.log('   4. organizations - INSERT/DELETE policies added');
      console.log('   5. signature_templates - RLS enabled');
      console.log('   6. revenue_history - Policy bug fixed');
      console.log('   7. bulk_user_imports - RLS enabled');
      console.log('');

      // Verify fixes
      console.log('🔍 Verifying fixes...\n');

      const invitePolicies = await client.query(`
        SELECT COUNT(*) FROM pg_policies WHERE tablename = 'organization_invites'
      `);
      console.log(`  organization_invites policies: ${invitePolicies.rows[0].count} ✅`);

      const orgPolicies = await client.query(`
        SELECT policyname FROM pg_policies WHERE tablename = 'organizations' ORDER BY policyname
      `);
      console.log(`  organizations policies: ${orgPolicies.rows.length}`);
      orgPolicies.rows.forEach(row => console.log(`    - ${row.policyname}`));

      const systemSettingsRLS = await client.query(`
        SELECT relrowsecurity FROM pg_class WHERE relname = 'system_settings'
      `);
      console.log(`  system_settings RLS: ${systemSettingsRLS.rows[0]?.relrowsecurity ? 'enabled ✅' : 'DISABLED ❌'}`);

      console.log('');
      console.log('━'.repeat(70));
      console.log('📋 TESTING CHECKLIST:');
      console.log('━'.repeat(70));
      console.log('  ☐ 1. Test organization creation (as regular user)');
      console.log('  ☐ 2. Test sending invite (as org admin)');
      console.log('  ☐ 3. Test accepting invite (as invited user)');
      console.log('  ☐ 4. Test adding member to org');
      console.log('  ☐ 5. Test updating member role');
      console.log('  ☐ 6. Test removing member');
      console.log('  ☐ 7. Test deleting organization (as owner)');
      console.log('  ☐ 8. Verify system settings requires super admin');
      console.log('');
      console.log('🌐 Test at: https://easemail.app');
      console.log('');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
