import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { performInitialSync } from '@/lib/nylas/initial-sync';

/**
 * Trigger manual sync for a specific email account
 * POST /api/email-accounts/[id]/sync?fullSync=true (for full sync)
 * POST /api/email-accounts/[id]/sync (for quick sync - default)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const accountId = id;

    // Check if full sync is requested (default: false for quick sync)
    const searchParams = request.nextUrl.searchParams;
    const fullSync = searchParams.get('fullSync') === 'true';

    // Get the email account
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json(
        { error: 'Email account not found' },
        { status: 404 }
      );
    }

    if (!account.grant_id) {
      return NextResponse.json(
        { error: 'Email account not properly connected' },
        { status: 400 }
      );
    }

    console.log(`Starting manual ${fullSync ? 'full' : 'quick'} sync for account: ${accountId}`);

    // Perform sync (quick or full based on parameter)
    const result = await performInitialSync(
      accountId,
      user.id,
      account.grant_id,
      fullSync
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Sync completed successfully',
        details: {
          folders: {
            synced: result.folders.synced,
            errors: result.folders.errors,
          },
          messages: {
            synced: result.messages.synced,
            errors: result.messages.errors,
          },
          calendars: {
            synced: result.calendars.synced,
            errors: result.calendars.errors,
          },
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Sync completed with errors',
        details: {
          folders: result.folders,
          messages: result.messages,
          calendars: result.calendars,
        },
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Manual sync error:', error);
    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
