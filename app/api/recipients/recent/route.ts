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

    // Get all user's email accounts
    const { data: accounts } = await supabase
      .from('email_accounts')
      .select('grant_id')
      .eq('user_id', user.id);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ recipients: [] });
    }

    const nylasClient = nylas();
    const recipientMap = new Map<string, { email: string; name?: string; count: number }>();

    // Fetch messages from all accounts
    for (const account of accounts) {
      try {
        const messagesResponse = await nylasClient.messages.list({
          identifier: account.grant_id,
          queryParams: {
            limit: 200, // Get recent messages to build recipient list
          },
        });

        const messages = messagesResponse.data;

        // Extract recipients from To, From, and CC fields
        messages.forEach((message: any) => {
          // Add 'To' recipients (people user has sent to)
          message.to?.forEach((recipient: any) => {
            if (recipient.email) {
              const existing = recipientMap.get(recipient.email.toLowerCase());
              if (existing) {
                existing.count++;
              } else {
                recipientMap.set(recipient.email.toLowerCase(), {
                  email: recipient.email,
                  name: recipient.name,
                  count: 1,
                });
              }
            }
          });

          // Add 'From' recipients (people who have sent to user)
          message.from?.forEach((recipient: any) => {
            if (recipient.email) {
              const existing = recipientMap.get(recipient.email.toLowerCase());
              if (existing) {
                existing.count++;
                // Prefer name from 'from' field if available
                if (recipient.name && !existing.name) {
                  existing.name = recipient.name;
                }
              } else {
                recipientMap.set(recipient.email.toLowerCase(), {
                  email: recipient.email,
                  name: recipient.name,
                  count: 1,
                });
              }
            }
          });

          // Add CC recipients
          message.cc?.forEach((recipient: any) => {
            if (recipient.email) {
              const existing = recipientMap.get(recipient.email.toLowerCase());
              if (existing) {
                existing.count++;
              } else {
                recipientMap.set(recipient.email.toLowerCase(), {
                  email: recipient.email,
                  name: recipient.name,
                  count: 1,
                });
              }
            }
          });
        });
      } catch (accountError) {
        console.error(`Error fetching messages for account ${account.grant_id}:`, accountError);
        // Continue with other accounts
      }
    }

    // Convert map to array and sort by frequency (most used first)
    const recipients = Array.from(recipientMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 100); // Limit to top 100 recipients

    return NextResponse.json({ recipients });
  } catch (error) {
    console.error('Get recent recipients error:', error);
    return NextResponse.json(
      { error: 'Failed to get recent recipients' },
      { status: 500 }
    );
  }
}
