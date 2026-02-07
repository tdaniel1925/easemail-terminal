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

    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      // Return empty events array instead of error for better UX
      return NextResponse.json({ events: [], message: 'No email account connected' });
    }

    // Check if account has grant_id
    if (!account.grant_id) {
      console.log('No grant_id for account:', account.id);
      return NextResponse.json({ events: [], message: 'Email account not fully configured' });
    }

    // Build query params for Nylas
    const queryParams: any = {
      calendarId: '*', // All calendars
      limit: 100,
    };

    // Add date range if provided
    if (start) {
      queryParams.start = Math.floor(new Date(start).getTime() / 1000);
    }
    if (end) {
      queryParams.end = Math.floor(new Date(end).getTime() / 1000);
    }

    // Fetch events from Nylas
    const events = await getCachedOrFetch(
      `events:${account.grant_id}:${start || 'all'}:${end || 'all'}`,
      async () => {
        try {
          const nylasClient = nylas();
          const response = await nylasClient.events.list({
            identifier: account.grant_id,
            queryParams,
          });
          return response.data;
        } catch (nylasError: any) {
          console.error('Nylas events error:', nylasError.message || nylasError);
          return [];
        }
      },
      60 // Cache for 1 minute
    );

    return NextResponse.json({ events: events || [] });
  } catch (error: any) {
    console.error('Fetch events error:', error?.message || error);
    // Return empty events instead of 500 error for better UX
    return NextResponse.json({ events: [], message: 'Could not fetch calendar events' });
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
      return NextResponse.json({ error: 'No email account connected. Please connect an email account first.' }, { status: 400 });
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
