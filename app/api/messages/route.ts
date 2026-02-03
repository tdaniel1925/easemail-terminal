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

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const pageToken = searchParams.get('page_token');
    const limit = parseInt(searchParams.get('limit') || '50');
    const accountId = searchParams.get('accountId');
    const folderId = searchParams.get('folder');

    // Get user's email account(s)
    let account: any;
    if (accountId) {
      // Fetch specific account
      const { data: specificAccount } = (await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', accountId)
        .single()) as { data: any };

      account = specificAccount;
    } else {
      // Fetch primary account
      const { data: primaryAccount } = (await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()) as { data: any };

      account = primaryAccount;
    }

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    const grantId = account.grant_id;

    // Build query params
    const queryParams: any = {
      limit,
    };

    if (pageToken) {
      queryParams.page_token = pageToken;
    }

    if (folderId) {
      console.log('Filtering messages by folder ID:', folderId);
      queryParams.in = [folderId];
    }

    // Fetch messages from Nylas
    const nylasClient = nylas();
    const response = await nylasClient.messages.list({
      identifier: grantId,
      queryParams,
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
