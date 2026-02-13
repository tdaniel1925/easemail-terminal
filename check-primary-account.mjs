#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAccounts() {
  console.log('🔍 Checking all email accounts and primary status...\n');

  try {
    // Get all users with email accounts
    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('id, user_id, email, provider, is_primary, grant_id, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accounts:', error);
      return;
    }

    if (!accounts || accounts.length === 0) {
      console.log('❌ No email accounts found');
      return;
    }

    console.log(`Found ${accounts.length} email account(s):\n`);

    // Group by user
    const accountsByUser = {};
    for (const acc of accounts) {
      if (!accountsByUser[acc.user_id]) {
        accountsByUser[acc.user_id] = [];
      }
      accountsByUser[acc.user_id].push(acc);
    }

    // Check each user
    for (const [userId, userAccounts] of Object.entries(accountsByUser)) {
      // Get user info
      const { data: user } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();

      console.log(`👤 User: ${user?.name || 'Unknown'} (${user?.email})`);
      console.log(`   User ID: ${userId}`);

      const primaryAccounts = userAccounts.filter(acc => acc.is_primary);

      if (primaryAccounts.length === 0) {
        console.log(`   ⚠️  NO PRIMARY ACCOUNT SET!`);
      } else if (primaryAccounts.length > 1) {
        console.log(`   ⚠️  MULTIPLE PRIMARY ACCOUNTS (${primaryAccounts.length})!`);
      } else {
        console.log(`   ✅ Has primary account`);
      }

      userAccounts.forEach(acc => {
        console.log(`   ${acc.is_primary ? '⭐' : '  '} ${acc.email} (${acc.provider})`);
        console.log(`      ID: ${acc.id}`);
        console.log(`      Grant: ${acc.grant_id || 'N/A'}`);
        console.log(`      Primary: ${acc.is_primary ? 'YES' : 'NO'}`);
        console.log(`      Created: ${new Date(acc.created_at).toLocaleString()}`);
      });
      console.log('');
    }

    // Check for users with no primary
    const usersNeedingFix = Object.entries(accountsByUser)
      .filter(([_, accs]) => !accs.some(acc => acc.is_primary))
      .map(([userId, _]) => userId);

    if (usersNeedingFix.length > 0) {
      console.log('━'.repeat(60));
      console.log('\n⚠️  ISSUE FOUND!\n');
      console.log(`${usersNeedingFix.length} user(s) have no primary account set:`);

      for (const userId of usersNeedingFix) {
        const accs = accountsByUser[userId];
        const { data: user } = await supabase
          .from('users')
          .select('email')
          .eq('id', userId)
          .single();

        console.log(`\n   User: ${user?.email}`);
        console.log(`   Accounts: ${accs.map(a => a.email).join(', ')}`);
        console.log(`   Fix: Set one account as primary`);

        // Automatically fix: set first account as primary
        if (accs.length > 0) {
          console.log(`\n   🔧 Auto-fixing: Setting ${accs[0].email} as primary...`);

          const { error: updateError } = await supabase
            .from('email_accounts')
            .update({ is_primary: true })
            .eq('id', accs[0].id);

          if (updateError) {
            console.error(`   ❌ Failed to fix: ${updateError.message}`);
          } else {
            console.log(`   ✅ Fixed! ${accs[0].email} is now primary`);
          }
        }
      }
    } else {
      console.log('✅ All users have proper primary account setup!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAccounts();
