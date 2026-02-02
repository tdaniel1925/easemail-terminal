import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, cc, bcc, subject, body } = await request.json();

    // Get user's email account
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Send email via Nylas
    const nylasClient = nylas();

    // Prepare recipients
    const toRecipients = Array.isArray(to)
      ? to.map((email: string) => ({ email }))
      : [{ email: to }];

    const ccRecipients = cc && cc.length > 0
      ? (Array.isArray(cc) ? cc.map((email: string) => ({ email })) : [{ email: cc }])
      : undefined;

    const bccRecipients = bcc && bcc.length > 0
      ? (Array.isArray(bcc) ? bcc.map((email: string) => ({ email })) : [{ email: bcc }])
      : undefined;

    const message = await nylasClient.messages.send({
      identifier: account.grant_id,
      requestBody: {
        to: toRecipients,
        ...(ccRecipients && { cc: ccRecipients }),
        ...(bccRecipients && { bcc: bccRecipients }),
        subject,
        body,
      },
    });

    return NextResponse.json({ message: 'Email sent successfully', data: message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
