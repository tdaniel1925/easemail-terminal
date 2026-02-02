const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
  console.log('🔄 Running migration 005_create_drafts_table.sql...\n');

  const sql = fs.readFileSync('supabase/migrations/005_create_drafts_table.sql', 'utf8');

  const client = new Client({
    connectionString: 'postgresql://postgres.bfswjaswmfwvpwvrsqdb:ttandSellaBella1234@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    await client.query(sql);
    console.log('✅ Migration executed successfully!\n');
    console.log('Drafts table created with:');
    console.log('- Auto-save support');
    console.log('- CC/BCC recipients');
    console.log('- Reply context tracking');
    console.log('- Row Level Security enabled');

  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
