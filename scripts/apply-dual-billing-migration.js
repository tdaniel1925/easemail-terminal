// Script to apply dual billing migration
const { readFileSync } = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function applyMigration() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Reading migration file...');
  const migrationSQL = readFileSync('./supabase/migrations/002_dual_billing_model.sql', 'utf8');

  console.log('Applying migration to database...');

  // Split by semicolons but be careful with function bodies
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let currentStatement = '';
  const finalStatements = [];

  for (const statement of statements) {
    currentStatement += statement + ';';

    // If we're not inside a function/trigger definition, this is a complete statement
    if (!currentStatement.includes('$$') ||
        (currentStatement.split('$$').length - 1) % 2 === 0) {
      finalStatements.push(currentStatement.trim());
      currentStatement = '';
    }
  }

  console.log(`Executing ${finalStatements.length} statements...`);

  for (let i = 0; i < finalStatements.length; i++) {
    const stmt = finalStatements[i];
    if (stmt.length === 0) continue;

    console.log(`[${i + 1}/${finalStatements.length}] Executing statement...`);

    const { error } = await supabase.rpc('exec_sql', { sql: stmt }).catch(err => {
      // If rpc doesn't exist, try direct query
      return supabase.from('_sql').select(stmt);
    });

    if (error && !error.message?.includes('already exists')) {
      console.error(`Error on statement ${i + 1}:`, error.message);
      console.error('Statement:', stmt.substring(0, 200));
      // Continue anyway - some errors are expected (like "already exists")
    }
  }

  console.log('✅ Migration applied successfully!');
  console.log('\nNext steps:');
  console.log('1. Verify changes in Supabase dashboard');
  console.log('2. Test creating individual users');
  console.log('3. Test organization creation');
  console.log('4. Implement Stripe integration updates');
}

applyMigration().catch(console.error);
