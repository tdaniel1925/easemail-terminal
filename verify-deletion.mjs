#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use SERVICE ROLE to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUsers() {
  console.log('🔍 Checking database directly with service role...\n');

  try {
    // Count ALL users (bypassing RLS)
    const { count: totalCount, error: totalError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('❌ Error counting total users:', totalError);
      process.exit(1);
    }

    console.log(`📊 Total users in database: ${totalCount}\n`);

    // Find users with test or admin
    const { data: testUsers, error, count } = await supabase
      .from('users')
      .select('id, email, name, created_at', { count: 'exact' })
      .or('email.ilike.%test%,email.ilike.%admin%')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    console.log(`Found ${count} users with "test" or "admin" in email\n`);

    if (testUsers && testUsers.length > 0) {
      console.log('First 20 users:');
      console.log('=' .repeat(80));
      testUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log('-'.repeat(80));
      });
    } else {
      console.log('✅ No test/admin users found - deletion was successful!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
