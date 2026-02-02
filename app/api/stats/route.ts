import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get primary email account
    const { data: account } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single();

    if (!account) {
      return NextResponse.json({
        stats: {
          unread: 0,
          today: 0,
          starred: 0,
          sent: 0,
          avgResponseTime: 'N/A',
          topSender: 'No data',
        },
      });
    }

    try {
      // Fetch messages from Nylas to calculate stats
      const messagesResponse = await nylas.messages.list({
        identifier: account.grant_id,
        queryParams: {
          limit: 100,
        },
      });

      const messages = messagesResponse.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate stats
      const unread = messages.filter((m: any) => m.unread).length;
      const todayMessages = messages.filter((m: any) => {
        const msgDate = new Date((m.date || 0) * 1000);
        return msgDate >= today;
      }).length;
      const starred = messages.filter((m: any) => m.starred).length;

      // Get sent count from usage tracking
      const { count: sentCount } = await supabase
        .from('usage_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('feature', 'email_sent');

      // Calculate top sender
      const senderCounts: { [key: string]: number } = {};
      messages.forEach((m: any) => {
        const sender = m.from?.[0]?.email || 'unknown';
        senderCounts[sender] = (senderCounts[sender] || 0) + 1;
      });

      const topSender = Object.entries(senderCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'No data';

      return NextResponse.json({
        stats: {
          unread,
          today: todayMessages,
          starred,
          sent: sentCount || 0,
          avgResponseTime: '2h', // TODO: Calculate actual response time
          topSender,
        },
      });
    } catch (nylasError) {
      console.error('Nylas error:', nylasError);
      // Return default stats if Nylas fails
      return NextResponse.json({
        stats: {
          unread: 0,
          today: 0,
          starred: 0,
          sent: 0,
          avgResponseTime: 'N/A',
          topSender: 'No data',
        },
      });
    }
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
