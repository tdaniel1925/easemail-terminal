import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { syncFoldersForAccount } from '../lib/nylas/folder-utils';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncDavidFolders() {
  try {
    console.log('🔍 Looking for David\'s email account...\n');

    // Find David's account
    const { data: accounts, error: fetchError } = await supabase
      .from('email_accounts')
      .select('id, email, user_id, grant_id, provider, created_at')
      .or('email.ilike.%david%,email.ilike.%dmillerlaw%')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching accounts:', fetchError);
      return;
    }

    if (!accounts || accounts.length === 0) {
      console.log('❌ No accounts found for David');
      return;
    }

    console.log(`✓ Found ${accounts.length} account(s):\n`);
    accounts.forEach((account: any, index: number) => {
      console.log(`${index + 1}. ${account.email}`);
      console.log(`   Account ID: ${account.id}`);
      console.log(`   User ID: ${account.user_id}`);
      console.log(`   Provider: ${account.provider}`);
      console.log(`   Created: ${new Date(account.created_at).toLocaleString()}\n`);
    });

    // Sync folders for each account using the sync utility directly
    for (const account of accounts) {
      console.log(`📁 Syncing folders for ${account.email}...`);

      try {
        const result = await syncFoldersForAccount(
          account.id,
          account.user_id,
          account.grant_id
        );

        if (result.success) {
          console.log(`✓ Sync completed for ${account.email}`);
          console.log(`   Folders synced: ${result.synced || 0}`);
        } else {
          console.error(`❌ Sync failed for ${account.email}`);
          if (result.errors && result.errors.length > 0) {
            console.log(`   Errors: ${result.errors.join(', ')}`);
          }
        }
      } catch (syncError: any) {
        console.error(`❌ Error syncing ${account.email}:`, syncError.message);
        console.error('   Full error:', syncError);
      }

      console.log('');
    }

    console.log('✅ Folder sync process completed!');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

syncDavidFolders();
