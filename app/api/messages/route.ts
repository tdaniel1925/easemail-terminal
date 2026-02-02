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

    // Get user's email accounts
    const { data: accounts } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!accounts) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    const grantId = accounts.grant_id;

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const pageToken = searchParams.get('page_token');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch messages from Nylas (disable caching for pagination)
    const nylasClient = nylas();
    const response = await nylasClient.messages.list({
      identifier: grantId,
      queryParams: {
        limit,
        ...(pageToken && { page_token: pageToken }),
      },
    });

    return NextResponse.json({
      messages: response.data,
      nextCursor: response.nextCursor || null,
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
