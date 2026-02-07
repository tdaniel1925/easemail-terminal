// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { getSuperAdminWelcomeEmailHtml } from '@/lib/email-templates';

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
    const html = getSuperAdminWelcomeEmailHtml({ userName, userEmail });

    // Send email
    const result = await sendEmail({
      to: userEmail,
      subject: "You're Now an EaseMail Super Administrator",
      html,
    });

    if (!result.success) {
      console.error('Failed to send super admin welcome email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send super admin welcome email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Super admin welcome email sent successfully',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Super admin welcome email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
