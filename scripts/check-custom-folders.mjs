import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Checking custom folders in database...\n');

try {
  // Get all folder mappings
  const { data: folders, error } = await supabase
    .from('folder_mappings')
    .select('*')
    .eq('is_active', true)
    .order('folder_type')
    .order('folder_name');

  if (error) {
    console.error('❌ Error fetching folders:', error);
    process.exit(1);
  }

  if (!folders || folders.length === 0) {
    console.log('❌ No folders found in database!');
    console.log('   Run folder sync to populate folders.');
    process.exit(0);
  }

  console.log(`📊 Total folders: ${folders.length}\n`);

  // Group by folder type
  const foldersByType = folders.reduce((acc, folder) => {
    if (!acc[folder.folder_type]) {
      acc[folder.folder_type] = [];
    }
    acc[folder.folder_type].push(folder);
    return acc;
  }, {});

  // Display statistics
  console.log('📋 Folders by type:');
  Object.keys(foldersByType).sort().forEach(type => {
    const count = foldersByType[type].length;
    const icon = type === 'custom' ? '📁' : '🗂️';
    console.log(`   ${icon} ${type.toUpperCase()}: ${count} folder(s)`);
  });

  // Show custom folders in detail
  const customFolders = foldersByType['custom'] || [];
  if (customFolders.length > 0) {
    console.log(`\n✅ Custom folders found (${customFolders.length}):`);
    customFolders.forEach(folder => {
      console.log(`\n   📁 ${folder.folder_name}`);
      console.log(`      ID: ${folder.nylas_folder_id}`);
      console.log(`      User: ${folder.user_id}`);
      console.log(`      Email Account: ${folder.email_account_id}`);
      console.log(`      Total messages: ${folder.total_count}`);
      console.log(`      Unread: ${folder.unread_count}`);
      console.log(`      Last synced: ${new Date(folder.last_synced_at).toLocaleString()}`);
    });
  } else {
    console.log('\n⚠️  No custom folders found!');
    console.log('   This could mean:');
    console.log('   1. User has no custom folders/labels in their email');
    console.log('   2. Folders need to be synced');
    console.log('   3. All folders are being categorized as system folders');
  }

  // Check for system folders
  const systemTypes = ['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive', 'starred', 'important'];
  const systemFolders = folders.filter(f => systemTypes.includes(f.folder_type));
  console.log(`\n🗂️  System folders: ${systemFolders.length}`);

  // Show some example folder attributes
  if (folders.length > 0) {
    console.log('\n📋 Sample folder attributes (first 3 folders):');
    folders.slice(0, 3).forEach(folder => {
      console.log(`\n   ${folder.folder_name}:`);
      console.log(`      Type: ${folder.folder_type}`);
      console.log(`      Attributes: ${JSON.stringify(folder.attributes || [])}`);
      console.log(`      Is System: ${folder.is_system_folder}`);
    });
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
