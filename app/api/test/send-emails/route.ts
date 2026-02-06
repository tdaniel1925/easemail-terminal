import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { getWelcomeEmailHtml } from '@/lib/email-templates/welcome';
import { getPasswordResetEmailHtml } from '@/lib/email-templates/password-reset';
import { getOrganizationInviteEmailHtml } from '@/lib/email-templates/organization-invite';
import { getNotificationEmailHtml } from '@/lib/email-templates/notification';

export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 });
    }

    const results = [];

    // 1. Welcome Email
    console.log('Sending Welcome Email...');
    const welcomeHtml = getWelcomeEmailHtml({
      userName: 'Test User',
      userEmail: email,
    });
    const welcomeResult = await sendEmail({
      to: email,
      subject: '[TEST] Welcome to EaseMail! 🎉',
      html: welcomeHtml,
    });
    results.push({ template: 'Welcome Email', success: welcomeResult.success });

    // Small delay between emails
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Password Reset Email
    console.log('Sending Password Reset Email...');
    const resetHtml = getPasswordResetEmailHtml({
      userName: 'Test User',
      resetLink: 'https://easemail-terminal.vercel.app/reset-password?token=test-token-12345',
    });
    const resetResult = await sendEmail({
      to: email,
      subject: '[TEST] Reset Your EaseMail Password',
      html: resetHtml,
    });
    results.push({ template: 'Password Reset Email', success: resetResult.success });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Organization Invite Email
    console.log('Sending Organization Invite Email...');
    const inviteHtml = getOrganizationInviteEmailHtml({
      inviteeName: 'Test User',
      organizationName: 'Acme Corporation',
      inviterName: 'John Smith',
      role: 'ADMIN',
      inviteLink: 'https://easemail-terminal.vercel.app/invite/test-invite-token-12345',
    });
    const inviteResult = await sendEmail({
      to: email,
      subject: '[TEST] You\'re Invited to Join Acme Corporation',
      html: inviteHtml,
    });
    results.push({ template: 'Organization Invite Email', success: inviteResult.success });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Notification Email
    console.log('Sending Notification Email...');
    const notificationHtml = getNotificationEmailHtml({
      userName: 'Test User',
      subject: 'New Feature Available',
      message: 'We\'ve just released a new AI-powered email feature! Check out the new "Smart Compose" feature in your inbox.',
      ctaLink: 'https://easemail-terminal.vercel.app/app/inbox',
      ctaText: 'Try It Now',
    });
    const notificationResult = await sendEmail({
      to: email,
      subject: '[TEST] New Feature Available - EaseMail',
      html: notificationHtml,
    });
    results.push({ template: 'Notification Email', success: notificationResult.success });

    const allSuccessful = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful
        ? `All 4 test emails sent successfully to ${email}`
        : 'Some emails failed to send',
      results,
      email,
    });

  } catch (error) {
    console.error('Test emails error:', error);
    return NextResponse.json(
      { error: 'Failed to send test emails' },
      { status: 500 }
    );
  }
}
