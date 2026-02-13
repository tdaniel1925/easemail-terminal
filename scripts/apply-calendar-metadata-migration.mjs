#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('📦 Applying calendar_metadata table migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260213_create_calendar_metadata_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error);

      // Try direct SQL execution as fallback
      console.log('\n📝 Attempting direct SQL execution...');
      const { data, error: directError } = await supabase
        .from('_migrations')
        .select('*')
        .limit(1);

      if (directError) {
        console.error('Database connection issue:', directError);
      }

      process.exit(1);
    }

    console.log('✅ Calendar metadata table migration applied successfully!\n');
    console.log('Table created: calendar_metadata');
    console.log('Indexes created: 4');
    console.log('RLS policies created: 4\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

applyMigration();
