import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/calendar/[id]/rsvp
 * Respond to event invitation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    if (!['yes', 'no', 'maybe'].includes(status)) {
      return NextResponse.json({ error: 'Invalid RSVP status' }, { status: 400 });
    }

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Send RSVP via Nylas
    const nylasClient = nylas();
    await nylasClient.events.sendRsvp({
      identifier: account.grant_id,
      eventId: id,
      requestBody: {
        status,
      },
      queryParams: {
        calendarId: 'primary',
      },
    });

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'calendar_rsvp',
    } as any);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('RSVP error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send RSVP' },
      { status: 500 }
    );
  }
}
