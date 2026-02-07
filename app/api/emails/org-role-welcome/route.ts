// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { getOrgAdminWelcomeEmailHtml, getOrgMemberWelcomeEmailHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { userName, userEmail, organizationName, organizationId, inviterName, role } = await request.json();

    if (!userName || !userEmail || !organizationName || !organizationId || !inviterName || !role) {
      return NextResponse.json(
        { error: 'userName, userEmail, organizationName, organizationId, inviterName, and role are required' },
        { status: 400 }
      );
    }

    // Determine which email to send based on role
    let html: string;
    let subject: string;

    if (role === 'ADMIN') {
      html = getOrgAdminWelcomeEmailHtml({
        userName,
        userEmail,
        organizationName,
        organizationId,
        inviterName,
      });
      subject = `You're Now an Admin of ${organizationName}`;
    } else if (role === 'MEMBER') {
      html = getOrgMemberWelcomeEmailHtml({
        userName,
        userEmail,
        organizationName,
        organizationId,
        inviterName,
      });
      subject = `Welcome to ${organizationName} on EaseMail!`;
    } else {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN or MEMBER' },
        { status: 400 }
      );
    }

    // Send email
    const result = await sendEmail({
      to: userEmail,
      subject,
      html,
    });

    if (!result.success) {
      console.error('Failed to send org role welcome email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send org role welcome email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Org ${role.toLowerCase()} welcome email sent successfully`,
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Org role welcome email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
