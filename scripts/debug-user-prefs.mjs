import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const supabaseUser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('🔍 Debugging user_preferences for recent test users...\n');

async function debugUserPrefs() {
  try {
    // Get recent test users (created in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, created_at')
      .gte('created_at', oneHourAgo)
      .like('email', 'test-%@example.com')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No recent test users found (created in last hour)');
      return;
    }

    console.log(`📊 Found ${users.length} recent test users:\n`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.created_at}`);

      // Check preferences using admin client
      const { data: adminPrefs, error: adminError } = await supabaseAdmin
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminError) {
        console.log(`   ❌ Admin query error: ${adminError.message}`);
      } else if (!adminPrefs) {
        console.log(`   ⚠️  NO user_preferences record found!`);
      } else {
        console.log(`   ✅ Preferences exist (via admin):`);
        console.log(`      - onboarding_completed: ${adminPrefs.onboarding_completed}`);
        console.log(`      - created_at: ${adminPrefs.created_at}`);
      }

      // Try to query as the user would (simulate auth)
      // Note: This won't work without actual auth session, but we can see the error
      const { data: userPrefs, error: userError } = await supabaseUser
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userError) {
        console.log(`   ⚠️  User client query error: ${userError.message}`);
        console.log(`      (This is expected without auth session)`);
      } else if (!userPrefs) {
        console.log(`   ⚠️  User client: No preferences found`);
      } else {
        console.log(`   ✅ User client can read preferences`);
      }
    }

    // Check RLS policies
    console.log('\n\n🔒 Checking RLS Policies:');
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('pg_policies')
      .select('policyname, cmd, qual, with_check')
      .eq('tablename', 'user_preferences');

    if (policies && policies.length > 0) {
      console.log(`✅ ${policies.length} RLS policies found:`);
      policies.forEach(p => {
        console.log(`\n  Policy: ${p.policyname}`);
        console.log(`    Command: ${p.cmd}`);
        if (p.qual) console.log(`    USING: ${p.qual}`);
        if (p.with_check) console.log(`    WITH CHECK: ${p.with_check}`);
      });
    } else {
      console.log('⚠️  No RLS policies found!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugUserPrefs();
