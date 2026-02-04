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
        recommendations: [],
      });
    }

    try {
      // Fetch recent messages to analyze patterns
      const nylasClient = nylas();
      const messagesResponse = await nylasClient.messages.list({
        identifier: account.grant_id,
        queryParams: {
          limit: 500,
        },
      });

      const messages = messagesResponse.data;

      // Analyze email patterns by hour of day
      const hourCounts: number[] = new Array(24).fill(0);
      const receivedMessages = messages.filter((m: any) =>
        !m.folders?.some((f: string) => f.toLowerCase().includes('sent'))
      );

      receivedMessages.forEach((m: any) => {
        if (m.date) {
          const msgDate = new Date((m.date || 0) * 1000);
          const hour = msgDate.getHours();
          hourCounts[hour]++;
        }
      });

      // Find the 2-3 hour blocks with least email activity (best for focus)
      const blocks: Array<{ startHour: number; endHour: number; count: number; }> = [];

      for (let i = 0; i < 24; i++) {
        // Check 2-hour blocks
        if (i + 2 <= 24) {
          const blockCount = hourCounts[i] + hourCounts[i + 1];
          blocks.push({
            startHour: i,
            endHour: i + 2,
            count: blockCount,
          });
        }
      }

      // Sort by least activity and filter work hours (8 AM - 6 PM)
      const workHoursBlocks = blocks
        .filter((b) => b.startHour >= 8 && b.endHour <= 18)
        .sort((a, b) => a.count - b.count)
        .slice(0, 3);

      // Format recommendations
      const recommendations = workHoursBlocks.map((block) => {
        const formatHour = (hour: number) => {
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          return `${displayHour}:00 ${ampm}`;
        };

        return {
          time: `${formatHour(block.startHour)} - ${formatHour(block.endHour)}`,
          reason: `${block.count} emails typically received`,
          activityLevel: block.count < 5 ? 'Low activity' : block.count < 15 ? 'Moderate activity' : 'Active period',
        };
      });

      return NextResponse.json({
        recommendations: recommendations.length > 0 ? recommendations : [
          {
            time: '9:00 AM - 11:00 AM',
            reason: 'Recommended focus time',
            activityLevel: 'Low activity',
          },
        ],
      });
    } catch (nylasError) {
      console.error('Nylas error:', nylasError);
      // Return default recommendations if Nylas fails
      return NextResponse.json({
        recommendations: [
          {
            time: '9:00 AM - 11:00 AM',
            reason: 'Recommended focus time',
            activityLevel: 'Low activity',
          },
        ],
      });
    }
  } catch (error) {
    console.error('Get focus time error:', error);
    return NextResponse.json(
      { error: 'Failed to get focus time recommendations' },
      { status: 500 }
    );
  }
}
