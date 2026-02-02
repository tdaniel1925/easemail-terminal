import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get recent webhook events for the current user
 * This can be polled by the frontend to detect new emails/events in real-time
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since'); // ISO timestamp
    const eventType = searchParams.get('type'); // Filter by event type
    const processed = searchParams.get('processed') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('webhook_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (since) {
      query = query.gt('created_at', since);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (processed !== null) {
      query = query.eq('processed', processed);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching webhook events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Get webhook events error:', error);
    return NextResponse.json(
      { error: 'Failed to get webhook events' },
      { status: 500 }
    );
  }
}

/**
 * Mark webhook events as processed
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventIds } = await request.json();

    if (!eventIds || !Array.isArray(eventIds)) {
      return NextResponse.json(
        { error: 'eventIds array is required' },
        { status: 400 }
      );
    }

    const { error } = await (supabase as any)
      .from('webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .in('id', eventIds)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error marking events as processed:', error);
      return NextResponse.json(
        { error: 'Failed to mark events as processed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, count: eventIds.length });
  } catch (error) {
    console.error('Mark events processed error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
