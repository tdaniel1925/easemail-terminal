import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const SUPER_ADMIN_USER = {
  email: 'playwright-superadmin@example.org',
  password: 'SuperAdmin123!',
  name: 'Playwright Super Admin'
};

async function createSuperAdminUser() {
  console.log('Creating super admin test user for Playwright tests...');
  console.log(`Email: ${SUPER_ADMIN_USER.email}`);

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error checking existing users:', listError);
      process.exit(1);
    }

    const existingUser = existingUsers.users.find(u => u.email === SUPER_ADMIN_USER.email);

    if (existingUser) {
      console.log('✅ Super admin test user already exists!');
      console.log(`User ID: ${existingUser.id}`);

      // Ensure user is marked as super admin in users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_super_admin: true })
        .eq('id', existingUser.id);

      if (updateError) {
        console.warn('Warning: Could not update super admin status:', updateError.message);
      } else {
        console.log('✅ Super admin status updated successfully');
      }

      // Mark onboarding as complete
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: existingUser.id,
          use_case: 'work',
          ai_features_enabled: true,
          auto_categorize: true,
          notification_schedule: {},
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (prefsError) {
        console.warn('Warning: Could not set onboarding preferences:', prefsError.message);
      } else {
        console.log('✅ Onboarding marked as complete');
      }

      return;
    }

    // Create new super admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: SUPER_ADMIN_USER.email,
      password: SUPER_ADMIN_USER.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: SUPER_ADMIN_USER.name
      }
    });

    if (error) {
      console.error('❌ Error creating super admin user:', error);
      process.exit(1);
    }

    console.log('✅ Super admin user created successfully!');
    console.log(`User ID: ${data.user.id}`);

    // Set super admin status in users table
    const { error: roleError } = await supabase
      .from('users')
      .update({ is_super_admin: true })
      .eq('id', data.user.id);

    if (roleError) {
      console.warn('Warning: Could not set super admin status:', roleError.message);
    } else {
      console.log('✅ Super admin status set successfully');
    }

    // Mark onboarding as complete
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: data.user.id,
        use_case: 'work',
        ai_features_enabled: true,
        auto_categorize: true,
        notification_schedule: {},
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (prefsError) {
      console.warn('Warning: Could not set onboarding preferences:', prefsError.message);
    } else {
      console.log('✅ Onboarding marked as complete');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

createSuperAdminUser();
