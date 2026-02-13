#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMarcela() {
  console.log('🔍 Checking for Marcela in database...\n');

  try {
    // Find Marcela in users table
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .or('email.ilike.%marcela%,name.ilike.%marcela%');

    if (userError) {
      console.error('❌ Error finding user:', userError);
      process.exit(1);
    }

    console.log(`Found ${users?.length || 0} user(s) matching "marcela":\n`);

    if (users && users.length > 0) {
      users.forEach(user => {
        console.log('👤 User Details:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.created_at}`);
        console.log();

        // Check if this user is in any organization
        checkOrganizationMembership(user.id, user.email);
      });
    } else {
      console.log('❌ No user found with "marcela" in name or email');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function checkOrganizationMembership(userId, email) {
  console.log(`   📋 Checking organization memberships for ${email}...\n`);

  // Check organization_members
  const { data: memberships, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      organizations:organization_id(id, name)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('   ❌ Error checking memberships:', error);
    return;
  }

  if (memberships && memberships.length > 0) {
    console.log(`   ✅ Found ${memberships.length} organization membership(s):\n`);
    memberships.forEach(membership => {
      console.log(`      Organization: ${membership.organizations?.name}`);
      console.log(`      Organization ID: ${membership.organization_id}`);
      console.log(`      Role: ${membership.role}`);
      console.log(`      Joined: ${membership.joined_at}`);
      console.log();
    });
  } else {
    console.log('   ⚠️  User is NOT a member of any organization!\n');
  }

  // Also check all Darren Miller Law Firm members
  console.log('   📋 All members of Darren Miller Law Firm organization:\n');

  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name')
    .ilike('name', '%darren%miller%');

  if (orgs && orgs.length > 0) {
    for (const org of orgs) {
      console.log(`   Organization: ${org.name} (${org.id})`);

      const { data: allMembers } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          role,
          joined_at,
          users:user_id(email, name)
        `)
        .eq('organization_id', org.id);

      if (allMembers && allMembers.length > 0) {
        console.log(`   Total members: ${allMembers.length}\n`);
        allMembers.forEach(member => {
          console.log(`      - ${member.users?.email} (${member.users?.name || 'no name'})`);
          console.log(`        Role: ${member.role}, Joined: ${member.joined_at}`);
        });
      } else {
        console.log('   No members found in this organization!\n');
      }
    }
  }
}

checkMarcela();
