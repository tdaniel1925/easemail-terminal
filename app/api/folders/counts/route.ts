import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFolderIdsByType } from '@/lib/nylas/folder-utils';
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

    // Get folder IDs for each folder type using folder_mappings
    const inboxFolderIds = await getFolderIdsByType(user.id, 'inbox');
    const sentFolderIds = await getFolderIdsByType(user.id, 'sent');
    const draftsFolderIds = await getFolderIdsByType(user.id, 'drafts');
    const trashFolderIds = await getFolderIdsByType(user.id, 'trash');
    const archiveFolderIds = await getFolderIdsByType(user.id, 'archive');
    const starredFolderIds = await getFolderIdsByType(user.id, 'starred');

    // Count unread messages in inbox (folder_ids array overlaps with inbox folder IDs)
    const { count: inboxCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_unread', true)
      .overlaps('folder_ids', inboxFolderIds);

    // Count starred messages (any folder)
    const { count: starredCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_starred', true);

    // Count messages in sent folder
    const { count: sentCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .overlaps('folder_ids', sentFolderIds);

    // Count unread messages in archive
    const { count: archiveCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_unread', true)
      .overlaps('folder_ids', archiveFolderIds);

    // Count messages in trash
    const { count: trashCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .overlaps('folder_ids', trashFolderIds);

    // Count draft messages
    const { count: draftsCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_draft', true);

    // Snoozed is a feature we haven't implemented yet, so return 0 for now
    const snoozedCount = 0;

    const result = {
      inbox: inboxCount || 0,
      starred: starredCount || 0,
      sent: sentCount || 0,
      snoozed: snoozedCount,
      archive: archiveCount || 0,
      trash: trashCount || 0,
      drafts: draftsCount || 0,
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
