#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import Nylas from 'nylas';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const nylasApiKey = process.env.NYLAS_API_KEY;
const nylasApiUri = process.env.NYLAS_API_URI;

// David's account details
const DAVID_ACCOUNT_ID = 'ca14ebf7-96ff-471d-9b6d-ce0326cacfa0';
const DAVID_USER_ID = 'cf71035c-3dc6-43bf-a674-8cff51a1eb84';
const DAVID_GRANT_ID = 'e0369e93-69dc-469f-8204-c2f400377c9c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const nylasClient = new Nylas({ apiKey: nylasApiKey, apiUri: nylasApiUri });

async function syncFolders() {
  console.log('📁 Syncing folders...');
  let syncedCount = 0;
  const errors = [];

  try {
    const response = await nylasClient.folders.list({ identifier: DAVID_GRANT_ID });
    const folders = response.data || [];

    console.log(`Found ${folders.length} folders`);

    for (const folder of folders) {
      try {
        await supabase.from('folder_mappings').upsert({
          nylas_folder_id: folder.id,
          nylas_grant_id: DAVID_GRANT_ID,
          user_id: DAVID_USER_ID,
          email_account_id: DAVID_ACCOUNT_ID,
          folder_name: folder.name || 'Unnamed',
          folder_type: detectFolderType(folder),
          parent_id: folder.parentId || null,
          attributes: folder.attributes || [],
          unread_count: folder.unreadCount || 0,
          total_count: folder.totalCount || 0,
          child_count: folder.childCount || 0,
          is_system_folder: true,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, { onConflict: 'nylas_folder_id,email_account_id' });

        syncedCount++;
        console.log(`  ✓ ${folder.name}`);
      } catch (err) {
        errors.push(`Failed to sync folder ${folder.name}: ${err.message}`);
      }
    }
  } catch (err) {
    errors.push(`Folder sync failed: ${err.message}`);
  }

  return { synced: syncedCount, errors };
}

async function syncMessages() {
  console.log('\n📧 Syncing messages from all folders...');
  let totalSynced = 0;
  const errors = [];

  try {
    // Get all folders
    const { data: folders } = await supabase
      .from('folder_mappings')
      .select('nylas_folder_id, folder_name')
      .eq('email_account_id', DAVID_ACCOUNT_ID)
      .eq('is_active', true);

    if (!folders || folders.length === 0) {
      errors.push('No folders found');
      return { synced: 0, errors };
    }

    console.log(`Syncing messages from ${folders.length} folders...\n`);

    for (const folder of folders) {
      console.log(`  📂 ${folder.folder_name}...`);
      let folderSynced = 0;
      let pageToken = undefined;

      do {
        try {
          const response = await nylasClient.messages.list({
            identifier: DAVID_GRANT_ID,
            queryParams: {
              in: [folder.nylas_folder_id],
              limit: 200,
              ...(pageToken && { pageToken }),
            },
          });

          const messages = response.data || [];
          pageToken = response.nextCursor;

          for (const msg of messages) {
            try {
              const fromEmail = msg.from?.[0]?.email || '';

              await supabase.from('messages').upsert({
                nylas_message_id: msg.id,
                nylas_thread_id: msg.threadId,
                nylas_grant_id: DAVID_GRANT_ID,
                user_id: DAVID_USER_ID,
                email_account_id: DAVID_ACCOUNT_ID,
                subject: msg.subject || '(No Subject)',
                from_email: fromEmail,
                to_recipients: msg.to || [],
                cc_recipients: msg.cc || [],
                bcc_recipients: msg.bcc || [],
                body: msg.body || msg.snippet || '',
                snippet: msg.snippet || '',
                folder_ids: msg.folders || [],
                labels: [],
                is_unread: msg.unread || false,
                is_starred: msg.starred || false,
                is_draft: false,
                date: new Date(msg.date * 1000).toISOString(),
                has_attachments: (msg.attachments || []).length > 0,
                attachments: msg.attachments || [],
              }, { onConflict: 'nylas_message_id' });

              folderSynced++;
              totalSynced++;
            } catch (err) {
              // Silently skip errors for individual messages
            }
          }

          if (pageToken) {
            process.stdout.write(`.`);
          }
        } catch (err) {
          errors.push(`Page error in ${folder.folder_name}: ${err.message}`);
          break;
        }
      } while (pageToken);

      console.log(` ${folderSynced} messages`);
    }
  } catch (err) {
    errors.push(`Message sync failed: ${err.message}`);
  }

  return { synced: totalSynced, errors };
}

async function syncCalendars() {
  console.log('\n📅 Syncing calendars...');
  let syncedCount = 0;
  const errors = [];

  try {
    const response = await nylasClient.calendars.list({ identifier: DAVID_GRANT_ID });
    const calendars = response.data || [];

    console.log(`Found ${calendars.length} calendars`);

    for (const calendar of calendars) {
      try {
        await supabase.from('calendar_metadata').upsert({
          nylas_calendar_id: calendar.id,
          nylas_grant_id: DAVID_GRANT_ID,
          user_id: DAVID_USER_ID,
          email_account_id: DAVID_ACCOUNT_ID,
          calendar_name: calendar.name || 'Unnamed Calendar',
          description: calendar.description || null,
          timezone: calendar.timezone || 'UTC',
          is_primary: calendar.isPrimary || false,
          read_only: calendar.readOnly || false,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, { onConflict: 'nylas_calendar_id,email_account_id' });

        syncedCount++;
        console.log(`  ✓ ${calendar.name}`);
      } catch (err) {
        errors.push(`Failed to sync calendar ${calendar.name}: ${err.message}`);
      }
    }
  } catch (err) {
    errors.push(`Calendar sync failed: ${err.message}`);
  }

  return { synced: syncedCount, errors };
}

function detectFolderType(folder) {
  const attrs = folder.attributes || [];
  const name = (folder.name || '').toLowerCase();

  if (attrs.includes('\\Inbox') || name === 'inbox') return 'inbox';
  if (attrs.includes('\\Sent') || name.includes('sent')) return 'sent';
  if (attrs.includes('\\Drafts') || name.includes('draft')) return 'drafts';
  if (attrs.includes('\\Trash') || name.includes('trash')) return 'trash';
  if (attrs.includes('\\Junk') || name.includes('spam')) return 'spam';
  return 'custom';
}

async function main() {
  console.log('🚀 Starting full mailbox sync for David Romero\n');
  console.log('Account: david@dmillerlaw.com');
  console.log('Provider: Microsoft\n');
  console.log('This may take several minutes...\n');
  console.log('='.repeat(60) + '\n');

  const folderResult = await syncFolders();
  const messageResult = await syncMessages();
  const calendarResult = await syncCalendars();

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ SYNC COMPLETE!\n');
  console.log(`📁 Folders: ${folderResult.synced} synced, ${folderResult.errors.length} errors`);
  console.log(`📧 Messages: ${messageResult.synced} synced, ${messageResult.errors.length} errors`);
  console.log(`📅 Calendars: ${calendarResult.synced} synced, ${calendarResult.errors.length} errors`);

  if (folderResult.errors.length + messageResult.errors.length + calendarResult.errors.length > 0) {
    console.log('\n⚠️  Errors occurred (first 5):');
    const allErrors = [...folderResult.errors, ...messageResult.errors, ...calendarResult.errors];
    allErrors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
  }

  console.log('\n🎉 David can now access all his emails and calendars!');
}

main().catch(console.error);
