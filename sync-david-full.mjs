#!/usr/bin/env node

import Nylas from 'nylas';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const nylasApiKey = process.env.NYLAS_API_KEY;
const nylasApiUri = process.env.NYLAS_API_URI;

if (!supabaseUrl || !supabaseServiceKey || !nylasApiKey || !nylasApiUri) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const nylasClient = new Nylas({
  apiKey: nylasApiKey,
  apiUri: nylasApiUri,
});

// David's account info (from previous query)
const ACCOUNT_ID = 'a64d53d5-12e7-4f85-ab7c-462170e06eed';
const USER_ID = 'cf71035c-3dc6-43bf-a674-8cff51a1eb84';
const GRANT_ID = 'e0369e93-69dc-469f-8204-c2f400377c9c';
const EMAIL = 'david@dmillerlaw.com';

async function syncFolders() {
  console.log('📁 Step 1: Syncing folder structure...\n');

  try {
    const response = await nylasClient.folders.list({ identifier: GRANT_ID });
    const folders = response.data || [];

    console.log(`Found ${folders.length} folders from Nylas`);
    let syncedCount = 0;

    for (const folder of folders) {
      // Detect folder type
      const attributes = folder.attributes || [];
      let folderType = 'custom';

      const attrSet = new Set(attributes.map(a => a.toLowerCase()));
      if (attrSet.has('\\inbox') || attrSet.has('\\all')) folderType = 'inbox';
      else if (attrSet.has('\\sent')) folderType = 'sent';
      else if (attrSet.has('\\drafts')) folderType = 'drafts';
      else if (attrSet.has('\\trash') || attrSet.has('\\deleted')) folderType = 'trash';
      else if (attrSet.has('\\junk') || attrSet.has('\\spam')) folderType = 'spam';
      else if (attrSet.has('\\archive')) folderType = 'archive';

      const { error } = await supabase
        .from('folder_mappings')
        .upsert({
          nylas_folder_id: folder.id,
          nylas_grant_id: GRANT_ID,
          user_id: USER_ID,
          email_account_id: ACCOUNT_ID,
          folder_name: folder.name || 'Unnamed',
          folder_type: folderType,
          parent_id: folder.parentId || null,
          attributes: attributes,
          unread_count: folder.unreadCount || 0,
          total_count: folder.totalCount || 0,
          child_count: folder.childCount || 0,
          is_system_folder: folderType !== 'custom',
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'nylas_folder_id,email_account_id',
        });

      if (!error) {
        syncedCount++;
        console.log(`  ✓ ${folder.name} (${folderType})`);
      } else {
        console.error(`  ✗ ${folder.name}: ${error.message}`);
      }
    }

    console.log(`\n✅ Synced ${syncedCount}/${folders.length} folders\n`);
    return folders;
  } catch (error) {
    console.error('❌ Folder sync failed:', error.message);
    throw error;
  }
}

async function syncMessages(folders) {
  console.log('📧 Step 2: Syncing ALL messages from ALL folders...\n');
  console.log('⚠️  This may take several minutes for large mailboxes\n');

  let totalSynced = 0;

  for (const folder of folders) {
    console.log(`📂 Syncing: ${folder.name}`);

    let pageToken = undefined;
    let pageCount = 0;
    let folderSynced = 0;

    try {
      do {
        const response = await nylasClient.messages.list({
          identifier: GRANT_ID,
          queryParams: {
            in: [folder.id],
            limit: 200,
            ...(pageToken && { pageToken }),
          },
        });

        const messages = response.data || [];
        pageToken = response.nextCursor;
        pageCount++;

        console.log(`  Page ${pageCount}: ${messages.length} messages`);

        for (const msg of messages) {
          try {
            const fromEmail = Array.isArray(msg.from) && msg.from.length > 0
              ? msg.from[0].email
              : '';

            await supabase.from('messages').upsert({
              nylas_message_id: msg.id,
              nylas_thread_id: msg.threadId,
              nylas_grant_id: GRANT_ID,
              user_id: USER_ID,
              email_account_id: ACCOUNT_ID,
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
            }, {
              onConflict: 'nylas_message_id',
            });

            folderSynced++;
            totalSynced++;
          } catch (msgError) {
            // Continue on individual message errors
          }
        }

      } while (pageToken);

      console.log(`  ✅ ${folder.name}: ${folderSynced} messages synced\n`);

    } catch (folderError) {
      console.error(`  ❌ ${folder.name}: ${folderError.message}\n`);
    }
  }

  console.log(`\n🎉 Total messages synced: ${totalSynced}\n`);
  return totalSynced;
}

async function main() {
  console.log('🚀 Starting FULL mailbox sync for David Romero\n');
  console.log(`Account: ${EMAIL}`);
  console.log(`Account ID: ${ACCOUNT_ID}\n`);
  console.log('━'.repeat(60) + '\n');

  try {
    const folders = await syncFolders();
    const messageSynced = await syncMessages(folders);

    console.log('━'.repeat(60));
    console.log('\n✅ SYNC COMPLETE!\n');
    console.log(`📁 Folders: ${folders.length}`);
    console.log(`📧 Messages: ${messageSynced}`);
    console.log('\n🎉 David can now see all his emails organized in folders!\n');

  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
