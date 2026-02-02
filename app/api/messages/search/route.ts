import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const subject = searchParams.get('subject');
    const hasAttachment = searchParams.get('has_attachment');
    const isUnread = searchParams.get('unread');
    const isStarred = searchParams.get('starred');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query && !from && !to && !subject) {
      return NextResponse.json({ error: 'At least one search parameter required' }, { status: 400 });
    }

    const nylasClient = nylas();

    // Build search query
    const searchQuery: any = {};

    // Text search across subject and body
    if (query) {
      searchQuery.search_query_native = query;
    }

    // Specific field searches
    if (from) {
      searchQuery.from = from;
    }

    if (to) {
      searchQuery.to = to;
    }

    if (subject) {
      searchQuery.subject = subject;
    }

    // Boolean filters
    if (hasAttachment === 'true') {
      searchQuery.has_attachment = true;
    }

    if (isUnread === 'true') {
      searchQuery.unread = true;
    } else if (isUnread === 'false') {
      searchQuery.unread = false;
    }

    if (isStarred === 'true') {
      searchQuery.starred = true;
    }

    // Fetch messages with search
    const messages = await nylasClient.messages.list({
      identifier: account.grant_id,
      queryParams: {
        ...searchQuery,
        limit,
      },
    });

    return NextResponse.json({
      messages: messages.data,
      count: messages.data.length,
      query: searchQuery,
    });
  } catch (error) {
    console.error('Search messages error:', error);
    return NextResponse.json(
      { error: 'Failed to search messages' },
      { status: 500 }
    );
  }
}
