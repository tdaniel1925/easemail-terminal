#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPrimaryAccounts() {
  console.log('🔧 Fixing primary account for tdaniel@botmakers.ai...\n');

  const userId = 'da5a44b2-06b7-4863-9f95-2c9a883a17e7';

  try {
    // Get all accounts for this user
    const { data: accounts } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', userId);

    console.log(`Found ${accounts.length} accounts:`);
    accounts.forEach(acc => {
      console.log(`  - ${acc.email} (${acc.provider}) - Primary: ${acc.is_primary}`);
    });

    // Find the IMAP account (tdaniel@botmakers.ai) and Microsoft account
    const imapAccount = accounts.find(acc => acc.provider === 'IMAP');
    const microsoftAccount = accounts.find(acc => acc.provider === 'MICROSOFT');

    if (!imapAccount) {
      console.error('\n❌ IMAP account not found!');
      return;
    }

    console.log(`\n✅ Will set IMAP account (${imapAccount.email}) as PRIMARY`);
    if (microsoftAccount) {
      console.log(`✅ Will unset Microsoft account (${microsoftAccount.email}) as non-primary`);
    }

    // Set IMAP as primary
    const { error: imapError } = await supabase
      .from('email_accounts')
      .update({ is_primary: true })
      .eq('id', imapAccount.id);

    if (imapError) {
      console.error('\n❌ Failed to set IMAP as primary:', imapError);
      return;
    }

    console.log(`\n✅ ${imapAccount.email} set as primary`);

    // Unset Microsoft as non-primary
    if (microsoftAccount) {
      const { error: msError } = await supabase
        .from('email_accounts')
        .update({ is_primary: false })
        .eq('id', microsoftAccount.id);

      if (msError) {
        console.error(`\n⚠️  Warning: Failed to unset Microsoft account:`, msError);
      } else {
        console.log(`✅ ${microsoftAccount.email} set as non-primary`);
      }
    }

    // Verify the fix
    console.log('\n🔍 Verifying fix...\n');

    const { data: updatedAccounts } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', userId);

    const primaryCount = updatedAccounts.filter(acc => acc.is_primary).length;

    console.log('Updated accounts:');
    updatedAccounts.forEach(acc => {
      console.log(`  ${acc.is_primary ? '⭐' : '  '} ${acc.email} (${acc.provider}) - Primary: ${acc.is_primary}`);
    });

    if (primaryCount === 1) {
      console.log('\n🎉 SUCCESS! Only one primary account now.');
      console.log('\n💡 The compose dialog should work now. Please refresh the page and try again.');
    } else {
      console.log(`\n⚠️  Warning: Still have ${primaryCount} primary accounts`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

fixPrimaryAccounts();
