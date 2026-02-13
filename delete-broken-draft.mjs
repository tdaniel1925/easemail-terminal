#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteDraft() {
  console.log('🗑️  Deleting problematic draft...\n');

  const userId = 'da5a44b2-06b7-4863-9f95-2c9a883a17e7';

  try {
    // Get the draft
    const { data: drafts } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', userId);

    if (!drafts || drafts.length === 0) {
      console.log('✅ No drafts to delete');
      return;
    }

    console.log(`Found ${drafts.length} draft(s):`);
    drafts.forEach(draft => {
      console.log(`   - ID: ${draft.id}`);
      console.log(`     Subject: ${draft.subject || '(no subject)'}`);
      console.log(`     Created: ${draft.created_at}`);
    });

    console.log('\n🗑️  Deleting...');

    // Delete all drafts for this user
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error deleting drafts:', error);
      return;
    }

    console.log('✅ Drafts deleted successfully!');
    console.log('\n💡 Now try clicking compose - it should work!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteDraft();
