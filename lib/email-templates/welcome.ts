export function getWelcomeEmailHtml({
  userName,
  userEmail,
  initialPassword,
}: {
  userName: string;
  userEmail: string;
  initialPassword?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EaseMail</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 16px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" stroke-width="2"/>
                  <path d="M3 7L12 13L21 7" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Welcome to EaseMail!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 18px; margin: 0;">Email that feels effortless</p>
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

              ${initialPassword ? `
              <!-- Login Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 24px; background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 12px; border: 2px solid #8b5cf6;">
                    <h3 style="color: #5b21b6; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">🔐 Your Login Credentials</h3>

                    <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0; font-weight: 600;">Email:</p>
                      <p style="color: #111827; font-size: 16px; margin: 0; font-family: 'Courier New', monospace;">${userEmail}</p>
                    </div>

                    <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0; font-weight: 600;">Temporary Password:</p>
                      <p style="color: #5b21b6; font-size: 18px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 1px;">${initialPassword}</p>
                    </div>

                    <div style="background-color: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                      <p style="color: #92400e; font-size: 13px; line-height: 1.5; margin: 0;">
                        <strong>⚠️ Important:</strong> Please change this password immediately after your first login for security.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Login CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/login" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                      Log In Now
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                ${initialPassword ? 'Once logged in, here\'s what you can do:' : 'Here\'s what you can do next:'}
              </p>

              <!-- Feature Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #3b82f6;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">📧 Connect Your Email</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Connect Gmail, Outlook, or any IMAP account in seconds.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #6366f1;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">🤖 Try AI Features</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Let AI help you write, reply, and organize your emails faster.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #8b5cf6;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">👥 Invite Your Team</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Add team members and start collaborating on emails together.
                    </p>
                  </td>
                </tr>
              </table>

              ${!initialPassword ? `
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/inbox" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Go to Your Inbox
                    </a>
                  </td>
                </tr>
              </table>
              ` : `
              <!-- Change Password CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/settings" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                      Change Your Password
                    </a>
                  </td>
                </tr>
              </table>
              `}

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Need help getting started? Just reply to this email or visit our <a href="https://easemail.app/contact" style="color: #3b82f6; text-decoration: none;">help center</a>.
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
