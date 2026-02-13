export function getOrgOwnershipTransferPreviousOwnerEmailHtml({
  userName,
  organizationName,
  organizationId,
  newOwnerName,
}: {
  userName: string;
  organizationName: string;
  organizationId: string;
  newOwnerName: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ownership Transfer Confirmed for ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #e8f0fe; padding: 40px 40px 60px 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 12px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: #1e3a8a; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Ownership Transfer Complete</h1>
              <p style="color: rgba(30, 58, 138, 0.8); font-size: 18px; margin: 0;">${organizationName}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                This email confirms that you have successfully transferred ownership of <strong>${organizationName}</strong> to <strong>${newOwnerName}</strong>.
              </p>

              <!-- Transfer Confirmation Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; background-color: #e8f0fe; border-radius: 12px; border: 2px solid #3b82f6;">
                    <h3 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Transfer Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #1e3a8a; font-size: 14px;">Organization:</td>
                        <td style="padding: 8px 0; color: #1e40af; font-size: 14px; font-weight: 600; text-align: right;">${organizationName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #1e3a8a; font-size: 14px;">New Owner:</td>
                        <td style="padding: 8px 0; color: #1e40af; font-size: 14px; font-weight: 600; text-align: right;">${newOwnerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #1e3a8a; font-size: 14px;">Your New Role:</td>
                        <td style="padding: 8px 0; color: #0ea5e9; font-size: 14px; font-weight: 600; text-align: right;">ADMIN</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You've been automatically assigned the <strong>Admin</strong> role and can continue to help manage the organization.
              </p>

              <!-- Admin Capabilities -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #ecfeff; border-radius: 12px;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">What You Can Still Do as Admin</h3>
                    <ul style="color: #475569; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Manage members and their roles (except owner)</li>
                      <li>Invite new team members</li>
                      <li>Configure organization settings</li>
                      <li>View analytics and reports</li>
                      <li>Manage integrations and webhooks</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- What Changed -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
                    <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">What Changed</h3>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
                      As an admin, you can no longer:
                    </p>
                    <ul style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                      <li>Delete the organization</li>
                      <li>Manage billing and subscriptions</li>
                      <li>Transfer ownership</li>
                      <li>Change the owner's role</li>
                    </ul>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 12px 0 0 0;">
                      These actions are now reserved for ${newOwnerName}.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Transition Support -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0f9ff; border-radius: 12px;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Smooth Transition Tips</h3>
                    <ol style="color: #475569; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Coordinate with ${newOwnerName} to ensure they have all necessary information</li>
                      <li>Share any important context about billing, ongoing projects, or team dynamics</li>
                      <li>Review your admin permissions and responsibilities</li>
                      <li>Continue supporting the organization in your admin role</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- Reassurance -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #ecfdf5; border-radius: 12px; border-left: 4px solid #10b981;">
                    <h3 style="color: #065f46; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">You're Still Important!</h3>
                    <p style="color: #047857; font-size: 14px; line-height: 1.6; margin: 0;">
                      Your contributions to ${organizationName} are valued. As an admin, you can continue to play a vital role in the organization's success.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/organization/${organizationId}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      View Organization
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                If you have any questions or concerns about this transfer, please reach out to ${newOwnerName} or our support team.
              </p>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Thank you for your leadership!<br>
                <strong style="color: #1e3a8a;">The EaseMail Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 2px solid #e2e8f0;">
              <p style="color: #475569; font-size: 13px; margin: 0 0 8px 0;">
                Need help? Contact us at <a href="mailto:support@easemail.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">support@easemail.com</a>
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0 0 10px 0;">
                © 2025 EaseMail. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                You're receiving this email because you transferred ownership of ${organizationName}
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
