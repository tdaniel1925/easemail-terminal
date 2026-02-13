#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function triggerDavidSync() {
  console.log('🔍 Finding David\'s email account...\n');

  try {
    // Find David's user account
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .or('name.ilike.%david%,email.ilike.%david%')
      .limit(5);

    if (userError) {
      console.error('Error finding David:', userError);
      process.exit(1);
    }

    console.log('Found users:', users);

    if (!users || users.length === 0) {
      console.error('❌ David not found');
      process.exit(1);
    }

    // Get David's email account
    for (const user of users) {
      console.log(`\nChecking email accounts for ${user.name} (${user.email})...`);

      const { data: accounts, error: accountError } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountError) {
        console.error('Error fetching accounts:', accountError);
        continue;
      }

      if (accounts && accounts.length > 0) {
        console.log(`Found ${accounts.length} email account(s):`);
        accounts.forEach(acc => {
          console.log(`  - ${acc.email} (${acc.provider}) - ID: ${acc.id}`);
          console.log(`    Grant ID: ${acc.grant_id}`);
          console.log(`    Created: ${acc.created_at}`);
        });

        // Trigger sync for the first account
        const account = accounts[0];
        console.log(`\n🚀 Triggering full mailbox sync for: ${account.email}`);
        console.log(`Account ID: ${account.id}`);
        console.log(`User ID: ${user.id}`);
        console.log(`Grant ID: ${account.grant_id}`);

        // Import and call the sync function directly
        const { performInitialSync } = await import('./lib/nylas/initial-sync.ts');

        console.log('\n⏳ Starting full mailbox sync...');
        console.log('This may take several minutes depending on mailbox size.\n');

        const result = await performInitialSync(
          account.id,
          user.id,
          account.grant_id,
          true // Full sync: all folders, all messages
        );

        console.log('\n✅ Sync completed!');
        console.log('Results:');
        console.log(`  📁 Folders: ${result.folders.synced} synced, ${result.folders.errors.length} errors`);
        console.log(`  📧 Messages: ${result.messages.synced} synced, ${result.messages.errors.length} errors`);
        console.log(`  📅 Calendars: ${result.calendars.synced} synced, ${result.calendars.errors.length} errors`);

        if (result.folders.errors.length > 0) {
          console.log('\n⚠️  Folder errors:');
          result.folders.errors.forEach(err => console.log(`    - ${err}`));
        }
        if (result.messages.errors.length > 0) {
          console.log('\n⚠️  Message errors (first 5):');
          result.messages.errors.slice(0, 5).forEach(err => console.log(`    - ${err}`));
          if (result.messages.errors.length > 5) {
            console.log(`    ... and ${result.messages.errors.length - 5} more`);
          }
        }
        if (result.calendars.errors.length > 0) {
          console.log('\n⚠️  Calendar errors:');
          result.calendars.errors.forEach(err => console.log(`    - ${err}`));
        }

        console.log('\n🎉 David can now see all his emails and calendars!');
        return;
      }
    }

    console.error('❌ No email accounts found for David');
    process.exit(1);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

triggerDavidSync();
