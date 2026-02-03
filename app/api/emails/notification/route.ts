import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { getNotificationEmailHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userName, userEmail, subject, message, ctaText, ctaLink } =
      await request.json();

    if (!userName || !userEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'userName, userEmail, subject, and message are required' },
        { status: 400 }
      );
    }

    // Generate email HTML
    const html = getNotificationEmailHtml({
      userName,
      subject,
      message,
      ctaText,
      ctaLink,
    });

    // Send email
    const result = await sendEmail({
      to: userEmail,
      subject,
      html,
    });

    if (!result.success) {
      console.error('Failed to send notification email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send notification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification email sent successfully',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Notification email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
