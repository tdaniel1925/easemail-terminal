export function getOrgRoleChangeEmailHtml({
  userName,
  organizationName,
  organizationId,
  oldRole,
  newRole,
  changedByName,
}: {
  userName: string;
  organizationName: string;
  organizationId: string;
  oldRole: string;
  newRole: string;
  changedByName: string;
}) {
  const isPromotion = (oldRole === 'MEMBER' && newRole === 'ADMIN') || (oldRole === 'ADMIN' && newRole === 'OWNER');
  const roleColor = newRole === 'ADMIN' ? '#0ea5e9' : newRole === 'MEMBER' ? '#10b981' : '#8b5cf6';
  const bgColor = newRole === 'ADMIN' ? '#e8f0fe' : newRole === 'MEMBER' ? '#ecfdf5' : '#f3e8ff';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Role Has Changed in ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${bgColor}; padding: 40px 40px 60px 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 12px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: #1e3a8a; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Role Updated</h1>
              <p style="color: rgba(30, 58, 138, 0.8); font-size: 18px; margin: 0;">${organizationName}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                <strong>${changedByName}</strong> has ${isPromotion ? 'promoted you to' : 'changed your role to'} <strong>${newRole}</strong> in <strong>${organizationName}</strong>.
              </p>

              <!-- Role Change Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; background-color: ${bgColor}; border-radius: 12px; border: 2px solid ${roleColor};">
                    <div style="text-align: center;">
                      <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">Previous Role</p>
                      <p style="color: #94a3b8; font-size: 18px; font-weight: 600; margin: 0 0 16px 0; text-decoration: line-through;">${oldRole}</p>
                      <p style="color: #475569; font-size: 24px; margin: 0 0 8px 0;">↓</p>
                      <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">New Role</p>
                      <p style="color: ${roleColor}; font-size: 24px; font-weight: bold; margin: 0;">${newRole}</p>
                    </div>
                  </td>
                </tr>
              </table>

              ${newRole === 'ADMIN' ? `
              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                As an <strong>Admin</strong>, you now have elevated privileges:
              </p>

              <!-- Admin Privileges -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px; background-color: #ecfeff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      <strong>👥 Manage Members</strong><br>
                      Invite, remove, and change roles for team members
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px; background-color: #ecfeff; border-radius: 8px; border-left: 4px solid #06b6d4;">
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      <strong>⚙️ Configure Settings</strong><br>
                      Update organization settings and preferences
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 16px; background-color: #ecfeff; border-radius: 8px; border-left: 4px solid #14b8a6;">
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      <strong>📊 View Analytics</strong><br>
                      Access organization-wide reports and metrics
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${newRole === 'MEMBER' ? `
              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                As a <strong>Member</strong>, you can use all organization resources but won't have administrative privileges to manage members or change settings.
              </p>
              ` : ''}

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/organization/${organizationId}" style="display: inline-block; background-color: ${roleColor}; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      View Organization
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Questions about this change? Contact ${changedByName} or other organization admins.
              </p>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Best regards,<br>
                <strong style="color: #1e3a8a;">The EaseMail Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 2px solid #e2e8f0;">
              <p style="color: #475569; font-size: 13px; margin: 0 0 8px 0;">
                Need help? Contact us at <a href="mailto:support@easemail.com" style="color: ${roleColor}; text-decoration: none; font-weight: 600;">support@easemail.com</a>
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0 0 10px 0;">
                © 2025 EaseMail. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                You're receiving this email because your role was changed in ${organizationName}
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
