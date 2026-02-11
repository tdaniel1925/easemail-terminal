import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/calendar/[id]
 * Get single event details
 */
export async function GET(
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

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Fetch event from Nylas
    const nylasClient = nylas();
    const event = await nylasClient.events.find({
      identifier: account.grant_id,
      eventId: id,
      queryParams: {
        calendarId: 'primary',
      },
    });

    return NextResponse.json({ event: event.data });
  } catch (error: any) {
    console.error('Fetch event error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/calendar/[id]
 * Update existing event
 */
export async function PUT(
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

    const { title, startTime, endTime, description, location, attendees, recurrence } = await request.json();

    // Validation
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!startTime || !endTime) {
      return NextResponse.json({ error: 'Start time and end time are required' }, { status: 400 });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
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

    // Build request body
    const requestBody: any = {
      title: title.trim(),
      when: {
        startTime: Math.floor(startDate.getTime() / 1000),
        endTime: Math.floor(endDate.getTime() / 1000),
      },
      description: description || '',
      location: location || '',
    };

    // Add participants if provided
    if (attendees && attendees.length > 0) {
      requestBody.participants = attendees.map((email: string) => ({
        email: email.trim(),
        status: 'noreply',
      }));
    }

    // Add recurrence if provided
    if (recurrence) {
      requestBody.recurrence = recurrence;
    }

    // Update event via Nylas
    const nylasClient = nylas();
    const event = await nylasClient.events.update({
      identifier: account.grant_id,
      eventId: id,
      requestBody,
      queryParams: {
        calendarId: 'primary',
      },
    });

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'calendar_event_update',
    } as any);

    return NextResponse.json({ event: event.data });
  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/[id]
 * Delete event
 */
export async function DELETE(
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

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Delete event via Nylas
    const nylasClient = nylas();
    await nylasClient.events.destroy({
      identifier: account.grant_id,
      eventId: id,
      queryParams: {
        calendarId: 'primary',
      },
    });

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'calendar_event_delete',
    } as any);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}

