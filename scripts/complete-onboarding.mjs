import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const email = process.argv[2];

if (!email) {
  console.error('Usage: node complete-onboarding.mjs <email>');
  process.exit(1);
}

console.log(`Marking onboarding as complete for: ${email}`);

try {
  // Get user by email
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    process.exit(1);
  }

  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log('Found user:', user.id);

  // Mark onboarding as complete
  const { error } = await supabaseAdmin
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      use_case: 'work',
      ai_features_enabled: true,
      auto_categorize: true,
      notification_schedule: {},
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating preferences:', error);
    process.exit(1);
  }

  console.log('✓ Onboarding marked as complete!');
  console.log('✓ User can now access all features');
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
