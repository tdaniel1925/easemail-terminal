import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  return await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: 'Welcome to EaseMail!',
    html: `
      <h1>Welcome to EaseMail, ${name}!</h1>
      <p>Thank you for signing up. We're excited to have you on board.</p>
      <p>Get started by connecting your email accounts.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding">Get Started</a>
    `,
  });
}

export async function sendOrganizationInviteEmail({
  to,
  inviteeName,
  organizationName,
  inviterName,
  role,
  inviteLink,
}: {
  to: string;
  inviteeName: string;
  organizationName: string;
  inviterName: string;
  role: string;
  inviteLink: string;
}) {
  const { getOrganizationInviteEmailHtml } = await import('@/lib/email-templates');

  return await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `You're Invited to Join ${organizationName}`,
    html: getOrganizationInviteEmailHtml({
      inviteeName,
      organizationName,
      inviterName,
      role,
      inviteLink,
    }),
  });
}

export async function send2FACode(to: string, code: string) {
  return await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: 'Your EaseMail 2FA Code',
    html: `
      <h1>Your 2FA Code</h1>
      <p>Your verification code is: <strong style="font-size: 24px; letter-spacing: 2px;">${code}</strong></p>
      <p>This code will expire in 5 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `,
  });
}
