import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Applying user_preferences RLS policies...\n');

// SQL to apply RLS policies
const sql = `
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON user_preferences
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON user_preferences
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON user_preferences
FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
ON user_preferences
FOR DELETE
USING (user_id = auth.uid());

-- Verify RLS is enabled
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
`;

// Write SQL to file for manual execution
import fs from 'fs';

const sqlFile = 'APPLY_USER_PREFS_RLS.sql';
fs.writeFileSync(sqlFile, sql);
console.log(`✅ SQL written to ${sqlFile}`);
console.log(`\n📝 To apply these RLS policies, run one of these commands:\n`);
console.log(`   Option 1 (if you have database password):`);
console.log(`   npx supabase db execute --file ${sqlFile}\n`);
console.log(`   Option 2 (with psql and connection string from .env.local):`);
console.log(`   psql "postgresql://postgres:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres" -f ${sqlFile}\n`);
console.log(`   Option 3 (apply via Supabase Dashboard SQL Editor):`);
console.log(`   Copy the contents of ${sqlFile} and run in the SQL Editor\n`);

console.log('🔍 Checking current policy status...\n');

// Check if we can query policies through Supabase client
try {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_preferences' ORDER BY policyname;`
  });

  if (error) {
    console.log('⚠️  Cannot query policies via RPC. They may need to be applied.');
    console.log(`Error: ${error.message}\n`);
  } else if (data && data.length > 0) {
    console.log(`✅ Found ${data.length} existing policies for user_preferences:`);
    data.forEach(p => console.log(`  - ${p.policyname} (${p.cmd})`));
    console.log('\n✅ RLS policies already exist! The issue may be elsewhere.');
  } else {
    console.log('⚠️  No policies found for user_preferences table.');
    console.log('📌 Please apply the SQL file using one of the methods above.\n');
  }
} catch (e) {
  console.log('ℹ️  Skipping policy check - will need to apply SQL manually\n');
}
