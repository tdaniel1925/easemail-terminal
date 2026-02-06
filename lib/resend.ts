// @ts-nocheck
import { Resend } from 'resend';

// Initialize Resend with API key
export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email (using verified botmakers.ai domain)
export const DEFAULT_FROM_EMAIL = 'EaseMail <noreply@botmakers.ai>';

// Email sending helper with error handling
export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_FROM_EMAIL,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', { to, subject, id: data.id });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
