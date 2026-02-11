export function getPasswordResetEmailHtml({
  userName,
  resetLink,
}: {
  userName: string;
  resetLink: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
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
              <h1 style="color: #1e3a8a; font-size: 32px; font-weight: bold; margin: 20px 0 0 0;">Reset Your Password</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your password for your EaseMail account. Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; background-color: #5b8def; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(91, 141, 239, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 10px; border-left: 4px solid #f59e0b;">
                    <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                      <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="color: #5b8def; font-size: 12px; line-height: 1.6; margin: 10px 0; word-break: break-all;">
                ${resetLink}
              </p>

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
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
                This is an automated security email from EaseMail
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
