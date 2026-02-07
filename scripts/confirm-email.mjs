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
  console.error('Usage: node confirm-email.mjs <email>');
  process.exit(1);
}

console.log(`Confirming email for: ${email}`);

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

  // Update user to confirm email
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  );

  if (error) {
    console.error('Error confirming email:', error);
    process.exit(1);
  }

  console.log('✓ Email confirmed successfully!');
  console.log('✓ User can now log in');
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
