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

    const { messageId, to, cc, bcc, subject, body, replyAll } = await request.json();

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

    const nylasClient = nylas();

    // Send reply via Nylas
    const message = await nylasClient.messages.send({
      identifier: account.grant_id,
      requestBody: {
        to: Array.isArray(to) ? to.map((email: string) => ({ email })) : [{ email: to }],
        ...(cc && cc.length > 0 && { cc: cc.map((email: string) => ({ email })) }),
        ...(bcc && bcc.length > 0 && { bcc: bcc.map((email: string) => ({ email })) }),
        subject,
        body,
        reply_to_message_id: messageId, // This maintains the thread
      },
    });

    return NextResponse.json({ message: 'Reply sent successfully', data: message });
  } catch (error) {
    console.error('Reply message error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch original message for reply context
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

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

    const nylasClient = nylas();

    // Fetch the original message
    const message = await nylasClient.messages.find({
      identifier: account.grant_id,
      messageId: messageId,
    });

    return NextResponse.json({ message: message.data });
  } catch (error) {
    console.error('Fetch message error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    );
  }
}
