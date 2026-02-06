import { Resend } from 'resend';

const resend = new Resend('re_7G9uj8Ze_HdHTK4KZPsenzuHcyk1dJ1aA');

// The correct email for test mode
const testEmail = 'trenttdaniel@gmail.com';

function getWelcomeEmailHtml({ userName, userEmail }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EaseMail</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to EaseMail!</h1>
  </div>
  <div class="content">
    <p>Hi ${userName},</p>
    <p>We're excited to have you on board! Your account has been successfully created with the email: <strong>${userEmail}</strong></p>
    <p>EaseMail helps you manage your emails more efficiently with AI-powered features, smart organization, and seamless integration with your existing email accounts.</p>
    <p>Get started by connecting your first email account:</p>
    <center>
      <a href="https://easemail-terminal.vercel.app/app/settings/email-accounts" class="button">Connect Email Account</a>
    </center>
    <p>If you have any questions, our support team is here to help!</p>
  </div>
  <div class="footer">
    <p>EaseMail - Making email management easy</p>
    <p>This is a test email</p>
  </div>
</body>
</html>
  `;
}

function getPasswordResetEmailHtml({ userName, resetLink }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Password Reset Request</h1>
  </div>
  <div class="content">
    <p>Hi ${userName},</p>
    <p>We received a request to reset your password for your EaseMail account.</p>
    <p>Click the button below to reset your password:</p>
    <center>
      <a href="${resetLink}" class="button">Reset Password</a>
    </center>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
  </div>
  <div class="footer">
    <p>EaseMail - Making email management easy</p>
    <p>This is a test email</p>
  </div>
</body>
</html>
  `;
}

function getOrganizationInviteEmailHtml({ inviteeName, organizationName, inviterName, role, inviteLink }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Organization Invitation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .badge { background: #e9ecef; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; color: #495057; }
  </style>
</head>
<body>
  <div class="header">
    <h1>You're Invited!</h1>
  </div>
  <div class="content">
    <p>Hi ${inviteeName},</p>
    <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on EaseMail.</p>
    <p>You've been invited as a <span class="badge">${role}</span></p>
    <p>Click the button below to accept the invitation:</p>
    <center>
      <a href="${inviteLink}" class="button">Accept Invitation</a>
    </center>
    <p>This invitation will expire in 7 days.</p>
  </div>
  <div class="footer">
    <p>EaseMail - Making email management easy</p>
    <p>This is a test email</p>
  </div>
</body>
</html>
  `;
}

function getNotificationEmailHtml({ userName, title, message, actionUrl, actionText }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
  </div>
  <div class="content">
    <p>Hi ${userName},</p>
    <p>${message}</p>
    <center>
      <a href="${actionUrl}" class="button">${actionText}</a>
    </center>
  </div>
  <div class="footer">
    <p>EaseMail - Making email management easy</p>
    <p>This is a test email</p>
  </div>
</body>
</html>
  `;
}

async function sendTestEmails() {
  console.log(`🚀 Sending test emails to ${testEmail}...\n`);
  console.log(`ℹ️  Note: Resend test mode only allows sending to ${testEmail}\n`);

  try {
    // 1. Welcome Email
    console.log('📧 1/4 Sending Welcome Email...');
    const welcomeHtml = getWelcomeEmailHtml({
      userName: 'Test User',
      userEmail: testEmail,
    });
    const welcomeResult = await resend.emails.send({
      from: 'EaseMail <onboarding@resend.dev>',
      to: testEmail,
      subject: '[TEST] Welcome to EaseMail! 🎉',
      html: welcomeHtml,
    });

    if (welcomeResult.error) {
      console.error('❌ Failed:', welcomeResult.error.message);
    } else {
      console.log('✅ Welcome email sent successfully');
      console.log('   Email ID:', welcomeResult.data?.id);
    }
    console.log();

    // Delay to avoid rate limiting (2 requests/second max)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Password Reset Email
    console.log('📧 2/4 Sending Password Reset Email...');
    const resetHtml = getPasswordResetEmailHtml({
      userName: 'Test User',
      resetLink: 'https://easemail-terminal.vercel.app/reset-password?token=test-token-12345',
    });
    const resetResult = await resend.emails.send({
      from: 'EaseMail <onboarding@resend.dev>',
      to: testEmail,
      subject: '[TEST] Reset Your EaseMail Password',
      html: resetHtml,
    });

    if (resetResult.error) {
      console.error('❌ Failed:', resetResult.error.message);
    } else {
      console.log('✅ Password reset email sent successfully');
      console.log('   Email ID:', resetResult.data?.id);
    }
    console.log();

    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Organization Invite Email
    console.log('📧 3/4 Sending Organization Invite Email...');
    const inviteHtml = getOrganizationInviteEmailHtml({
      inviteeName: 'Test User',
      organizationName: 'Acme Corporation',
      inviterName: 'John Smith',
      role: 'ADMIN',
      inviteLink: 'https://easemail-terminal.vercel.app/invite/test-invite-token-12345',
    });
    const inviteResult = await resend.emails.send({
      from: 'EaseMail <onboarding@resend.dev>',
      to: testEmail,
      subject: '[TEST] You\'re Invited to Join Acme Corporation',
      html: inviteHtml,
    });

    if (inviteResult.error) {
      console.error('❌ Failed:', inviteResult.error.message);
    } else {
      console.log('✅ Organization invite email sent successfully');
      console.log('   Email ID:', inviteResult.data?.id);
    }
    console.log();

    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Notification Email
    console.log('📧 4/4 Sending Notification Email...');
    const notificationHtml = getNotificationEmailHtml({
      userName: 'Test User',
      title: 'New Feature Available',
      message: 'We\'ve just released a new AI-powered email feature! Check out the new "Smart Compose" feature in your inbox.',
      actionUrl: 'https://easemail-terminal.vercel.app/app/inbox',
      actionText: 'Try It Now',
    });
    const notificationResult = await resend.emails.send({
      from: 'EaseMail <onboarding@resend.dev>',
      to: testEmail,
      subject: '[TEST] New Feature Available - EaseMail',
      html: notificationHtml,
    });

    if (notificationResult.error) {
      console.error('❌ Failed:', notificationResult.error.message);
    } else {
      console.log('✅ Notification email sent successfully');
      console.log('   Email ID:', notificationResult.data?.id);
    }
    console.log();

    console.log('🎉 All test emails sent successfully!');
    console.log(`📬 Check your inbox at ${testEmail}`);
    console.log('\n📋 Emails sent:');
    console.log('   1. Welcome Email');
    console.log('   2. Password Reset Email');
    console.log('   3. Organization Invite Email');
    console.log('   4. Notification Email');

    console.log('\n💡 To send to other email addresses:');
    console.log('   1. Go to https://resend.com/domains');
    console.log('   2. Verify your domain (e.g., botmakers.ai)');
    console.log('   3. Update from address to use verified domain');

  } catch (error) {
    console.error('❌ Error sending test emails:', error);
    process.exit(1);
  }
}

sendTestEmails();
