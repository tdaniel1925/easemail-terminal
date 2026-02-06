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

const TEST_USER = {
  email: 'playwright-test@example.org',
  password: 'PlaywrightTest123!',
  name: 'Playwright Test User'
};

async function createTestUser() {
  console.log('Creating test user for Playwright tests...');
  console.log(`Email: ${TEST_USER.email}`);

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error checking existing users:', listError);
      process.exit(1);
    }

    const existingUser = existingUsers.users.find(u => u.email === TEST_USER.email);

    if (existingUser) {
      console.log('✅ Test user already exists!');
      console.log(`User ID: ${existingUser.id}`);

      // Update the user's profile to ensure name is set
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: existingUser.id,
          email: TEST_USER.email,
          full_name: TEST_USER.name,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (updateError) {
        console.warn('Warning: Could not update profile:', updateError.message);
      } else {
        console.log('✅ Profile updated successfully');
      }

      // Mark onboarding as complete for existing user
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

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: TEST_USER.name
      }
    });

    if (error) {
      console.error('❌ Error creating test user:', error);
      process.exit(1);
    }

    console.log('✅ Test user created successfully!');
    console.log(`User ID: ${data.user.id}`);

    // Create profile for the user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: TEST_USER.email,
        full_name: TEST_USER.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.warn('Warning: Could not create profile:', profileError.message);
    } else {
      console.log('✅ Profile created successfully');
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

createTestUser();
