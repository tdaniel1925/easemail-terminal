export function getOrganizationInviteEmailHtml({
  inviteeName,
  organizationName,
  inviterName,
  role,
  inviteLink,
}: {
  inviteeName: string;
  organizationName: string;
  inviterName: string;
  role: string;
  inviteLink: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #e8f0fe; padding: 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 12px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="8.5" cy="7" r="4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20 8V14M23 11H17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: #1e3a8a; font-size: 32px; font-weight: bold; margin: 0;">You're Invited!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${inviteeName},
              </p>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on EaseMail as a <strong>${role}</strong>.
              </p>

              <!-- Organization Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 24px; background-color: #e8f0fe; border-radius: 12px; border: 2px solid #93c5fd;">
                    <h3 style="color: #1e40af; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">
                      🏢 ${organizationName}
                    </h3>
                    <p style="color: #1e3a8a; font-size: 14px; line-height: 1.5; margin: 0;">
                      You'll be joining as: <strong>${role}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                By joining, you'll get access to:
              </p>

              <!-- Features List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                    <span style="color: #374151; font-size: 14px;">Shared team inbox and collaboration</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                    <span style="color: #374151; font-size: 14px;">AI-powered email features</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                    <span style="color: #374151; font-size: 14px;">Team templates and signatures</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                    <span style="color: #374151; font-size: 14px;">Unified calendar and SMS integration</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}" style="display: inline-block; background-color: #e8f0fe; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="color: #5b8def; font-size: 12px; line-height: 1.6; margin: 10px 0; word-break: break-all;">
                ${inviteLink}
              </p>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Questions? Reply to this email or contact our support team.
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
                You received this invitation from ${inviterName} at ${organizationName}
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
