import { readFileSync } from 'fs';
import postgres from 'postgres';

// Get connection string from env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.log('\nPlease set your Supabase database connection string:');
  console.log('You can find it in: Supabase Dashboard > Settings > Database > Connection string (Direct)');
  process.exit(1);
}

const sql = postgres(connectionString, {
  max: 1,
  ssl: 'require'
});

async function applyMigration() {
  console.log('Reading migration file...');
  const migrationSQL = readFileSync('./supabase/migrations/014_onboarding_enhancements.sql', 'utf8');

  console.log('Parsing migration statements...\n');

  // Split into individual statements, handling functions/triggers properly
  const lines = migrationSQL.split('\n');
  const statements = [];
  let current = '';
  let inFunction = false;
  let dollarCount = 0;

  for (const line of lines) {
    // Skip comment lines
    if (line.trim().startsWith('--')) {
      continue;
    }

    current += line + '\n';

    // Track $$ for function bodies
    const matches = line.match(/\$\$/g);
    if (matches) {
      dollarCount += matches.length;
      inFunction = dollarCount % 2 !== 0;
    }

    // Complete statement when we hit ; outside of function
    if (line.trim().endsWith(';') && !inFunction) {
      const stmt = current.trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 100).replace(/\s+/g, ' ');

    try {
      await sql.unsafe(stmt);
      console.log(`[${i + 1}/${statements.length}] ✅ OK: ${preview}...`);
      success++;
    } catch (error) {
      // Some errors are expected (like "already exists")
      if (
        error.message?.includes('already exists') ||
        error.message?.includes('does not exist')
      ) {
        console.log(`[${i + 1}/${statements.length}] ⚠️  SKIP: ${preview}...`);
        console.log(`         Reason: ${error.message.split('\n')[0]}`);
        skipped++;
      } else {
        console.log(`[${i + 1}/${statements.length}] ❌ FAIL: ${preview}...`);
        console.log(`         Error: ${error.message.split('\n')[0]}`);
        failed++;
      }
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

  await sql.end();
}

applyMigration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
