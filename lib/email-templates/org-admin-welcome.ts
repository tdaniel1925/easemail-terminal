export function getOrgAdminWelcomeEmailHtml({
  userName,
  userEmail,
  organizationName,
  organizationId,
  inviterName,
  temporaryPassword,
}: {
  userName: string;
  userEmail: string;
  organizationName: string;
  organizationId: string;
  inviterName: string;
  temporaryPassword?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Now an Admin of ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with Gradient (Blue/Cyan for admin) -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 16px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">You're an Admin!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 18px; margin: 0;">${organizationName}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                <strong>${inviterName}</strong> has made you an <strong>Admin</strong> of <strong>${organizationName}</strong> on EaseMail! Welcome to the leadership team.
              </p>

              ${temporaryPassword ? `
              <!-- Login Credentials Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; background-color: #fef3c7; border-radius: 12px; border: 2px solid #f59e0b;">
                    <h3 style="color: #92400e; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">🔐 Your Login Credentials</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Email:</td>
                        <td style="padding: 8px 0; color: #92400e; font-size: 14px; font-weight: 600; text-align: right;">${userEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Temporary Password:</td>
                        <td style="padding: 8px 0; color: #92400e; font-size: 16px; font-weight: 700; text-align: right; font-family: monospace;">${temporaryPassword}</td>
                      </tr>
                    </table>
                    <div style="margin-top: 16px; padding: 12px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                      <p style="color: #991b1b; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">⚠️ IMPORTANT: Change Your Password</p>
                      <p style="color: #7f1d1d; font-size: 12px; line-height: 1.5; margin: 0;">
                        For security, please change this temporary password immediately after your first login. Go to Settings → Security → Change Password.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                As an admin, you have elevated privileges to help manage the organization:
              </p>

              <!-- Admin Privilege Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #ecfeff; border-radius: 12px; border-left: 4px solid #0ea5e9;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">👥 Manage Members</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Invite new team members, assign roles, and remove members from the organization.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #ecfeff; border-radius: 12px; border-left: 4px solid #06b6d4;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">📊 View Analytics</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Access organization-wide analytics, usage reports, and team performance metrics.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #ecfeff; border-radius: 12px; border-left: 4px solid #14b8a6;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">⚙️ Configure Settings</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Update organization settings, manage integrations, and configure team preferences.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #ecfeff; border-radius: 12px; border-left: 4px solid #0ea5e9;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">🔐 Moderate Content</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Help maintain organization security and moderate team communications.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Admin vs Owner Clarification -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 12px; border: 2px solid #f59e0b;">
                    <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">📋 Admin vs Owner</h3>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
                      <strong>As an Admin, you cannot:</strong>
                    </p>
                    <ul style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                      <li>Delete the organization</li>
                      <li>Modify billing or subscription</li>
                      <li>Transfer ownership</li>
                    </ul>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 12px 0 0 0;">
                      These actions are reserved for the organization owner.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Getting Started -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0f9ff; border-radius: 12px;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">🚀 Getting Started as an Admin</h3>
                    <ol style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Familiarize yourself with the organization dashboard</li>
                      <li>Review current members and their roles</li>
                      <li>Check organization settings and preferences</li>
                      <li>Connect with other admins and the owner</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/organization/${organizationId}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Access Organization Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Questions about your admin role? Reach out to ${inviterName} or other organization admins.
              </p>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Best regards,<br>
                <strong style="color: #111827;">The EaseMail Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                Need help? Contact us at <a href="mailto:support@easemail.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">support@easemail.com</a>
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2025 EaseMail. All rights reserved.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                You're receiving this email because ${userEmail} was made an admin of ${organizationName}
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
