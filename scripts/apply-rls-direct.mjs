import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

// Connection string from Supabase
const connectionString = `postgresql://postgres.bfswjaswmfwvpwvrsqdb:ttandSellaBella1234@aws-0-us-west-2.pooler.supabase.com:5432/postgres`;

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function applyRLSPolicies() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read the SQL file
    const sql = fs.readFileSync('APPLY_USER_PREFS_RLS.sql', 'utf8');

    console.log('🔄 Applying RLS policies...');
    await client.query(sql);
    console.log('✅ RLS policies applied successfully!\n');

    // Verify policies were created
    const result = await client.query(`
      SELECT policyname, cmd
      FROM pg_policies
      WHERE tablename = 'user_preferences'
      ORDER BY policyname;
    `);

    if (result.rows.length > 0) {
      console.log(`✅ Verified: ${result.rows.length} policies exist for user_preferences table:`);
      result.rows.forEach(row => {
        console.log(`  - ${row.policyname} (${row.cmd})`);
      });
    } else {
      console.log('⚠️  Warning: No policies found after application!');
    }

    console.log('\n✅ Done! Test users should now be able to access calendar and contacts pages.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyRLSPolicies();
