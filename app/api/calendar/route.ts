import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { getCachedOrFetch } from '@/lib/redis/client';

export async function GET(request: NextRequest) {
  try {
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

    // Fetch events from Nylas
    const events = await getCachedOrFetch(
      `events:${account.grant_id}`,
      async () => {
        const nylasClient = nylas();
        const response = await nylasClient.events.list({
          identifier: account.grant_id,
          queryParams: {
            calendarId: '*', // All calendars
            limit: 100,
          },
        });
        return response.data;
      },
      60 // Cache for 1 minute
    );

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Fetch events error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch events',
        events: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, startTime, endTime, description, location } = await request.json();

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

    // Create event via Nylas
    const nylasClient = nylas();
    const event = await nylasClient.events.create({
      identifier: account.grant_id,
      requestBody: {
        title: title.trim(),
        when: {
          startTime: Math.floor(startDate.getTime() / 1000),
          endTime: Math.floor(endDate.getTime() / 1000),
        },
        description: description || '',
        location: location || '',
      },
      queryParams: {
        calendarId: 'primary',
      },
    });

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'calendar_event',
    } as any);

    return NextResponse.json({ event });
  } catch (error: any) {
    console.error('Create event error:', error);

    // Provide more specific error messages
    if (error?.message?.includes('calendar')) {
      return NextResponse.json(
        { error: 'Failed to create event. Please check your calendar permissions.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}
