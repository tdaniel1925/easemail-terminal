import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = 'postgresql://postgres.bfswjaswmfwvpwvrsqdb:ttandSellaBella1234@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

async function runMigration(client, filename, description) {
  console.log(`\n📝 ${description}...`);

  try {
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', filename);
    const sql = readFileSync(migrationPath, 'utf8');

    await client.query(sql);

    console.log(`  ✅ Success!`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`  ℹ️  Already exists, skipping`);
      return true;
    }
    console.error(`  ❌ Error:`, error.message);
    return false;
  }
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('🚀 Running migrations...');

    // Run migrations in order
    await runMigration(client, '20250211_create_messages_table.sql', 'Creating messages table');
    await runMigration(client, '20250211_create_folder_mappings_table.sql', 'Creating folder_mappings table');
    await runMigration(client, '20250211_add_nylas_draft_id_to_drafts.sql', 'Adding nylas_draft_id to drafts table');

    console.log('\n✨ All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
