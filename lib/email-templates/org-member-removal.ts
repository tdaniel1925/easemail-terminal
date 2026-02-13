export function getOrgMemberRemovalEmailHtml({
  userName,
  organizationName,
  removedByName,
  role,
}: {
  userName: string;
  organizationName: string;
  removedByName: string;
  role: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Removed from ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #fef2f2; padding: 40px 40px 60px 40px; text-align: center;">
              <div style="background-color: rgba(220, 38, 38, 0.1); width: 80px; height: 80px; border-radius: 12px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: #991b1b; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Access Removed</h1>
              <p style="color: rgba(153, 27, 27, 0.8); font-size: 18px; margin: 0;">${organizationName}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We're writing to inform you that <strong>${removedByName}</strong> has removed you from <strong>${organizationName}</strong>. You no longer have access to this organization's resources.
              </p>

              <!-- Removal Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; background-color: #fef2f2; border-radius: 12px; border-left: 4px solid #dc2626;">
                    <h3 style="color: #991b1b; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Removal Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px;">Organization:</td>
                        <td style="padding: 8px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-align: right;">${organizationName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px;">Your Role:</td>
                        <td style="padding: 8px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-align: right;">${role}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #7f1d1d; font-size: 14px;">Removed By:</td>
                        <td style="padding: 8px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-align: right;">${removedByName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What This Means -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f8fafc; border-radius: 12px;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">What This Means</h3>
                    <ul style="color: #475569; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>You can no longer access ${organizationName}'s dashboard</li>
                      <li>You've lost access to organization resources and data</li>
                      <li>Any shared workflows or integrations will no longer be available</li>
                      <li>Your personal EaseMail account remains active</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0f9ff; border-radius: 12px;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Questions or Concerns?</h3>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                      If you believe this was done in error or have questions about this removal, please contact <strong>${removedByName}</strong> or other administrators of ${organizationName}.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Personal Account Reminder -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #ecfdf5; border-radius: 12px; border-left: 4px solid #10b981;">
                    <h3 style="color: #065f46; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Your Personal Account</h3>
                    <p style="color: #047857; font-size: 14px; line-height: 1.6; margin: 0;">
                      Good news! Your personal EaseMail account is still active. You can continue using EaseMail for your individual needs or join other organizations.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                If you have any questions or concerns, please don't hesitate to reach out to our support team.
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
                Need help? Contact us at <a href="mailto:support@easemail.com" style="color: #0ea5e9; text-decoration: none; font-weight: 600;">support@easemail.com</a>
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0 0 10px 0;">
                © 2025 EaseMail. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                You're receiving this email because you were removed from ${organizationName}
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
