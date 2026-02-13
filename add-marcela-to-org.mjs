#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const MARCELA_USER_ID = '788d4fdb-3042-4520-9ccd-3d4e3cc3ad94';
const DARREN_MILLER_ORG_ID = '9c38a469-741e-4ee9-a4a7-d978ad55c3f1';

async function addMarcelaToOrg() {
  console.log('➕ Adding Marcela Jackson to Darren Miller Law Firm organization...\n');

  try {
    const { data, error } = await supabase
      .from('organization_members')
      .insert({
        organization_id: DARREN_MILLER_ORG_ID,
        user_id: MARCELA_USER_ID,
        role: 'MEMBER', // Change to 'ADMIN' if she should be an admin
        joined_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error('❌ Error adding member:', error);
      process.exit(1);
    }

    console.log('✅ Successfully added Marcela to the organization!\n');
    console.log('Member details:');
    console.log(`   User ID: ${MARCELA_USER_ID}`);
    console.log(`   Organization ID: ${DARREN_MILLER_ORG_ID}`);
    console.log(`   Role: MEMBER`);
    console.log(`   Joined: ${data[0].joined_at}`);

    // Verify by checking all members
    console.log('\n📋 Current members of Darren Miller Law Firm:\n');

    const { data: allMembers } = await supabase
      .from('organization_members')
      .select(`
        role,
        joined_at,
        users:user_id(email, name)
      `)
      .eq('organization_id', DARREN_MILLER_ORG_ID);

    if (allMembers) {
      console.log(`Total members: ${allMembers.length}\n`);
      allMembers.forEach((member, index) => {
        console.log(`${index + 1}. ${member.users?.email} (${member.users?.name})`);
        console.log(`   Role: ${member.role}`);
        console.log(`   Joined: ${new Date(member.joined_at).toLocaleString()}`);
        console.log();
      });
    }

    console.log('🎉 Marcela should now appear in the organization members list!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMarcelaToOrg();
