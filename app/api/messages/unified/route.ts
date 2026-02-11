import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { resolveFolderFilter, getFolderIdForAccount } from '@/lib/nylas/folder-utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const pageToken = searchParams.get('page_token');
    const folderId = searchParams.get('folder');

    // Get all user's email accounts
    const { data: accounts } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)) as { data: any[] };

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ error: 'No email accounts connected' }, { status: 400 });
    }

    const nylasClient = nylas();

    // Fetch messages from all accounts in parallel using Promise.allSettled for fault tolerance
    const accountMessagesResults = await Promise.allSettled(
      accounts.map(async (account) => {
        try {
          // Build query params for this account
          const queryParams: any = {
            limit: Math.ceil(limit / accounts.length), // Distribute limit across accounts
          };

          if (pageToken) {
            queryParams.page_token = pageToken;
          }

          // Resolve folder filter to actual Nylas folder IDs for this account
          if (folderId) {
            console.log(`Filtering messages by folder/filter for account ${account.email}:`, folderId);

            try {
              // Try to get folder ID for this specific account
              const accountFolderId = await getFolderIdForAccount(account.id, folderId as any);
              if (accountFolderId) {
                console.log(`Resolved to folder ID for ${account.email}:`, accountFolderId);
                queryParams.in = [accountFolderId];
              } else {
                // Fallback: pass the filter as-is
                console.log(`Using folder filter as-is for ${account.email}:`, folderId);
                queryParams.in = [folderId];
              }
            } catch (error) {
              console.error(`Error resolving folder filter for ${account.email}:`, error);
              queryParams.in = [folderId];
            }
          }

          const response = await nylasClient.messages.list({
            identifier: account.grant_id,
            queryParams,
          });

          // Ensure response.data exists and is an array
          if (!response.data || !Array.isArray(response.data)) {
            return [];
          }

          // Add account info to each message
          return response.data.map((message: any) => ({
            ...message,
            accountId: account.id,
            accountEmail: account.email,
            accountName: account.name,
          }));
        } catch (error) {
          console.error(`Failed to fetch messages for account ${account.email}:`, error);
          return [];
        }
      })
    );

    // Extract successful results and track cursors
    let hasNextCursor = false;
    const accountMessages = accountMessagesResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Account ${accounts[index].email} message fetch failed:`, result.reason);
        return [];
      }
    });

    // Flatten and sort by date (newest first)
    const allMessages = accountMessages
      .flat()
      .sort((a, b) => b.date - a.date)
      .slice(0, limit); // Limit total messages

    // For unified view, we simplify pagination - if we got the full limit, assume there might be more
    const nextCursor = allMessages.length >= limit ? 'has_more' : null;

    return NextResponse.json({
      messages: allMessages,
      accountCount: accounts.length,
      nextCursor,
    });
  } catch (error) {
    console.error('Fetch unified messages error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch messages',
        messages: [],
        accountCount: 0,
        nextCursor: null
      },
      { status: 500 }
    );
  }
}
