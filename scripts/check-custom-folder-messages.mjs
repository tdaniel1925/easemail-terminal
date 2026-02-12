import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Checking messages in custom folders...\n');

try {
  // Get custom folders with message counts
  const { data: customFolders, error: folderError } = await supabase
    .from('folder_mappings')
    .select('*')
    .eq('folder_type', 'custom')
    .eq('is_active', true)
    .gt('total_count', 0)
    .order('total_count', { ascending: false })
    .limit(10);

  if (folderError) {
    console.error('❌ Error fetching folders:', folderError);
    process.exit(1);
  }

  if (!customFolders || customFolders.length === 0) {
    console.log('❌ No custom folders with messages found!');
    process.exit(0);
  }

  console.log(`📊 Top 10 custom folders by message count:\n`);

  for (const folder of customFolders) {
    console.log(`📁 ${folder.folder_name}`);
    console.log(`   Total in Nylas: ${folder.total_count} messages`);
    console.log(`   Nylas Folder ID: ${folder.nylas_folder_id}`);

    // Check if messages are in our database
    const { data: messages, error: msgError, count } = await supabase
      .from('messages')
      .select('id, subject, from_address', { count: 'exact' })
      .eq('user_id', folder.user_id)
      .eq('email_account_id', folder.email_account_id)
      .limit(5);

    if (msgError) {
      console.log(`   ⚠️  Error querying messages: ${msgError.message}`);
    } else {
      console.log(`   Database: ${count || 0} total messages for this account`);
      if (messages && messages.length > 0) {
        console.log(`   Sample messages:`);
        messages.slice(0, 3).forEach(msg => {
          console.log(`      - "${msg.subject?.substring(0, 50) || 'No subject'}"`);
        });
      }
    }
    console.log();
  }

  // Check total message count
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .limit(0);

  console.log(`📊 Total messages in database: ${totalMessages || 0}`);

  // Check if messages table has folder information
  const { data: sampleMessages } = await supabase
    .from('messages')
    .select('id, folder_id, folders')
    .limit(3);

  console.log('\n📋 Sample messages (checking folder field):');
  if (sampleMessages && sampleMessages.length > 0) {
    sampleMessages.forEach((msg, i) => {
      console.log(`   Message ${i + 1}:`);
      console.log(`      folder_id: ${msg.folder_id || 'NULL'}`);
      console.log(`      folders: ${JSON.stringify(msg.folders) || 'NULL'}`);
    });
  } else {
    console.log('   No messages found in database!');
    console.log('\n⚠️  Messages may not be syncing at all.');
    console.log('   The messages API loads from Nylas in real-time, not from the database.');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
