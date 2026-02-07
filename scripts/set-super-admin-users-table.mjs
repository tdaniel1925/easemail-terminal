import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

const resend = new Resend(process.env.RESEND_API_KEY);

// Super Admin Welcome Email Template
function getSuperAdminWelcomeEmailHtml({ userName, userEmail }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Now an EaseMail Super Administrator</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Super Administrator Access Granted</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 18px; margin: 0;">You now have full system control</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Congratulations! You've been granted <strong>Super Administrator</strong> privileges on EaseMail. You now have the highest level of access and control over the entire platform.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/admin/analytics" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Access Admin Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #111827;">The EaseMail Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2025 EaseMail. All rights reserved.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                You're receiving this email because ${userEmail} was granted super admin access
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

async function setSuperAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node set-super-admin-users-table.mjs <email>');
    process.exit(1);
  }

  console.log(`Setting ${email} as super admin in users table...`);

  try {
    // Update in users table
    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        is_super_admin: true
      })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      process.exit(1);
    }

    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    console.log('✅ Success! User is now a super admin!');
    console.log('   Email:', user.email);
    console.log('   User ID:', user.id);
    console.log('   Super Admin:', user.is_super_admin);

    // Send super admin welcome email
    try {
      console.log('\nSending super admin welcome email...');
      const html = getSuperAdminWelcomeEmailHtml({
        userName: user.name || user.email.split('@')[0],
        userEmail: user.email,
      });

      await resend.emails.send({
        from: 'EaseMail <noreply@easemail.app>',
        to: user.email,
        subject: "You're Now an EaseMail Super Administrator",
        html,
      });

      console.log('✅ Super admin welcome email sent successfully!');
    } catch (emailError) {
      console.error('⚠️  Failed to send welcome email:', emailError);
      console.log('   User was still granted super admin access.');
    }

    console.log('\nPlease refresh your browser to see the Admin link in the sidebar.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setSuperAdmin();
