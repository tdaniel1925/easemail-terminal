import { config } from 'dotenv';
import Nylas from 'nylas';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkGrantStatus() {
  // First get David's grant_id from database
  const { data: account } = await supabase
    .from('email_accounts')
    .select('grant_id, email')
    .ilike('email', '%david%dmillerlaw%')
    .single();

  if (!account) {
    console.error('❌ Could not find David\'s account');
    return;
  }

  const DAVID_GRANT_ID = account.grant_id;
  console.log(`Found account: ${account.email}`);
  console.log(`Grant ID: ${DAVID_GRANT_ID}\n`);
  try {
    console.log('🔍 Checking Nylas grant status for David...\n');

    const nylasClient = new Nylas({
      apiKey: process.env.NYLAS_API_KEY!,
      apiUri: process.env.NYLAS_API_URI!,
    });

    // Try to list folders to test access
    console.log('📁 Testing folder access...');
    try {
      const response = await nylasClient.folders.list({
        identifier: DAVID_GRANT_ID,
        queryParams: { limit: 5 },
      });

      console.log(`✓ Successfully fetched ${response.data.length} folders`);
      response.data.forEach((folder: any) => {
        console.log(`   - ${folder.name}`);
      });
      console.log('✓ Grant is valid and has proper access');
    } catch (folderError: any) {
      console.error('❌ Failed to fetch folders:', folderError.message);
      console.error('   This indicates the grant may be invalid or expired');
      console.error('   David needs to reconnect his account');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkGrantStatus();
