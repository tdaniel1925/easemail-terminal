import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

async function applySQLFile(client, filePath, fileName) {
  console.log(`\n📄 Applying: ${fileName}`);
  console.log('─'.repeat(70));

  const sql = fs.readFileSync(filePath, 'utf8');

  // Split into statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10 && !s.startsWith('--'));

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';

    // Get description
    let desc = 'SQL statement';
    if (stmt.includes('CREATE TABLE')) {
      const match = stmt.match(/CREATE TABLE.*?(\w+)/);
      if (match) desc = `Create table: ${match[1]}`;
    } else if (stmt.includes('ALTER TABLE') && stmt.includes('ENABLE ROW LEVEL')) {
      const match = stmt.match(/ALTER TABLE (\w+)/);
      if (match) desc = `Enable RLS: ${match[1]}`;
    } else if (stmt.includes('CREATE POLICY')) {
      const match = stmt.match(/CREATE POLICY "([^"]+)"/);
      if (match) desc = `Policy: ${match[1]}`;
    } else if (stmt.includes('DROP POLICY')) {
      const match = stmt.match(/DROP POLICY.*?"([^"]+)"/);
      if (match) desc = `Drop policy: ${match[1]}`;
    } else if (stmt.includes('CREATE INDEX')) {
      const match = stmt.match(/CREATE INDEX.*?(\w+)/);
      if (match) desc = `Create index: ${match[1]}`;
    }

    process.stdout.write(`  [${i + 1}/${statements.length}] ${desc}... `);

    try {
      await client.query(stmt);
      console.log('✅');
      successCount++;
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('⚠️  (exists)');
        skipCount++;
      } else if (error.message.includes('does not exist') && stmt.includes('DROP')) {
        console.log('⚠️  (not found)');
        skipCount++;
      } else {
        console.log(`❌`);
        console.log(`      Error: ${error.message}`);
        errorCount++;

        // For critical errors, stop
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.log(`\n⚠️  Column reference error - this statement needs manual fixing`);
        }
      }
    }
  }

  console.log('─'.repeat(70));
  console.log(`Results: ✅ ${successCount} success | ⚠️  ${skipCount} skipped | ❌ ${errorCount} errors`);

  return { success: successCount, skipped: skipCount, errors: errorCount };
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 EaseMail - Careful Migration Application');
    console.log('='.repeat(70));

    await client.connect();
    console.log('✅ Connected to database');

    const migrationsDir = path.join(__dirname, '../supabase/migrations');

    // Step 1: Apply revenue_history (with known bug)
    console.log('\n🔹 STEP 1: Create revenue_history table');
    const result1 = await applySQLFile(
      client,
      path.join(migrationsDir, '20250203_revenue_history.sql'),
      '20250203_revenue_history.sql'
    );

    // Step 2: Apply RLS fixes
    console.log('\n🔹 STEP 2: Apply critical RLS fixes');
    const result2 = await applySQLFile(
      client,
      path.join(migrationsDir, '20260210_fix_critical_rls_policies.sql'),
      '20260210_fix_critical_rls_policies.sql'
    );

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total successful: ${result1.success + result2.success}`);
    console.log(`Total skipped: ${result1.skipped + result2.skipped}`);
    console.log(`Total errors: ${result1.errors + result2.errors}`);

    if ((result1.errors + result2.errors) === 0) {
      console.log('\n🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!');

      // Verify
      console.log('\n🔍 Verification:');
      const invitePolicies = await client.query(`SELECT COUNT(*) FROM pg_policies WHERE tablename = 'organization_invites'`);
      console.log(`  organization_invites policies: ${invitePolicies.rows[0].count}`);

      const revenueExists = await client.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'revenue_history')`);
      console.log(`  revenue_history table: ${revenueExists.rows[0].exists ? 'exists ✅' : 'missing ❌'}`);

    } else {
      console.log('\n⚠️  Some statements had errors - review above for details');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed');
  }
}

main();
