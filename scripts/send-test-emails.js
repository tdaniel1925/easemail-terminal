const { sendEmail } = require('../lib/resend');
const { getWelcomeEmailHtml } = require('../lib/email-templates/welcome');
const { getPasswordResetEmailHtml } = require('../lib/email-templates/password-reset');
const { getOrganizationInviteEmailHtml } = require('../lib/email-templates/organization-invite');
const { getNotificationEmailHtml } = require('../lib/email-templates/notification');

async function sendTestEmails() {
  const testEmail = 'tdaniel@botmakers.ai';

  console.log(`🚀 Sending test emails to ${testEmail}...\n`);

  try {
    // 1. Welcome Email
    console.log('📧 1/4 Sending Welcome Email...');
    const welcomeHtml = getWelcomeEmailHtml({
      userName: 'Test User',
      userEmail: testEmail,
    });
    await sendEmail({
      to: testEmail,
      subject: '[TEST] Welcome to EaseMail! 🎉',
      html: welcomeHtml,
    });
    console.log('✅ Welcome email sent successfully\n');

    // 2. Password Reset Email
    console.log('📧 2/4 Sending Password Reset Email...');
    const resetHtml = getPasswordResetEmailHtml({
      userName: 'Test User',
      resetLink: 'https://easemail-terminal.vercel.app/reset-password?token=test-token-12345',
    });
    await sendEmail({
      to: testEmail,
      subject: '[TEST] Reset Your EaseMail Password',
      html: resetHtml,
    });
    console.log('✅ Password reset email sent successfully\n');

    // 3. Organization Invite Email
    console.log('📧 3/4 Sending Organization Invite Email...');
    const inviteHtml = getOrganizationInviteEmailHtml({
      inviteeName: 'Test User',
      organizationName: 'Acme Corporation',
      inviterName: 'John Smith',
      role: 'ADMIN',
      inviteLink: 'https://easemail-terminal.vercel.app/invite/test-invite-token-12345',
    });
    await sendEmail({
      to: testEmail,
      subject: '[TEST] You\'re Invited to Join Acme Corporation',
      html: inviteHtml,
    });
    console.log('✅ Organization invite email sent successfully\n');

    // 4. Notification Email
    console.log('📧 4/4 Sending Notification Email...');
    const notificationHtml = getNotificationEmailHtml({
      userName: 'Test User',
      title: 'New Feature Available',
      message: 'We\'ve just released a new AI-powered email feature! Check out the new "Smart Compose" feature in your inbox.',
      actionUrl: 'https://easemail-terminal.vercel.app/app/inbox',
      actionText: 'Try It Now',
    });
    await sendEmail({
      to: testEmail,
      subject: '[TEST] New Feature Available - EaseMail',
      html: notificationHtml,
    });
    console.log('✅ Notification email sent successfully\n');

    console.log('🎉 All test emails sent successfully!');
    console.log(`📬 Check your inbox at ${testEmail}`);
    console.log('\n📋 Emails sent:');
    console.log('   1. Welcome Email');
    console.log('   2. Password Reset Email');
    console.log('   3. Organization Invite Email');
    console.log('   4. Notification Email');

  } catch (error) {
    console.error('❌ Error sending test emails:', error);
    process.exit(1);
  }
}

sendTestEmails();
