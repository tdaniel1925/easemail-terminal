import { createClient as createServiceClient } from '@supabase/supabase-js';
import Nylas from 'nylas';
import { syncFoldersForAccount } from './folder-utils';

/**
 * Performs initial sync of all data from Nylas after account connection
 * This includes: folders, initial message backfill, and calendar setup
 */
export async function performInitialSync(
  emailAccountId: string,
  userId: string,
  grantId: string
): Promise<{
  success: boolean;
  folders: { synced: number; errors: string[] };
  messages: { synced: number; errors: string[] };
  calendars: { synced: number; errors: string[] };
}> {
  const result = {
    success: false,
    folders: { synced: 0, errors: [] as string[] },
    messages: { synced: 0, errors: [] as string[] },
    calendars: { synced: 0, errors: [] as string[] },
  };

  try {
    console.log('Starting initial sync for account:', emailAccountId);

    // Step 1: Sync folders
    console.log('Syncing folders...');
    const folderResult = await syncFoldersForAccount(emailAccountId, userId, grantId);
    result.folders = folderResult;
    console.log(`Folders synced: ${folderResult.synced}, errors: ${folderResult.errors.length}`);

    // Step 2: Backfill recent messages (last 30 days)
    console.log('Backfilling recent messages...');
    const messageResult = await backfillRecentMessages(emailAccountId, userId, grantId);
    result.messages = messageResult;
    console.log(`Messages synced: ${messageResult.synced}, errors: ${messageResult.errors.length}`);

    // Step 3: Sync calendars metadata
    console.log('Syncing calendar metadata...');
    const calendarResult = await syncCalendarMetadata(emailAccountId, userId, grantId);
    result.calendars = calendarResult;
    console.log(`Calendars synced: ${calendarResult.synced}, errors: ${calendarResult.errors.length}`);

    result.success = true;
    console.log('Initial sync completed successfully');
  } catch (error) {
    console.error('Initial sync failed:', error);
    result.folders.errors.push(`Initial sync failed: ${error}`);
  }

  return result;
}

/**
 * Backfill recent messages from Nylas (last 30 days)
 */
async function backfillRecentMessages(
  emailAccountId: string,
  userId: string,
  grantId: string
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let syncedCount = 0;

  try {
    const nylasClient = new Nylas({
      apiKey: process.env.NYLAS_API_KEY!,
      apiUri: process.env.NYLAS_API_URI!,
    });

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get folder IDs for inbox (we'll sync inbox messages only for initial load)
    const { data: inboxFolders } = await serviceClient
      .from('folder_mappings')
      .select('nylas_folder_id')
      .eq('email_account_id', emailAccountId)
      .eq('folder_type', 'inbox')
      .eq('is_active', true);

    if (!inboxFolders || inboxFolders.length === 0) {
      errors.push('No inbox folder found for backfill');
      return { synced: 0, errors };
    }

    const inboxFolderId = inboxFolders[0].nylas_folder_id;

    // Calculate timestamp for 30 days ago
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

    // Fetch recent messages from Nylas
    const response = await nylasClient.messages.list({
      identifier: grantId,
      queryParams: {
        in: [inboxFolderId],
        limit: 100, // Limit initial backfill to 100 messages
        receivedAfter: thirtyDaysAgo,
      },
    });

    const messages = response.data || [];
    console.log(`Found ${messages.length} recent messages to backfill`);

    // Insert messages into database
    for (const msg of messages) {
      try {
        const fromEmail = Array.isArray(msg.from) && msg.from.length > 0
          ? msg.from[0].email
          : '';

        const folderIds = msg.folders || [];

        await (serviceClient as any).from('messages').upsert({
          nylas_message_id: msg.id,
          nylas_thread_id: msg.threadId,
          nylas_grant_id: grantId,
          user_id: userId,
          email_account_id: emailAccountId,
          subject: msg.subject || '(No Subject)',
          from_email: fromEmail,
          to_recipients: msg.to || [],
          cc_recipients: msg.cc || [],
          bcc_recipients: msg.bcc || [],
          body: msg.body || msg.snippet || '',
          snippet: msg.snippet || '',
          folder_ids: folderIds,
          labels: [],
          is_unread: msg.unread || false,
          is_starred: msg.starred || false,
          is_draft: false,
          date: new Date(msg.date * 1000).toISOString(),
          has_attachments: (msg.attachments || []).length > 0,
          attachments: msg.attachments || [],
        }, {
          onConflict: 'nylas_message_id',
        });

        syncedCount++;
      } catch (msgError: any) {
        errors.push(`Failed to sync message ${msg.id}: ${msgError.message}`);
      }
    }
  } catch (error: any) {
    errors.push(`Message backfill failed: ${error.message}`);
  }

  return { synced: syncedCount, errors };
}

/**
 * Sync calendar metadata from Nylas
 */
async function syncCalendarMetadata(
  emailAccountId: string,
  userId: string,
  grantId: string
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let syncedCount = 0;

  try {
    const nylasClient = new Nylas({
      apiKey: process.env.NYLAS_API_KEY!,
      apiUri: process.env.NYLAS_API_URI!,
    });

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch calendars from Nylas
    const response = await nylasClient.calendars.list({
      identifier: grantId,
    });

    const calendars = response.data || [];
    console.log(`Found ${calendars.length} calendars`);

    // Store calendar metadata in database
    for (const calendar of calendars) {
      try {
        await (serviceClient as any).from('calendar_metadata').upsert({
          nylas_calendar_id: calendar.id,
          nylas_grant_id: grantId,
          user_id: userId,
          email_account_id: emailAccountId,
          calendar_name: calendar.name || 'Unnamed Calendar',
          description: calendar.description || null,
          timezone: calendar.timezone || 'UTC',
          is_primary: calendar.isPrimary || false,
          read_only: calendar.readOnly || false,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'nylas_calendar_id,email_account_id',
        });

        syncedCount++;
      } catch (calError: any) {
        errors.push(`Failed to sync calendar ${calendar.name}: ${calError.message}`);
      }
    }
  } catch (error: any) {
    errors.push(`Calendar sync failed: ${error.message}`);
  }

  return { synced: syncedCount, errors };
}
