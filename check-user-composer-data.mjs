#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserData() {
  console.log('🔍 Checking your account data that email composer uses...\n');

  const userId = 'da5a44b2-06b7-4863-9f95-2c9a883a17e7'; // Your user ID

  try {
    // Check email accounts
    const { data: accounts } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', userId);

    console.log('📧 Email Accounts:', accounts?.length || 0);
    accounts?.forEach(acc => {
      console.log(`   - ${acc.email} (${acc.provider}) - Primary: ${acc.is_primary}`);
    });

    // Check drafts
    const { data: drafts } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', userId);

    console.log('\n📝 Drafts:', drafts?.length || 0);
    if (drafts && drafts.length > 0) {
      drafts.forEach(draft => {
        console.log(`   - Subject: ${draft.subject || '(no subject)'}`);
        console.log(`     To: ${JSON.stringify(draft.to_recipients)}`);
        console.log(`     Created: ${draft.created_at}`);
      });
    }

    // Check templates
    const { data: templates } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', userId);

    console.log('\n📄 Templates:', templates?.length || 0);
    if (templates && templates.length > 0) {
      templates.forEach(template => {
        console.log(`   - ${template.name} (${template.category})`);
      });
    }

    // Check signatures
    const { data: signatures } = await supabase
      .from('signatures')
      .select('*')
      .eq('user_id', userId);

    console.log('\n✍️  Signatures:', signatures?.length || 0);
    if (signatures && signatures.length > 0) {
      signatures.forEach(sig => {
        console.log(`   - ${sig.name} (Default: ${sig.is_default})`);
      });
    }

    // Check recent recipients
    const { data: recipients } = await supabase
      .from('recent_recipients')
      .select('*')
      .eq('user_id', userId)
      .limit(5);

    console.log('\n👥 Recent Recipients:', recipients?.length || 0);

    console.log('\n━'.repeat(60));
    console.log('\n💡 Analysis:');

    if (drafts && drafts.length > 0) {
      console.log('⚠️  You have drafts - the composer might be trying to load one');
    }

    if (accounts && accounts.length > 1) {
      console.log('ℹ️  You have multiple email accounts - composer needs to handle account selection');
    }

    if (templates && templates.length > 0) {
      console.log(`ℹ️  You have ${templates.length} templates`);
    }

    console.log('\n🔧 Recommended Actions:');
    console.log('1. Clear browser cache completely (Ctrl+Shift+Delete)');
    console.log('2. Close ALL browser tabs');
    console.log('3. Reopen browser and try again');
    console.log('4. If still fails, try Incognito/Private mode');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserData();
