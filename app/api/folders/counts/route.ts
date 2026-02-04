import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';
import cache, { generateCacheKey } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache first (60 second TTL)
    const cacheKey = generateCacheKey('folder-counts', user.id);
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Get all email accounts for the user
    const { data: accounts } = (await supabase
      .from('email_accounts')
      .select('id, grant_id')
      .eq('user_id', user.id)) as { data: any[] };

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        inbox: 0,
        starred: 0,
        sent: 0,
        snoozed: 0,
        archive: 0,
        trash: 0,
        drafts: 0,
      });
    }

    const nylasClient = nylas();
    const accountIds = accounts.map(a => a.id);

    // Initialize counts
    let inboxCount = 0;
    let starredCount = 0;
    let sentCount = 0;
    let snoozedCount = 0;
    let archiveCount = 0;
    let trashCount = 0;

    // Fetch messages from each account and aggregate counts
    for (const account of accounts) {
      try {
        const messagesResponse = await nylasClient.messages.list({
          identifier: account.grant_id,
          queryParams: {
            limit: 100,
          },
        });

        const messages = messagesResponse.data;

        // Count by folder type
        messages.forEach((msg: any) => {
          const folders = (msg.folders || []).map((f: string) => f.toLowerCase());

          // Inbox unread
          if (folders.includes('inbox') && msg.unread) {
            inboxCount++;
          }

          // Starred
          if (msg.starred) {
            starredCount++;
          }

          // Sent
          if (folders.includes('sent')) {
            sentCount++;
          }

          // Archive unread
          if (folders.includes('archive') && msg.unread) {
            archiveCount++;
          }

          // Trash
          if (folders.includes('trash')) {
            trashCount++;
          }
        });
      } catch (error) {
        console.error(`Error fetching messages for account ${account.id}:`, error);
      }
    }

    // Get snoozed count from database
    const { count: snoozedDbCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('account_id', accountIds)
      .not('snoozed_until', 'is', null)
      .gt('snoozed_until', new Date().toISOString());

    snoozedCount = snoozedDbCount || 0;

    // Get drafts count
    const { count: draftsDbCount } = await supabase
      .from('drafts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const draftsCount = draftsDbCount || 0;

    const result = {
      inbox: inboxCount,
      starred: starredCount,
      sent: sentCount,
      snoozed: snoozedCount,
      archive: archiveCount,
      trash: trashCount,
      drafts: draftsCount,
    };

    // Cache for 60 seconds
    cache.set(cacheKey, result, 60);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Folder counts API error:', error);
    return NextResponse.json(
      {
        inbox: 0,
        starred: 0,
        sent: 0,
        snoozed: 0,
        archive: 0,
        trash: 0,
        drafts: 0,
      },
      { status: 200 } // Return empty counts instead of error
    );
  }
}
