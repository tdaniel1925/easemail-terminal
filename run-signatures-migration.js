const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '011_create_signatures_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Running signatures migration...');
    await client.query(migrationSQL);
    console.log('✅ Signatures table created successfully!');

    client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);
