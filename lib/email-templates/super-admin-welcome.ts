export function getSuperAdminWelcomeEmailHtml({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Now an EaseMail Super Administrator</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">

          <!-- Header with Gradient (Red/Orange for admin) -->
          <tr>
            <td style="background-color: #e8f0fe; padding: 40px 40px 60px 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 12px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: #1e3a8a; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Super Administrator Access Granted</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 18px; margin: 0;">You now have full system control</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Congratulations! You've been granted <strong>Super Administrator</strong> privileges on EaseMail. This is the highest level of access in the system.
              </p>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Your new super admin privileges include:
              </p>

              <!-- Privilege Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef2f2; border-radius: 12px; border-left: 4px solid #dc2626;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">🏢 Full Organization Access</h3>
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      View and manage ALL organizations without needing membership. Override any permission restrictions.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef2f2; border-radius: 12px; border-left: 4px solid #ea580c;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">👥 User Management</h3>
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      Create, modify, and delete any user account. Grant or revoke permissions system-wide.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef2f2; border-radius: 10px; border-left: 4px solid #f59e0b;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">📊 System Analytics</h3>
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      Access complete system-wide analytics, revenue reports, and usage statistics.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef2f2; border-radius: 12px; border-left: 4px solid #dc2626;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">💳 Billing Oversight</h3>
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      Manage billing for all organizations, view revenue, and handle subscription issues.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #fffbeb; border-radius: 12px; border: 2px solid #f59e0b;">
                    <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">⚠️ Important: Security Responsibility</h3>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.5; margin: 0;">
                      With great power comes great responsibility. Please use your super admin privileges carefully and ethically. All your actions are logged and auditable.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/admin/analytics" style="display: inline-block; background-color: #e8f0fe; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Access Admin Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Questions about your admin role? Contact the senior admin team or reply to this email.
              </p>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Best regards,<br>
                <strong style="color: #1e3a8a;">The EaseMail Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 2px solid #e8f0fe;">
              <p style="color: #475569; font-size: 13px; margin: 0 0 8px 0;">
                Need help? Contact us at <a href="mailto:support@easemail.com" style="color: #5b8def; text-decoration: none; font-weight: 600;">support@easemail.com</a>
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0 0 10px 0;">
                © 2025 EaseMail. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                You're receiving this email because super admin privileges were granted to ${userEmail}
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
