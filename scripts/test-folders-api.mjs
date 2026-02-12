import { config } from 'dotenv';
import Nylas from 'nylas';

config({ path: '.env.local' });

console.log('🧪 Testing Nylas folders API directly...\n');

const accountId = '923de312-97a1-4354-8c21-40e000008c5f';  // From your custom folder check
const grantId = '02e4f51b-7c5c-4de7-907e-f1e48c8b8bd9';     // Need to get this from database

try {
  // First, get the grant ID from database
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: account } = await supabase
    .from('email_accounts')
    .select('grant_id, email')
    .eq('id', accountId)
    .single();

  if (!account || !account.grant_id) {
    console.error('❌ Could not find account or grant_id');
    process.exit(1);
  }

  console.log(`📧 Account: ${account.email}`);
  console.log(`🔑 Grant ID: ${account.grant_id}\n`);

  // Now test Nylas API
  const nylasClient = new Nylas({
    apiKey: process.env.NYLAS_API_KEY,
    apiUri: process.env.NYLAS_API_URI,
  });

  console.log('📂 Fetching folders from Nylas...\n');

  const response = await nylasClient.folders.list({
    identifier: account.grant_id,
  });

  const folders = response.data || [];

  console.log(`✅ Found ${folders.length} total folders\n`);

  // Group by type
  const systemFolders = folders.filter(f => {
    const attrs = (f.attributes || []).map(a => a.toLowerCase());
    return attrs.some(a =>
      a.includes('\\\\inbox') ||
      a.includes('\\\\sent') ||
      a.includes('\\\\drafts') ||
      a.includes('\\\\trash') ||
      a.includes('\\\\spam') ||
      a.includes('\\\\junk')
    );
  });

  const customFolders = folders.filter(f => !systemFolders.includes(f));

  console.log(`🗂️  System folders: ${systemFolders.length}`);
  console.log(`📁 Custom folders: ${customFolders.length}\n`);

  if (customFolders.length > 0) {
    console.log('📁 Sample custom folders (first 10):');
    customFolders.slice(0, 10).forEach((folder, i) => {
      console.log(`\n   ${i + 1}. ${folder.name}`);
      console.log(`      ID: ${folder.id?.substring(0, 40)}...`);
      console.log(`      Attributes: ${JSON.stringify(folder.attributes || [])}`);
      console.log(`      Total messages: ${folder.totalCount || 0}`);
      console.log(`      Unread: ${folder.unreadCount || 0}`);
    });
  } else {
    console.log('⚠️  No custom folders found in Nylas response!');
  }

  // Show what the API endpoint returns
  console.log('\n📤 What /api/folders should return:');
  console.log(`   folders: Array(${folders.length})`);
  console.log(`   Including ${customFolders.length} custom folders`);

} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}
