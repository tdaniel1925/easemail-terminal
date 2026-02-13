#!/usr/bin/env node

import Nylas from 'nylas';
import { config } from 'dotenv';

config({ path: '.env.local' });

const nylasApiKey = process.env.NYLAS_API_KEY;
const nylasApiUri = process.env.NYLAS_API_URI;
const GRANT_ID = 'e0369e93-69dc-469f-8204-c2f400377c9c';

if (!nylasApiKey || !nylasApiUri) {
  console.error('Missing Nylas credentials');
  process.exit(1);
}

const nylasClient = new Nylas({
  apiKey: nylasApiKey,
  apiUri: nylasApiUri,
});

async function checkGrant() {
  console.log('🔍 Checking David\'s Microsoft account grant...\n');

  try {
    // Test 1: Try fetching folders
    console.log('Test 1: Attempting to fetch folders from Microsoft...\n');
    try {
      const folders = await nylasClient.folders.list({ identifier: GRANT_ID });
      console.log(`✅ SUCCESS! Fetched ${folders.data.length} folders!`);
      console.log('\nFolders:');
      folders.data.slice(0, 10).forEach(f => {
        console.log(`  - ${f.name} (${f.attributes?.join(', ') || 'no attributes'})`);
      });
      if (folders.data.length > 10) {
        console.log(`  ... and ${folders.data.length - 10} more`);
      }
      return; // Success, no need to continue
    } catch (folderError) {
      console.error('❌ Folder fetch failed:', folderError.message);
      console.error('Status Code:', folderError.statusCode);
      console.error('Type:', folderError.type);
      console.error('Flow ID:', folderError.flowId);

      if (folderError.message.includes('Unable to complete folder retrieval from Microsoft')) {
        console.error('\n⚠️  ISSUE IDENTIFIED: Microsoft API is having trouble returning folder data');
        console.error('   This is typically caused by:');
        console.error('   1. Microsoft API rate limiting');
        console.error('   2. Temporary Microsoft server issues');
        console.error('   3. The mailbox is very large and timing out');
        console.error('   4. Grant needs re-authorization');
        console.error('\n💡 SOLUTIONS:');
        console.error('   - Wait 5-10 minutes and retry');
        console.error('   - Have David reconnect his Microsoft account');
        console.error('   - Check Nylas dashboard for grant status');
      }
    }

    // Test 2: Try fetching messages from inbox directly
    console.log('\n\nTest 2: Attempting to fetch messages (bypass folder list)...\n');
    try {
      const messages = await nylasClient.messages.list({
        identifier: GRANT_ID,
        queryParams: { limit: 5 }
      });
      console.log(`✅ Can fetch messages! Found ${messages.data.length} recent messages`);
      console.log('\nRecent messages:');
      messages.data.forEach(m => {
        console.log(`  - ${m.subject} (${new Date(m.date * 1000).toLocaleDateString()})`);
      });
      console.log('\n💡 The grant is valid, but folder listing is failing.');
      console.log('   This is a Microsoft API issue, not an auth issue.');
    } catch (msgError) {
      console.error('❌ Message fetch also failed:', msgError.message);
      console.error('\n⚠️  The grant might be invalid or expired.');
      console.error('   David needs to reconnect his account.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkGrant();
