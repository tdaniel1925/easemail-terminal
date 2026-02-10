export function getOrgMemberWelcomeEmailHtml({
  userName,
  userEmail,
  organizationName,
  organizationId,
  inviterName,
}: {
  userName: string;
  userEmail: string;
  organizationName: string;
  organizationId: string;
  inviterName: string;
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

          <!-- Header with Gradient (Green for member) -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 16px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Welcome to the Team!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 18px; margin: 0;">${organizationName}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${userName},
              </p>

              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Great news! <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on EaseMail. You're now part of the team!
              </p>

              <!-- Welcome Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; border: 2px solid #10b981; text-align: center;">
                    <p style="color: #065f46; font-size: 18px; font-weight: 600; margin: 0;">
                      🎉 You're now a member of ${organizationName}!
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                <strong>What you can do as a member:</strong>
              </p>

              <!-- Member Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0fdf4; border-radius: 12px; border-left: 4px solid #10b981;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">📧 Shared Email Management</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Access shared email accounts and collaborate with your team on email communications.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0fdf4; border-radius: 12px; border-left: 4px solid #14b8a6;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">🤝 Team Collaboration</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Work together on email threads, share templates, and coordinate responses.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0fdf4; border-radius: 12px; border-left: 4px solid #06b6d4;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">🤖 AI-Powered Features</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Use AI to draft emails, generate responses, and organize your inbox efficiently.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0fdf4; border-radius: 12px; border-left: 4px solid #10b981;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">📊 View Your Activity</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Track your email activity, response times, and personal productivity metrics.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Getting Started -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #eff6ff; border-radius: 12px;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">🚀 Quick Start Guide</h3>
                    <ol style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Connect your email account(s)</li>
                      <li>Explore the organization's shared workspace</li>
                      <li>Set up your profile and preferences</li>
                      <li>Say hello to your teammates!</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- Need Help Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 12px; border: 2px solid #f59e0b;">
                    <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">💡 Need Help?</h3>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0;">
                      If you have questions or need assistance, reach out to your organization admins or ${inviterName}. They're here to help you get started!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/organization/${organizationId}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Go to Organization
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                We're excited to have you on board! If you have any questions, feel free to reach out to your team or visit our <a href="https://easemail.app/help" style="color: #10b981; text-decoration: none;">help center</a>.
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
                You're receiving this email because ${userEmail} joined ${organizationName}
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
