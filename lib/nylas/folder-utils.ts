import { createClient } from '@/lib/supabase/server';
import Nylas from 'nylas';

export type FolderType =
  | 'inbox'
  | 'sent'
  | 'drafts'
  | 'trash'
  | 'spam'
  | 'archive'
  | 'starred'
  | 'important'
  | 'custom';

export interface NylasFolder {
  id: string;
  name: string;
  attributes?: string[];
  parentId?: string;
  childCount?: number;
  unreadCount?: number;
  totalCount?: number;
}

export interface FolderMapping {
  id: string;
  nylas_folder_id: string;
  nylas_grant_id: string;
  user_id: string;
  email_account_id: string;
  folder_name: string;
  folder_type: FolderType;
  parent_id: string | null;
  attributes: string[];
  unread_count: number;
  total_count: number;
  child_count: number;
  is_system_folder: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_synced_at: string;
}

/**
 * Detects folder type from IMAP attributes
 */
export function detectFolderTypeFromAttributes(attributes: string[] = []): FolderType {
  const attrSet = new Set(attributes.map(a => a.toLowerCase()));

  if (attrSet.has('\\inbox') || attrSet.has('\\all')) return 'inbox';
  if (attrSet.has('\\sent')) return 'sent';
  if (attrSet.has('\\drafts')) return 'drafts';
  if (attrSet.has('\\trash') || attrSet.has('\\deleted')) return 'trash';
  if (attrSet.has('\\junk') || attrSet.has('\\spam')) return 'spam';
  if (attrSet.has('\\archive')) return 'archive';
  if (attrSet.has('\\flagged') || attrSet.has('\\starred')) return 'starred';
  if (attrSet.has('\\important')) return 'important';

  return 'custom';
}

/**
 * Detects folder type from folder name (fallback)
 */
export function detectFolderTypeFromName(name: string): FolderType {
  const nameLower = name.toLowerCase();

  if (nameLower === 'inbox' || nameLower === 'all mail') return 'inbox';
  if (nameLower.includes('sent')) return 'sent';
  if (nameLower.includes('draft')) return 'drafts';
  if (nameLower.includes('trash') || nameLower.includes('deleted')) return 'trash';
  if (nameLower.includes('spam') || nameLower.includes('junk')) return 'spam';
  if (nameLower.includes('archive')) return 'archive';
  if (nameLower.includes('starred') || nameLower.includes('flagged')) return 'starred';
  if (nameLower.includes('important')) return 'important';

  return 'custom';
}

/**
 * Determines if a folder is a system folder
 */
export function isSystemFolder(folderType: FolderType): boolean {
  return folderType !== 'custom';
}

/**
 * Syncs folders from Nylas to the database for a specific email account
 */
export async function syncFoldersForAccount(
  emailAccountId: string,
  userId: string,
  grantId: string
): Promise<{ success: boolean; synced: number; errors: string[] }> {
  const supabase = await createClient();
  const errors: string[] = [];
  let syncedCount = 0;

  try {
    const nylasClient = new Nylas({
      apiKey: process.env.NYLAS_API_KEY!,
      apiUri: process.env.NYLAS_API_URI!,
    });

    // Fetch all folders from Nylas
    const response = await nylasClient.folders.list({
      identifier: grantId,
    });

    const folders = response.data || [];

    // Process each folder
    for (const folder of folders) {
      try {
        // Detect folder type from attributes first, then fallback to name
        let folderType = detectFolderTypeFromAttributes(folder.attributes || []);
        if (folderType === 'custom') {
          folderType = detectFolderTypeFromName(folder.name || '');
        }

        const isSystem = isSystemFolder(folderType);

        // Upsert folder mapping
        const supabaseClient: any = supabase;
        const { error: upsertError } = await supabaseClient
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
        } else {
          syncedCount++;
        }
      } catch (folderError: any) {
        errors.push(`Error processing folder ${folder.name}: ${folderError.message}`);
      }
    }

    return { success: errors.length === 0, synced: syncedCount, errors };
  } catch (error: any) {
    errors.push(`Failed to fetch folders from Nylas: ${error.message}`);
    return { success: false, synced: 0, errors };
  }
}

/**
 * Gets folder IDs for a specific folder type and user
 */
export async function getFolderIdsByType(
  userId: string,
  folderType: FolderType
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from('folder_mappings')
    .select('nylas_folder_id')
    .eq('user_id', userId)
    .eq('folder_type', folderType)
    .eq('is_active', true)) as { data: any[] | null; error: any };

  if (error || !data) {
    console.error('Error fetching folder IDs:', error);
    return [];
  }

  return data.map(f => f.nylas_folder_id);
}

/**
 * Gets folder ID for a specific folder type and email account
 */
export async function getFolderIdForAccount(
  emailAccountId: string,
  folderType: FolderType
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from('folder_mappings')
    .select('nylas_folder_id')
    .eq('email_account_id', emailAccountId)
    .eq('folder_type', folderType)
    .eq('is_active', true)
    .limit(1)
    .single()) as { data: any | null; error: any };

  if (error || !data) {
    return null;
  }

  return data.nylas_folder_id;
}

/**
 * Resolves a user-friendly folder filter to actual Nylas folder IDs
 * Supports: 'inbox', 'sent', 'drafts', 'trash', 'starred', etc.
 */
export async function resolveFolderFilter(
  userId: string,
  filter: string
): Promise<string[]> {
  // If it's already a folder ID (UUID or similar), return as-is
  if (filter.length > 20 || filter.includes('-')) {
    return [filter];
  }

  // Otherwise, treat it as a folder type
  const folderType = filter as FolderType;
  return getFolderIdsByType(userId, folderType);
}

/**
 * Gets all folder mappings for a user
 */
export async function getFolderMappingsForUser(userId: string): Promise<FolderMapping[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('folder_mappings')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('is_system_folder', { ascending: false })
    .order('folder_name', { ascending: true });

  if (error || !data) {
    console.error('Error fetching folder mappings:', error);
    return [];
  }

  return data as FolderMapping[];
}

/**
 * Gets custom (non-system) folders for a user
 */
export async function getCustomFoldersForUser(userId: string): Promise<FolderMapping[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('folder_mappings')
    .select('*')
    .eq('user_id', userId)
    .eq('folder_type', 'custom')
    .eq('is_active', true)
    .order('folder_name', { ascending: true });

  if (error || !data) {
    console.error('Error fetching custom folders:', error);
    return [];
  }

  return data as FolderMapping[];
}
