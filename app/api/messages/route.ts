import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { getCachedOrFetch } from '@/lib/redis/client';
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

    // Resolve folder filter to actual Nylas folder IDs
    if (folderId) {
      console.log('Filtering messages by folder/filter:', folderId);

      try {
        // Try to resolve the filter to actual folder IDs
        const resolvedFolderIds = await resolveFolderFilter(user.id, folderId);

        if (resolvedFolderIds.length > 0) {
          console.log('Resolved to Nylas folder IDs:', resolvedFolderIds);
          queryParams.in = resolvedFolderIds;
        } else {
          // Fallback: try to get folder ID for this specific account
          const accountFolderId = await getFolderIdForAccount(account.id, folderId as any);
          if (accountFolderId) {
            console.log('Found account-specific folder ID:', accountFolderId);
            queryParams.in = [accountFolderId];
          } else {
            // Last resort: check if it's a direct Nylas folder ID
            if (folderId.length > 20 || folderId.includes('-')) {
              console.log('Using folder filter as direct Nylas ID:', folderId);
              queryParams.in = [folderId];
            } else {
              // Folder not found - return empty results instead of all messages
              console.warn(`Folder '${folderId}' not found in database. Folders may need syncing.`);
              return NextResponse.json({
                messages: [],
                nextCursor: null,
                warning: `Folder '${folderId}' not found. Try refreshing or syncing folders.`
              });
            }
          }
        }
      } catch (error) {
        console.error('Error resolving folder filter:', error);
        return NextResponse.json({
          messages: [],
          nextCursor: null,
          error: 'Failed to resolve folder filter'
        }, { status: 500 });
      }
    }

    // Fetch messages from Nylas
    const nylasClient = nylas();
    const response = await nylasClient.messages.list({
      identifier: grantId,
      queryParams,
    });

    // Ensure messages is always an array
    const messages = response.data || [];

    return NextResponse.json({
      messages,
      nextCursor: response.nextCursor || null,
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch messages',
        messages: [],
        nextCursor: null
      },
      { status: 500 }
    );
  }
}
