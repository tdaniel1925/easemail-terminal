const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://bfswjaswmfwvpwvrsqdb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmc3dqYXN3bWZ3dnB3dnJzcWRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk5NTE1NywiZXhwIjoyMDg1NTcxMTU3fQ.0aG1V7HnAvTXz8dqbdBlEzqJhxBsz4st5MtFVdDUuBA';

async function runMigration() {
  console.log('🔄 Running migration 004_add_user_sync_trigger.sql...\n');

  const sql = fs.readFileSync('supabase/migrations/004_add_user_sync_trigger.sql', 'utf8');
  
  const { Client } = require('pg');
  const client = new Client({
    connectionString: 'postgresql://postgres.bfswjaswmfwvpwvrsqdb:ttandSellaBella1234@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    const result = await client.query(sql);
    console.log('✅ Migration executed successfully!\n');
    console.log('Trigger created to auto-sync auth.users → public.users');
    
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
