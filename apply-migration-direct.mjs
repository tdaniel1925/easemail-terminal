import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local
const envPath = join(__dirname, '.env.local');
const envFile = readFileSync(envPath, 'utf8');
const env = {};

envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
});

// Read migration file
const migrationPath = join(__dirname, 'supabase', 'migrations', '20260206_admin_features.sql');
const sql = readFileSync(migrationPath, 'utf8');

console.log('Applying admin features migration...\n');

// Split SQL into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

let successCount = 0;
let failCount = 0;

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

  try {
    // Try to execute via direct query
    const { error } = await supabase.rpc('exec', { sql: statement });

    if (error) {
      // Fallback: try common operations directly
      if (statement.includes('CREATE TABLE')) {
        console.log('Attempting table creation...');
        const { error: createError } = await supabase.rpc('exec', { sql: statement + ';' });
        if (createError) {
          console.error(`Failed: ${createError.message}`);
          failCount++;
        } else {
          console.log('✓ Success');
          successCount++;
        }
      } else {
        console.error(`Failed: ${error.message}`);
        failCount++;
      }
    } else {
      console.log('✓ Success');
      successCount++;
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    failCount++;
  }
}

console.log(`\n\nMigration Summary:`);
console.log(`✓ Successful: ${successCount}`);
console.log(`✗ Failed: ${failCount}`);

// Verify tables
console.log('\n\nVerifying tables...');

const tablesToCheck = [
  'admin_notifications',
  'impersonate_sessions',
  'user_login_tracking'
];

for (const table of tablesToCheck) {
  try {
    const { error } = await supabase.from(table).select('id').limit(0);
    if (!error) {
      console.log(`✓ ${table} table exists`);
    } else {
      console.log(`✗ ${table} table not found: ${error.message}`);
    }
  } catch (err) {
    console.log(`✗ ${table} error: ${err.message}`);
  }
}

console.log('\nMigration process completed!');
