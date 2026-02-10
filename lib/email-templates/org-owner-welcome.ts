export function getOrgOwnerWelcomeEmailHtml({
  userName,
  userEmail,
  organizationName,
  organizationId,
  plan,
  seats,
  temporaryPassword,
}: {
  userName: string;
  userEmail: string;
  organizationName: string;
  organizationId: string;
  plan: string;
  seats: number;
  temporaryPassword?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${organizationName} on EaseMail</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with Gradient (Purple/Gold for owner) -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 16px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Welcome to ${organizationName}!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 18px; margin: 0;">You're the organization owner</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Congratulations on creating <strong>${organizationName}</strong> on EaseMail! Your organization is now set up and ready to transform how your team manages email.
              </p>

              <!-- Organization Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; background: linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%); border-radius: 12px; border: 2px solid #d946ef;">
                    <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📋 Your Organization Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Organization:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${organizationName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plan:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${plan}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Seats Available:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${seats}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Your Role:</td>
                        <td style="padding: 8px 0; color: #7c3aed; font-size: 14px; font-weight: 600; text-align: right;">Owner</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

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
                <strong>Here's your quick start checklist:</strong>
              </p>

              <!-- Quick Start Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #7c3aed;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #7c3aed; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">1</div>
                        </td>
                        <td style="vertical-align: top;">
                          <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">👥 Invite Your Team Members</h3>
                          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                            Add team members as Admins or Members. You have ${seats} seat${seats !== 1 ? 's' : ''} available.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #a855f7;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #a855f7; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">2</div>
                        </td>
                        <td style="vertical-align: top;">
                          <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">📧 Connect Email Accounts</h3>
                          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 8px 0;">
                            Connect Gmail, Outlook, or any IMAP account for you and your team members.
                          </p>
                          <a href="https://easemail.app/app/connect" style="color: #a855f7; font-size: 13px; font-weight: 600; text-decoration: none;">→ Connect Email Accounts</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #d946ef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #d946ef; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">3</div>
                        </td>
                        <td style="vertical-align: top;">
                          <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">⚙️ Configure Organization Settings</h3>
                          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                            Set up your organization profile, branding, and preferences.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #7c3aed;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #7c3aed; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">4</div>
                        </td>
                        <td style="vertical-align: top;">
                          <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">💳 Review Billing Details</h3>
                          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                            Review your billing information and payment method.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Owner Privileges Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #fefce8; border-radius: 12px; border: 2px solid #eab308;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">👑 Your Owner Privileges</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">As the owner, only you can:</p>
                    <ul style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                      <li>Delete the organization</li>
                      <li>Modify billing and subscriptions</li>
                      <li>Transfer ownership to another member</li>
                      <li>Change the organization plan</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/organization/${organizationId}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Go to Organization Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Need help setting up your organization? Visit our <a href="https://easemail.app/help" style="color: #7c3aed; text-decoration: none;">knowledge base</a> or reply to this email.
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
                You're receiving this email because ${userEmail} created ${organizationName}
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
