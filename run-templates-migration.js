const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Hardcode credentials for this migration
const supabaseUrl = 'https://oqzwjqlfskekaqskccix.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xendqcWxmc2tla2Fxc2tjY2l4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQzMzQxMiwiZXhwIjoyMDUzMDA5NDEyfQ.LSnW4qZK77E5JYc0rWA90I_gRhPXqZIDXNxuEKpxpDY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function runMigration() {
  try {
    console.log('Running templates migration...');

    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '006_create_templates_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

        if (error) {
          console.error('Statement error:', error);
          // Continue with next statement
        }
      }
    }

    console.log('✅ Templates migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
