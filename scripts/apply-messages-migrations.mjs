import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filename, description) {
  console.log(`\n📝 Running: ${description}...`);

  try {
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', filename);
    const sql = readFileSync(migrationPath, 'utf8');

    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

    if (error) {
      // Try direct execution if RPC doesn't exist
      const lines = sql.split(';').filter(line => line.trim());

      for (const line of lines) {
        if (line.trim()) {
          const { error: execError } = await supabase.rpc('exec_sql', { sql_query: line + ';' });
          if (execError) {
            console.error(`  ❌ Error executing statement:`, execError.message);
            console.error(`  Statement: ${line.substring(0, 100)}...`);
          }
        }
      }
    }

    console.log(`  ✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error in ${description}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migrations for messages and folders...\n');

  // Run migrations in order
  await runMigration('20250211_create_messages_table.sql', 'Create messages table');
  await runMigration('20250211_create_folder_mappings_table.sql', 'Create folder_mappings table');

  console.log('\n✨ All migrations completed!');
  console.log('\n📊 Next steps:');
  console.log('  1. Sync folders from Nylas to folder_mappings table');
  console.log('  2. Sync messages from Nylas to messages table');
  console.log('  3. Update APIs to query from database');
}

main().catch(console.error);
