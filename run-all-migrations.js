// Run all database migrations for EaseMail features using Supabase Dashboard SQL Editor
const fs = require('fs');
const path = require('path');

const MIGRATIONS = [
  '005_create_drafts_table.sql',
  '006_create_templates_table.sql',
  '007_create_scheduled_emails_table.sql',
  '008_create_snoozed_emails_table.sql',
  '009_create_labels_table.sql',
  '010_create_spam_reports_table.sql',
];

console.log('📋 EaseMail Database Migrations\n');
console.log('The following migrations need to be applied:\n');

MIGRATIONS.forEach((file, index) => {
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', file);

  if (fs.existsSync(migrationPath)) {
    console.log(`${index + 1}. ✅ ${file}`);
  } else {
    console.log(`${index + 1}. ❌ ${file} (file not found)`);
  }
});

console.log('\n📝 To apply these migrations:\n');
console.log('Option 1: Supabase Dashboard (RECOMMENDED)');
console.log('─────────────────────────────────────────');
console.log('1. Go to: https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb');
console.log('2. Click "SQL Editor" in the left sidebar');
console.log('3. Click "+ New Query"');
console.log('4. Copy and paste each migration file content');
console.log('5. Click "Run" for each migration\n');

console.log('Option 2: Command Line (psql)');
console.log('─────────────────────────────');
console.log('$env:PGPASSWORD="ttandSellaBella1234"\n');

MIGRATIONS.forEach(file => {
  console.log(`psql -h aws-0-us-west-1.pooler.supabase.com -p 6543 -U postgres.bfswjaswmfwvrsqdb -d postgres -f supabase/migrations/${file}`);
});

console.log('\n✨ After running migrations, verify with this query:');
console.log('───────────────────────────────────────────────────');
console.log(`
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'drafts',
  'email_templates',
  'scheduled_emails',
  'snoozed_emails',
  'custom_labels',
  'message_labels',
  'spam_reports'
)
ORDER BY table_name;
`);

console.log('Expected result: 7 tables\n');
