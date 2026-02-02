import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: threadId } = await params;

    if (!threadId) {
      return NextResponse.json({ error: 'Thread ID required' }, { status: 400 });
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

    // Fetch the thread details
    const thread = await nylasClient.threads.find({
      identifier: account.grant_id,
      threadId: threadId,
    });

    // Fetch all messages in the thread
    const messages = await nylasClient.messages.list({
      identifier: account.grant_id,
      queryParams: {
        threadId: threadId,
        limit: 100,
      },
    });

    return NextResponse.json({
      thread: thread.data,
      messages: messages.data,
    });
  } catch (error) {
    console.error('Fetch thread error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}
