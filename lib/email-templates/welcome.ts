export function getWelcomeEmailHtml({
  userName,
  userEmail,
  initialPassword,
}: {
  userName: string;
  userEmail: string;
  initialPassword?: string; // Optional - some contexts don't require password
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EaseMail</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">

          <!-- Logo and Header -->
          <tr>
            <td style="background-color: #e8f0fe; padding: 40px; text-align: center; border-bottom: 3px solid #5b8def;">
              <div style="margin-bottom: 20px;">
                <div style="display: inline-block; background-color: #5b8def; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                  EaseMail
                </div>
              </div>
              <h1 style="color: #1e3a8a; font-size: 32px; font-weight: bold; margin: 20px 0 8px 0;">Welcome to EaseMail!</h1>
              <p style="color: #3b82f6; font-size: 18px; margin: 0; font-weight: 500;">Email that feels effortless</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thanks for joining EaseMail! We're excited to help you transform your email workflow with AI-powered features and intelligent organization.
              </p>

              <!-- Login Credentials Box (only if new user with password) -->
              ${initialPassword ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 24px; background-color: #dbeafe; border-radius: 12px; border: 2px solid #5b8def;">
                    <h3 style="color: #1e3a8a; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">🔐 Your Login Credentials</h3>

                    <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0; font-weight: 600;">Email:</p>
                      <p style="color: #111827; font-size: 16px; margin: 0; font-family: 'Courier New', monospace;">${userEmail}</p>
                    </div>

                    <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0; font-weight: 600;">Temporary Password:</p>
                      <p style="color: #1e3a8a; font-size: 18px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 1px;">${initialPassword}</p>
                    </div>

                    <div style="background-color: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                      <p style="color: #92400e; font-size: 13px; line-height: 1.5; margin: 0;">
                        <strong>⚠️ Important:</strong> You can change this password anytime in Settings → Security after logging in.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Login CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/login" style="display: inline-block; background-color: #5b8def; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(91, 141, 239, 0.3);">
                      Log In Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Once logged in, here's what you can do:
              </p>

              <!-- Feature Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0f9ff; border-radius: 10px; border-left: 4px solid #5b8def;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">📧 Connect Your Email</h3>
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      Connect Gmail, Outlook, or any IMAP account in seconds.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0f9ff; border-radius: 10px; border-left: 4px solid #5b8def;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">🤖 Try AI Features</h3>
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      Let AI help you write, reply, and organize your emails faster.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0f9ff; border-radius: 10px; border-left: 4px solid #5b8def;">
                    <h3 style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">👥 Invite Your Team</h3>
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      Add team members and start collaborating on emails together.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Change Password CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/settings/security" style="display: inline-block; background-color: #5b8def; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 2px 4px rgba(91, 141, 239, 0.3);">
                      Change Your Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Need help getting started? Just reply to this email or visit our <a href="https://easemail.app/contact" style="color: #5b8def; text-decoration: none; font-weight: 600;">help center</a>.
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
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">
                Need help? Contact us at <a href="mailto:support@easemail.com" style="color: #5b8def; text-decoration: none; font-weight: 600;">support@easemail.com</a>
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">
                © 2025 EaseMail. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                You're receiving this email because you signed up for EaseMail with ${userEmail}
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
