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

    // Fetch messages from Nylas (with caching)
    const messages = await getCachedOrFetch(
      `messages:${grantId}`,
      async () => {
        const response = await nylas.messages.list({
          identifier: grantId,
          queryParams: {
            limit: 50,
          },
        });
        return response.data;
      },
      300 // Cache for 5 minutes
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
