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

    // Step 2: Backfill ALL messages from all folders with pagination
    console.log('Backfilling all messages from all folders...');
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
 * Backfill ALL messages from Nylas (complete mailbox sync with pagination)
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

    // Get ALL folders to sync (not just inbox)
    const { data: allFolders } = await serviceClient
      .from('folder_mappings')
      .select('nylas_folder_id, folder_name, folder_type')
      .eq('email_account_id', emailAccountId)
      .eq('is_active', true);

    if (!allFolders || allFolders.length === 0) {
      errors.push('No folders found for backfill');
      return { synced: 0, errors };
    }

    console.log(`Syncing messages from ${allFolders.length} folders...`);

    // Sync messages from each folder with pagination
    for (const folder of allFolders) {
      console.log(`Syncing folder: ${folder.folder_name} (${folder.folder_type})`);

      let pageToken: string | undefined = undefined;
      let folderSyncedCount = 0;

      do {
        try {
          // Fetch messages with pagination (200 per page)
          const response = await nylasClient.messages.list({
            identifier: grantId,
            queryParams: {
              in: [folder.nylas_folder_id],
              limit: 200,
              ...(pageToken && { pageToken }),
            },
          });

          const messages = response.data || [];
          pageToken = response.nextCursor;

          console.log(`  Retrieved ${messages.length} messages (page token: ${pageToken ? 'more pages' : 'last page'})`);

          // Batch insert messages
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
              folderSyncedCount++;
            } catch (msgError: any) {
              errors.push(`Failed to sync message ${msg.id}: ${msgError.message}`);
            }
          }

          // If we have more pages, continue
          if (pageToken) {
            console.log(`  Synced ${folderSyncedCount} messages from ${folder.folder_name} so far...`);
          }

        } catch (pageError: any) {
          errors.push(`Failed to fetch page for folder ${folder.folder_name}: ${pageError.message}`);
          break; // Stop pagination for this folder on error
        }
      } while (pageToken); // Continue until no more pages

      console.log(`  ✓ Completed ${folder.folder_name}: ${folderSyncedCount} messages`);
    }

    console.log(`Total messages synced: ${syncedCount}`);
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
