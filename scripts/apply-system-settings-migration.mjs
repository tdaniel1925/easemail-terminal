import { readFileSync } from 'fs';
import pg from 'pg';
const { Client } = pg;

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function applyMigration() {
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read the idempotent migration file
    const migrationSQL = readFileSync(
      'supabase/migrations/20260210_create_system_settings_table_IDEMPOTENT.sql',
      'utf8'
    );

    console.log('\n📝 Applying system_settings table migration...\n');

    // Execute the migration
    await client.query(migrationSQL);

    console.log('✅ Migration applied successfully!');

    // Verify the table was created
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'system_settings'
      );
    `);

    if (result.rows[0].exists) {
      console.log('✅ system_settings table verified');

      // Check if default settings were inserted
      const settingsCount = await client.query('SELECT COUNT(*) FROM system_settings');
      console.log(`✅ ${settingsCount.rows[0].count} default settings inserted`);
    } else {
      console.log('⚠️ Table creation verification failed');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Table already exists - migration may have been applied previously');
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

applyMigration();
