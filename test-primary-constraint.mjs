#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConstraint() {
  console.log('🧪 Testing unique primary account constraint...\n');

  const userId = 'da5a44b2-06b7-4863-9f95-2c9a883a17e7'; // tdaniel's user ID

  try {
    // Get current accounts
    const { data: accounts } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', userId);

    console.log(`Current accounts for user:`);
    accounts.forEach(acc => {
      console.log(`  ${acc.is_primary ? '⭐' : '  '} ${acc.email} - Primary: ${acc.is_primary}`);
    });
    console.log('');

    // Try to set the Microsoft account as primary (should fail)
    const microsoftAccount = accounts.find(acc => acc.provider === 'MICROSOFT');

    if (!microsoftAccount) {
      console.log('✅ Test skipped: No Microsoft account to test with');
      return;
    }

    console.log(`🧪 TEST: Attempting to set ${microsoftAccount.email} as primary...`);
    console.log('   (This should FAIL because tdaniel@botmakers.ai is already primary)\n');

    const { error } = await supabase
      .from('email_accounts')
      .update({ is_primary: true })
      .eq('id', microsoftAccount.id);

    if (error) {
      console.log('✅ CONSTRAINT WORKING! Error prevented duplicate primary:');
      console.log(`   Error code: ${error.code}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      console.log('🎉 The constraint is successfully preventing duplicate primary accounts!');
      return;
    } else {
      console.log('❌ CONSTRAINT FAILED! Update succeeded when it should have failed');
      console.log('   This means the constraint is not working properly');

      // Revert the change
      console.log('\n🔧 Reverting change...');
      await supabase
        .from('email_accounts')
        .update({ is_primary: false })
        .eq('id', microsoftAccount.id);

      console.log('✅ Reverted');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testConstraint();
