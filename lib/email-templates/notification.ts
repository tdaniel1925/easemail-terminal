export function getNotificationEmailHtml({
  userName,
  subject,
  message,
  ctaText,
  ctaLink,
}: {
  userName: string;
  subject: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: #1e3a8a; font-size: 32px; font-weight: bold; margin: 0;">${subject}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; white-space: pre-line;">
                ${message}
              </p>

              ${ctaText && ctaLink ? `
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${ctaLink}" style="display: inline-block; background-color: #e8f0fe; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                If you have any questions, feel free to reply to this email or visit our <a href="https://easemail.app/contact" style="color: #5b8def; text-decoration: none;">help center</a>.
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
                This is a notification email from EaseMail
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
