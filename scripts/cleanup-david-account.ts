import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAVID_USER_ID = 'cf71035c-3dc6-43bf-a674-8cff51a1eb84';

async function cleanupDavidAccount() {
  try {
    console.log('🔍 Checking David\'s account status...\n');
    console.log(`User ID: ${DAVID_USER_ID}\n`);

    // Get David's user info
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', DAVID_USER_ID)
      .single();

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('✓ User found:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}\n`);

    // Get all email accounts
    const { data: accounts } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', DAVID_USER_ID);

    if (!accounts || accounts.length === 0) {
      console.log('ℹ️  No email accounts found for David');
      return;
    }

    console.log(`📧 Found ${accounts.length} email account(s):\n`);
    accounts.forEach((account: any, index: number) => {
      console.log(`${index + 1}. ${account.email}`);
      console.log(`   Account ID: ${account.id}`);
      console.log(`   Grant ID: ${account.grant_id}`);
      console.log(`   Provider: ${account.provider}`);
      console.log(`   Primary: ${account.is_primary}`);
      console.log(`   Created: ${new Date(account.created_at).toLocaleString()}\n`);
    });

    // Delete invalid email accounts
    console.log('🗑️  Removing invalid email account(s)...\n');

    for (const account of accounts) {
      // Delete folder mappings first
      const { error: folderError } = await supabase
        .from('folder_mappings')
        .delete()
        .eq('email_account_id', account.id);

      if (folderError) {
        console.error(`   ❌ Failed to delete folder mappings for ${account.email}:`, folderError.message);
      } else {
        console.log(`   ✓ Deleted folder mappings for ${account.email}`);
      }

      // Delete the email account
      const { error: accountError } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', account.id);

      if (accountError) {
        console.error(`   ❌ Failed to delete ${account.email}:`, accountError.message);
      } else {
        console.log(`   ✓ Deleted ${account.email}`);
      }
    }

    console.log('\n✅ Cleanup completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. David should log in to EaseMail');
    console.log('   2. Go to Settings → Email Accounts');
    console.log('   3. Click "Connect Email Account"');
    console.log('   4. Reconnect his Microsoft account (david@dmillerlaw.com)');
    console.log('   5. Folders will automatically sync this time!\n');

  } catch (error: any) {
    console.error('❌ Script error:', error.message);
    console.error(error);
  }
}

cleanupDavidAccount();
