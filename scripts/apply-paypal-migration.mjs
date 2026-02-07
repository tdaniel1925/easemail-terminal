import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('Reading migration file...');
  const sql = readFileSync('./supabase/migrations/002_dual_billing_paypal.sql', 'utf8');

  console.log('Splitting into statements...');
  // Split on semicolons but preserve function bodies (between $$)
  const statements = [];
  let current = '';
  let inFunction = false;

  for (const line of sql.split('\n')) {
    current += line + '\n';

    if (line.includes('$$')) {
      inFunction = !inFunction;
    }

    if (line.trim().endsWith(';') && !inFunction) {
      if (current.trim() && !current.trim().startsWith('--')) {
        statements.push(current.trim());
      }
      current = '';
    }
  }

  console.log(`Found ${statements.length} statements to execute\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\s+/g, ' ');

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt });

      if (error) {
        // Some errors are expected (like "already exists")
        if (error.message?.includes('already exists') ||
            error.message?.includes('does not exist')) {
          console.log(`[${i + 1}/${statements.length}] ⚠️  SKIP: ${preview}...`);
          console.log(`         Reason: ${error.message.split('\n')[0]}`);
          skipped++;
        } else {
          console.log(`[${i + 1}/${statements.length}] ❌ FAIL: ${preview}...`);
          console.log(`         Error: ${error.message.split('\n')[0]}`);
          failed++;
        }
      } else {
        console.log(`[${i + 1}/${statements.length}] ✅ OK: ${preview}...`);
        success++;
      }
    } catch (err) {
      console.log(`[${i + 1}/${statements.length}] ❌ FAIL: ${preview}...`);
      console.log(`         Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Migration Complete!`);
  console.log(`Success: ${success}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  Some statements failed. Check errors above.');
    console.log('This may be normal if columns already exist.');
  } else {
    console.log('\n✅ Migration applied successfully!');
  }
}

applyMigration().catch(console.error);
