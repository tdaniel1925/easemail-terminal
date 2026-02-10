import pg from 'pg';
const { Client } = pg;

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function checkTable() {
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'system_settings'
      );
    `);

    console.log('\n📊 Table exists:', tableExists.rows[0].exists);

    if (tableExists.rows[0].exists) {
      // Get table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'system_settings'
        ORDER BY ordinal_position;
      `);

      console.log('\n📋 Current table structure:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });

      // Check existing data
      const data = await client.query('SELECT * FROM system_settings LIMIT 10');
      console.log(`\n📝 Current data (${data.rows.length} rows):`);
      data.rows.forEach(row => {
        console.log(`  - ${row.key}: ${JSON.stringify(row.value)}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

checkTable();
