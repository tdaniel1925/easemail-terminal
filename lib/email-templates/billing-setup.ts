export function getBillingSetupEmailHtml({
  userName,
  userEmail,
  organizationName,
  organizationId,
  plan,
  seats,
  pricePerSeat,
  billingCycle,
}: {
  userName: string;
  userEmail: string;
  organizationName: string;
  organizationId: string;
  plan: string;
  seats: number;
  pricePerSeat: number;
  billingCycle: string;
}) {
  const monthlyTotal = seats * pricePerSeat;
  const annualTotal = monthlyTotal * 10; // Annual discount: pay for 10 months, get 12

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Billing Setup - ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with Gradient (Purple for billing) -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 16px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3h18v18H3V3zm3 3v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z" fill="white"/>
                </svg>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 12px 0;">Complete Your Billing Setup</h1>
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
                Your organization <strong>${organizationName}</strong> has been created successfully! To activate your <strong>${plan}</strong> plan, please complete your billing setup.
              </p>

              <!-- Plan Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; border: 2px solid #3b82f6;">
                    <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Your Plan Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plan:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${plan}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Seats:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${seats} users</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Price per seat:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">$${pricePerSeat}/month</td>
                      </tr>
                      <tr style="border-top: 2px solid #3b82f6;">
                        <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">Monthly Total:</td>
                        <td style="padding: 12px 0 0 0; color: #3b82f6; font-size: 20px; font-weight: bold; text-align: right;">$${monthlyTotal}/mo</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #111827; font-size: 16px; font-weight: 600;">Annual Total:</td>
                        <td style="padding: 4px 0; color: #10b981; font-size: 20px; font-weight: bold; text-align: right;">$${annualTotal}/year</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 4px 0; color: #10b981; font-size: 12px; text-align: right;">💰 Save 2 months with annual billing!</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Payment Methods -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #6366f1;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">💳 We Accept</h3>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                      Credit Card (Visa, Mastercard, Amex) • PayPal • Bank Transfer
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/app/settings/billing" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Complete Billing Setup
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Features Included -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0fdf4; border-radius: 12px;">
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">✨ What's Included in ${plan}</h3>
                    <ul style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>AI-powered email management for ${seats} users</li>
                      <li>Unified inbox across all email accounts</li>
                      <li>Smart categorization and prioritization</li>
                      <li>Advanced analytics and reporting</li>
                      <li>Team collaboration features</li>
                      <li>Priority support</li>
                      <li>Custom integrations and API access</li>
                      <li>Dedicated account manager</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Need Help Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 12px; border: 2px solid #f59e0b;">
                    <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">💡 Need Help?</h3>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0;">
                      Have questions about billing or need a custom quote? Contact our sales team at <a href="mailto:sales@easemail.app" style="color: #f59e0b; text-decoration: none; font-weight: 600;">sales@easemail.app</a> or call us at 1-800-EASEMAIL.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #111827;">The EaseMail Billing Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2025 EaseMail. All rights reserved.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                You're receiving this email as the billing contact for ${organizationName}
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
