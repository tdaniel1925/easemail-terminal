// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { getWelcomeEmailHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { userName, userEmail } = await request.json();

    if (!userName || !userEmail) {
      return NextResponse.json(
        { error: 'userName and userEmail are required' },
        { status: 400 }
      );
    }

    // Generate email HTML
    const html = getWelcomeEmailHtml({ userName, userEmail });

    // Send email
    const result = await sendEmail({
      to: userEmail,
      subject: 'Welcome to EaseMail! 🎉',
      html,
    });

    if (!result.success) {
      console.error('Failed to send welcome email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
