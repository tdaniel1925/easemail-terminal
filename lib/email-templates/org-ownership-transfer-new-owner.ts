export function getOrgOwnershipTransferNewOwnerEmailHtml({
  userName,
  organizationName,
  organizationId,
  previousOwnerName,
}: {
  userName: string;
  organizationName: string;
  organizationId: string;
  previousOwnerName: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Now the Owner of ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">

          <!-- Header with Crown -->
          <tr>
            <td style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 12px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                  <path d="M5 10l2-4 3 4 4-8 3 4 2-4v10a2 2 0 01-2 2H7a2 2 0 01-2-2V10z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 12px 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">You're the Owner! 👑</h1>
              <p style="color: rgba(255, 255, 255, 0.95); font-size: 18px; margin: 0;">${organizationName}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                <strong>${previousOwnerName}</strong> has transferred ownership of <strong>${organizationName}</strong> to you. You now have full control and responsibility for the organization!
              </p>

              <!-- Ownership Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; text-align: center; border: 3px solid #fbbf24;">
                    <div style="font-size: 48px; margin-bottom: 12px;">👑</div>
                    <h2 style="color: #92400e; font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">Organization Owner</h2>
                    <p style="color: #78350f; font-size: 16px; margin: 0;">${organizationName}</p>
                  </td>
                </tr>
              </table>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                As the owner, you now have complete authority over the organization:
              </p>

              <!-- Owner Privileges -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #fbbf24;">
                    <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">👥 Full Member Control</h3>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.5; margin: 0;">
                      Add, remove, and manage all members and their roles, including admins.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
                    <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">💳 Billing & Subscriptions</h3>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.5; margin: 0;">
                      Manage payment methods, upgrade or downgrade plans, and control seat allocation.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #d97706;">
                    <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">⚙️ Organization Settings</h3>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.5; margin: 0;">
                      Configure all organization settings, integrations, and preferences.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #b45309;">
                    <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">🔄 Transfer Ownership</h3>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.5; margin: 0;">
                      Transfer ownership to another member when needed.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #fee2e2; border-radius: 12px; border-left: 4px solid #ef4444;">
                    <h3 style="color: #991b1b; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">🗑️ Delete Organization</h3>
                    <p style="color: #7f1d1d; font-size: 14px; line-height: 1.5; margin: 0;">
                      Permanently delete the organization (use with extreme caution).
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Important Information -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #eff6ff; border-radius: 12px; border: 2px solid #3b82f6;">
                    <h3 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">📋 Important Notes</h3>
                    <ul style="color: #1e3a8a; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li><strong>${previousOwnerName}</strong> is now an Admin and can still help manage the organization</li>
                      <li>Review billing settings and payment methods</li>
                      <li>Familiarize yourself with all organization settings</li>
                      <li>With great power comes great responsibility!</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0f9ff; border-radius: 12px;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">🚀 Recommended Next Steps</h3>
                    <ol style="color: #475569; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Review and update billing information if needed</li>
                      <li>Verify payment methods are up to date</li>
                      <li>Review member roles and permissions</li>
                      <li>Check organization settings and preferences</li>
                      <li>Coordinate with ${previousOwnerName} for any ongoing matters</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/organization/${organizationId}" style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(251, 191, 36, 0.3);">
                      Manage Your Organization
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Questions about your new role? Feel free to reach out to our support team or coordinate with ${previousOwnerName}.
              </p>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Best regards,<br>
                <strong style="color: #1e3a8a;">The EaseMail Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 2px solid #fbbf24;">
              <p style="color: #475569; font-size: 13px; margin: 0 0 8px 0;">
                Need help? Contact us at <a href="mailto:support@easemail.com" style="color: #f59e0b; text-decoration: none; font-weight: 600;">support@easemail.com</a>
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0 0 10px 0;">
                © 2025 EaseMail. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                You're receiving this email because you're now the owner of ${organizationName}
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
