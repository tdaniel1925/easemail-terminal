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
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

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
      const nylasClient = nylas();

      // Fetch more messages for accurate stats (increased from 100 to 500)
      const messagesResponse = await nylasClient.messages.list({
        identifier: account.grant_id,
        queryParams: {
          limit: 500,
        },
      });

      const messages = messagesResponse.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate stats from actual message data
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

      // Calculate average response time from recent emails
      // Look at sent messages and find average time between received and replied
      const sentMessages = messages.filter((m: any) =>
        m.folders?.some((f: string) => f.toLowerCase().includes('sent'))
      );

      let totalResponseTimeMs = 0;
      let responseCount = 0;

      sentMessages.forEach((sent: any) => {
        // Find corresponding received message by checking thread or subject
        const received = messages.find((m: any) =>
          m.thread_id === sent.thread_id &&
          m.date < sent.date &&
          !m.folders?.some((f: string) => f.toLowerCase().includes('sent'))
        );

        if (received) {
          const responseTime = (sent.date - received.date) * 1000; // Convert to ms
          if (responseTime > 0 && responseTime < 7 * 24 * 60 * 60 * 1000) { // Filter out outliers (> 7 days)
            totalResponseTimeMs += responseTime;
            responseCount++;
          }
        }
      });

      let avgResponseTime = 'N/A';
      if (responseCount > 0) {
        const avgMs = totalResponseTimeMs / responseCount;
        const hours = Math.floor(avgMs / (1000 * 60 * 60));
        const minutes = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
          avgResponseTime = `${Math.floor(hours / 24)}d ${hours % 24}h`;
        } else if (hours > 0) {
          avgResponseTime = `${hours}h ${minutes}m`;
        } else {
          avgResponseTime = `${minutes}m`;
        }
      }

      return NextResponse.json({
        stats: {
          unread,
          today: todayMessages,
          starred,
          sent: sentCount || 0,
          avgResponseTime,
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
