#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('📦 Creating calendar_metadata table...\n');

  try {
    const sql = fs.readFileSync('create-calendar-table.sql', 'utf8');

    // Execute SQL using Supabase's raw query capability
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec', {
          sql: statement.trim() + ';'
        }).single();

        if (error && !error.message.includes('already exists')) {
          console.error('Statement error:', error);
        }
      }
    }

    console.log('✅ Calendar metadata table created successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n⚠️  Please run this SQL manually in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb/sql\n');
    process.exit(1);
  }
}

applyMigration();
