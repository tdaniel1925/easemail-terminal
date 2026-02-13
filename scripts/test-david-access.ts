import { config } from 'dotenv';
import Nylas from 'nylas';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testDavidAccess() {
  try {
    // Get David's grant_id
    const { data: account } = await supabase
      .from('email_accounts')
      .select('grant_id, email')
      .ilike('email', '%david%dmillerlaw%')
      .single();

    if (!account) {
      console.error('❌ Could not find David\'s account');
      return;
    }

    console.log(`Testing access for: ${account.email}`);
    console.log(`Grant ID: ${account.grant_id}\n`);

    const nylasClient = new Nylas({
      apiKey: process.env.NYLAS_API_KEY!,
      apiUri: process.env.NYLAS_API_URI!,
    });

    // Test 1: Try to fetch messages
    console.log('📧 Test 1: Fetching messages...');
    try {
      const messages = await nylasClient.messages.list({
        identifier: account.grant_id,
        queryParams: { limit: 1 },
      });
      console.log(`✓ Successfully fetched messages (${messages.data.length} returned)`);
    } catch (msgError: any) {
      console.error(`❌ Failed to fetch messages: ${msgError.message}`);
    }

    console.log('');

    // Test 2: Try to fetch folders
    console.log('📁 Test 2: Fetching folders...');
    try {
      const folders = await nylasClient.folders.list({
        identifier: account.grant_id,
      });
      console.log(`✓ Successfully fetched ${folders.data.length} folders:`);
      folders.data.forEach((folder: any) => {
        console.log(`   - ${folder.name} (${folder.id})`);
      });
    } catch (folderError: any) {
      console.error(`❌ Failed to fetch folders: ${folderError.message}`);
      console.error(`   Error details: ${JSON.stringify(folderError, null, 2)}`);
    }

    console.log('');

  } catch (error: any) {
    console.error('❌ Script error:', error.message);
  }
}

testDavidAccess();
