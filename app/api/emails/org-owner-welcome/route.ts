// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { getOrgOwnerWelcomeEmailHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { userName, userEmail, organizationName, organizationId, plan, seats } = await request.json();

    if (!userName || !userEmail || !organizationName || !organizationId) {
      return NextResponse.json(
        { error: 'userName, userEmail, organizationName, and organizationId are required' },
        { status: 400 }
      );
    }

    // Generate email HTML
    const html = getOrgOwnerWelcomeEmailHtml({
      userName,
      userEmail,
      organizationName,
      organizationId,
      plan: plan || 'PRO',
      seats: seats || 1,
    });

    // Send email
    const result = await sendEmail({
      to: userEmail,
      subject: `Welcome to ${organizationName} on EaseMail!`,
      html,
    });

    if (!result.success) {
      console.error('Failed to send org owner welcome email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send org owner welcome email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Org owner welcome email sent successfully',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Org owner welcome email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
