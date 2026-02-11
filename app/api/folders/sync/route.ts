import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncFoldersForAccount } from '@/lib/nylas/folder-utils';

/**
 * POST /api/folders/sync
 * Syncs folders from Nylas to the database for all or specific email accounts
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { accountId } = body;

    // Get email accounts to sync
    let accounts: any[] = [];

    if (accountId) {
      // Sync specific account
      const { data: specificAccount } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', accountId)
        .single();

      if (specificAccount) {
        accounts = [specificAccount];
      }
    } else {
      // Sync all accounts for this user
      const { data: allAccounts } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id);

      accounts = allAccounts || [];
    }

    if (accounts.length === 0) {
      return NextResponse.json({ error: 'No email accounts found' }, { status: 400 });
    }

    // Sync folders for each account
    const results = await Promise.all(
      accounts.map(async (account) => {
        console.log(`Syncing folders for account: ${account.email}`);

        const result = await syncFoldersForAccount(
          account.id,
          user.id,
          account.grant_id
        );

        return {
          accountId: account.id,
          accountEmail: account.email,
          ...result,
        };
      })
    );

    // Aggregate results
    const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
    const allErrors = results.flatMap(r => r.errors);
    const allSuccess = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccess,
      totalFoldersSynced: totalSynced,
      accountsProcessed: results.length,
      results,
      errors: allErrors.length > 0 ? allErrors : undefined,
    });

  } catch (error: any) {
    console.error('Folder sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync folders',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/folders/sync
 * Check sync status and get last sync times
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sync status for all accounts
    const { data: accounts } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)) as { data: any[] };

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ accounts: [] });
    }

    // Get folder mapping counts and last sync times
    const syncStatus = await Promise.all(
      accounts.map(async (account) => {
        const { data: folderMappings, count } = await supabase
          .from('folder_mappings')
          .select('*', { count: 'exact' })
          .eq('email_account_id', account.id)
          .eq('is_active', true);

        const lastSynced = folderMappings && folderMappings.length > 0
          ? folderMappings.reduce((latest, fm) => {
              const syncTime = new Date(fm.last_synced_at).getTime();
              return syncTime > latest ? syncTime : latest;
            }, 0)
          : null;

        return {
          accountId: account.id,
          accountEmail: account.email,
          folderCount: count || 0,
          lastSyncedAt: lastSynced ? new Date(lastSynced).toISOString() : null,
          needsSync: !lastSynced || (Date.now() - lastSynced) > 24 * 60 * 60 * 1000, // > 24 hours
        };
      })
    );

    return NextResponse.json({
      accounts: syncStatus,
      totalFolders: syncStatus.reduce((sum, a) => sum + a.folderCount, 0),
    });

  } catch (error: any) {
    console.error('Get folder sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
