import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUpcomingMeetings, createTeamsMeeting, refreshAccessToken } from '@/lib/msgraph';

/**
 * Helper function to get valid access token
 */
async function getValidAccessToken(userId: string) {
  const supabase = await createClient();

  const { data: tokenData, error } = await (supabase
    .from('ms_graph_tokens') as any)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData) {
    throw new Error('MS Graph not connected');
  }

  // Check if token is expired
  const tokenRecord = tokenData as any;
  const expiresAt = new Date(tokenRecord.expires_at);
  const now = new Date();

  if (expiresAt <= now) {
    // Token expired, refresh it
    const newTokens = await refreshAccessToken(tokenRecord.refresh_token);

    // Update in database
    await (supabase
      .from('ms_graph_tokens') as any)
      .update({
        access_token: newTokens.accessToken,
        refresh_token: newTokens.refreshToken!,
        expires_at: newTokens.expiresOn!.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return newTokens.accessToken;
  }

  return tokenRecord.access_token;
}

/**
 * GET /api/teams/meetings
 * Fetch upcoming Teams meetings
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accessToken = await getValidAccessToken(user.id);

    const searchParams = request.nextUrl.searchParams;
    const daysAhead = parseInt(searchParams.get('days') || '7');

    const meetings = await getUpcomingMeetings(accessToken, daysAhead);

    return NextResponse.json({ meetings });
  } catch (error: any) {
    console.error('Fetch meetings error:', error);

    if (error.message === 'MS Graph not connected') {
      return NextResponse.json(
        { error: 'MS Graph not connected', needsAuth: true },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teams/meetings
 * Create a new Teams meeting
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subject, startDateTime, endDateTime, timezone, attendees, content } = body;

    if (!subject || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, startDateTime, endDateTime' },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(user.id);

    const meeting = await createTeamsMeeting(accessToken, {
      subject,
      startDateTime,
      endDateTime,
      timezone, // Pass user's timezone to Teams API
      attendees,
      content,
    });

    console.log(`✅ Teams meeting created with timezone: ${timezone || 'UTC (default)'}`);

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error: any) {
    console.error('Create meeting error:', error);

    if (error.message === 'MS Graph not connected') {
      return NextResponse.json(
        { error: 'MS Graph not connected', needsAuth: true },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
