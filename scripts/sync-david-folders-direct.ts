import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import Nylas from 'nylas';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Folder type detection helpers
function detectFolderTypeFromAttributes(attributes: string[]): string {
  if (!attributes || attributes.length === 0) return 'custom';

  const attrLower = attributes.map((a: string) => a.toLowerCase());
  if (attrLower.includes('\\inbox')) return 'inbox';
  if (attrLower.includes('\\sent')) return 'sent';
  if (attrLower.includes('\\drafts')) return 'drafts';
  if (attrLower.includes('\\trash') || attrLower.includes('\\deleted')) return 'trash';
  if (attrLower.includes('\\junk') || attrLower.includes('\\spam')) return 'spam';
  if (attrLower.includes('\\archive')) return 'archive';
  if (attrLower.includes('\\starred') || attrLower.includes('\\flagged')) return 'starred';
  if (attrLower.includes('\\important')) return 'important';

  return 'custom';
}

function detectFolderTypeFromName(name: string): string {
  if (!name) return 'custom';

  const nameLower = name.toLowerCase();
  if (nameLower.includes('inbox')) return 'inbox';
  if (nameLower.includes('sent')) return 'sent';
  if (nameLower.includes('draft')) return 'drafts';
  if (nameLower.includes('trash') || nameLower.includes('deleted')) return 'trash';
  if (nameLower.includes('junk') || nameLower.includes('spam')) return 'spam';
  if (nameLower.includes('archive')) return 'archive';
  if (nameLower.includes('starred') || nameLower.includes('flagged')) return 'starred';
  if (nameLower.includes('important')) return 'important';

  return 'custom';
}

function isSystemFolder(folderType: string): boolean {
  return ['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive', 'starred', 'important'].includes(folderType);
}

async function syncFoldersForAccount(
  emailAccountId: string,
  userId: string,
  grantId: string
): Promise<{ success: boolean; synced: number; errors: string[] }> {
  const errors: string[] = [];
  let syncedCount = 0;

  try {
    const nylasClient = new Nylas({
      apiKey: process.env.NYLAS_API_KEY!,
      apiUri: process.env.NYLAS_API_URI!,
    });

    console.log('   Fetching folders from Nylas...');
    const response = await nylasClient.folders.list({
      identifier: grantId,
    });

    const folders = response.data || [];
    console.log(`   Found ${folders.length} folders`);

    for (const folder of folders) {
      try {
        let folderType = detectFolderTypeFromAttributes(folder.attributes || []);
        if (folderType === 'custom') {
          folderType = detectFolderTypeFromName(folder.name || '');
        }

        const isSystem = isSystemFolder(folderType);

        const { error: upsertError } = await supabase
          .from('folder_mappings')
          .upsert({
            nylas_folder_id: folder.id,
            nylas_grant_id: grantId,
            user_id: userId,
            email_account_id: emailAccountId,
            folder_name: folder.name || 'Unnamed',
            folder_type: folderType,
            parent_id: folder.parentId || null,
            attributes: folder.attributes || [],
            unread_count: folder.unreadCount || 0,
            total_count: folder.totalCount || 0,
            child_count: folder.childCount || 0,
            is_system_folder: isSystem,
            is_active: true,
            last_synced_at: new Date().toISOString(),
          }, {
            onConflict: 'nylas_folder_id,email_account_id',
          });

        if (upsertError) {
          errors.push(`Failed to sync folder ${folder.name}: ${upsertError.message}`);
          console.error(`     ❌ ${folder.name}: ${upsertError.message}`);
        } else {
          syncedCount++;
          console.log(`     ✓ ${folder.name} (${folderType})`);
        }
      } catch (folderError: any) {
        errors.push(`Error processing folder ${folder.name}: ${folderError.message}`);
        console.error(`     ❌ ${folder.name}: ${folderError.message}`);
      }
    }

    return { success: errors.length === 0, synced: syncedCount, errors };
  } catch (error: any) {
    errors.push(`Failed to fetch folders from Nylas: ${error.message}`);
    return { success: false, synced: 0, errors };
  }
}

async function syncDavidFolders() {
  try {
    console.log('🔍 Looking for David\'s email account...\n');

    const { data: accounts, error: fetchError } = await supabase
      .from('email_accounts')
      .select('id, email, user_id, grant_id, provider, created_at')
      .or('email.ilike.%david%,email.ilike.%dmillerlaw%')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching accounts:', fetchError);
      return;
    }

    if (!accounts || accounts.length === 0) {
      console.log('❌ No accounts found for David');
      return;
    }

    console.log(`✓ Found ${accounts.length} account(s):\n`);
    accounts.forEach((account: any, index: number) => {
      console.log(`${index + 1}. ${account.email}`);
      console.log(`   Account ID: ${account.id}`);
      console.log(`   User ID: ${account.user_id}`);
      console.log(`   Provider: ${account.provider}`);
      console.log(`   Created: ${new Date(account.created_at).toLocaleString()}\n`);
    });

    for (const account of accounts) {
      console.log(`📁 Syncing folders for ${account.email}...`);

      try {
        const result = await syncFoldersForAccount(
          account.id,
          account.user_id,
          account.grant_id
        );

        console.log('');
        if (result.success) {
          console.log(`✓ Sync completed successfully for ${account.email}`);
          console.log(`   Folders synced: ${result.synced}`);
        } else {
          console.error(`⚠️  Sync completed with errors for ${account.email}`);
          console.log(`   Folders synced: ${result.synced}`);
          console.log(`   Errors: ${result.errors.length}`);
          result.errors.forEach(err => console.log(`   - ${err}`));
        }
      } catch (syncError: any) {
        console.error(`❌ Error syncing ${account.email}:`, syncError.message);
      }

      console.log('');
    }

    console.log('✅ Folder sync process completed!');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

syncDavidFolders();
