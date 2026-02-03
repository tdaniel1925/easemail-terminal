import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { getOrganizationInviteEmailHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const {
      inviteeName,
      inviteeEmail,
      organizationName,
      inviterName,
      role,
      inviteLink,
    } = await request.json();

    if (
      !inviteeName ||
      !inviteeEmail ||
      !organizationName ||
      !inviterName ||
      !role ||
      !inviteLink
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Generate email HTML
    const html = getOrganizationInviteEmailHtml({
      inviteeName,
      organizationName,
      inviterName,
      role,
      inviteLink,
    });

    // Send email
    const result = await sendEmail({
      to: inviteeEmail,
      subject: `You're invited to join ${organizationName} on EaseMail`,
      html,
    });

    if (!result.success) {
      console.error('Failed to send organization invite:', result.error);
      return NextResponse.json(
        { error: 'Failed to send organization invite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Organization invite sent successfully',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Organization invite email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
