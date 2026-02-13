#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAvi() {
  console.log('🔍 Looking for Avi in the system...\n');

  try {
    // Search for users with "avi" in name or email
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or('name.ilike.%avi%,email.ilike.%avi%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching for Avi:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No users found with "avi" in name or email');
      console.log('\n💡 Please provide Avi\'s email address so I can check specifically.');
      return;
    }

    console.log(`Found ${users.length} user(s):\n`);

    for (const user of users) {
      console.log('━'.repeat(60));
      console.log(`👤 ${user.name || 'No name'}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🆔 ID: ${user.id}`);
      console.log(`📅 Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`🔐 Has password: ${user.encrypted_password ? 'Yes' : 'No (OAuth or no password set)'}`);

      // Check if they have auth.users entry
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id);

      if (authUser?.user) {
        console.log(`✅ Auth user exists`);
        console.log(`   Provider: ${authUser.user.app_metadata?.provider || 'email'}`);
        console.log(`   Email confirmed: ${authUser.user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`   Last sign in: ${authUser.user.last_sign_in_at ? new Date(authUser.user.last_sign_in_at).toLocaleString() : 'Never'}`);
      } else {
        console.log(`⚠️  No auth user found (this is a problem!)`);
      }

      console.log('');
    }

    console.log('\n💡 How users are created:');
    console.log('   1. Self signup: User sets their own password');
    console.log('   2. Admin creates: Password should be generated and emailed');
    console.log('   3. OAuth (Google/Microsoft): No password needed');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAvi();
