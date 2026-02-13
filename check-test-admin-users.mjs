#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTestAdminUsers() {
  console.log('🔍 Finding users with "test" or "admin" in email address...\n');

  try {
    // Find all users with test or admin in email
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .or('email.ilike.%test%,email.ilike.%admin%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('✅ No users found with "test" or "admin" in email address');
      process.exit(0);
    }

    console.log(`Found ${users.length} users:\n`);
    console.log('=' .repeat(80));

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.name || '(no name)'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('-'.repeat(80));
    });

    console.log('\n📊 Summary:');
    console.log(`Total users to delete: ${users.length}`);

    // Show which emails match "test" vs "admin"
    const testUsers = users.filter(u => u.email.toLowerCase().includes('test'));
    const adminUsers = users.filter(u => u.email.toLowerCase().includes('admin'));

    console.log(`  - Containing "test": ${testUsers.length}`);
    console.log(`  - Containing "admin": ${adminUsers.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTestAdminUsers();
