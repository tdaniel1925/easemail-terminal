import pg from 'pg';

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check for revenue_history table
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'revenue_history'
      ) as exists;
    `);

    console.log(`revenue_history table exists: ${result.rows[0].exists}`);

    if (!result.rows[0].exists) {
      console.log('\n❌ revenue_history table is missing!');
      console.log('This table should be created by migration: 20250203_revenue_history.sql');
      console.log('\nNeed to apply pending migrations first.');
    }

    // Check which tables our migration references
    const tables = ['system_settings', 'organization_invites', 'signature_templates', 'bulk_user_imports', 'revenue_history'];
    console.log('\nChecking all referenced tables:');
    for (const table of tables) {
      const r = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        ) as exists;
      `, [table]);
      console.log(`  ${r.rows[0].exists ? '✅' : '❌'} ${table}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
