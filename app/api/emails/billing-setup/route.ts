// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { getBillingSetupEmailHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { userName, userEmail, organizationName, organizationId, plan, seats, pricePerSeat, billingCycle } = await request.json();

    if (!userName || !userEmail || !organizationName || !organizationId || !plan || !seats) {
      return NextResponse.json(
        { error: 'userName, userEmail, organizationName, organizationId, plan, and seats are required' },
        { status: 400 }
      );
    }

    // Default pricing if not provided
    const finalPricePerSeat = pricePerSeat || (plan === 'ENTERPRISE' ? 20 : plan === 'PRO' ? 25 : 0);
    const finalBillingCycle = billingCycle || 'monthly';

    // Generate email HTML
    const html = getBillingSetupEmailHtml({
      userName,
      userEmail,
      organizationName,
      organizationId,
      plan,
      seats,
      pricePerSeat: finalPricePerSeat,
      billingCycle: finalBillingCycle,
    });

    // Send email
    const result = await sendEmail({
      to: userEmail,
      subject: `Complete Your Billing Setup - ${organizationName}`,
      html,
    });

    if (!result.success) {
      console.error('Failed to send billing setup email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send billing setup email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Billing setup email sent successfully',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Billing setup email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
