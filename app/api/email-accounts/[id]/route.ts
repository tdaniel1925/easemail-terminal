import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteCache } from '@/lib/redis/client';
import { revalidatePath } from 'next/cache';

interface AccountToDelete {
  email: string;
  is_primary: boolean;
  grant_id: string;
}

export async function DELETE(
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

    // Get account info before deletion
    const { data: accountToDelete, error: fetchError } = await supabase
      .from('email_accounts')
      .select('email, is_primary, grant_id')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single<AccountToDelete>();

    if (fetchError || !accountToDelete) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Delete ALL account-specific data
    console.log(`Deleting all data for account ${accountId} (${accountToDelete.email})`);

    // 1. Delete drafts associated with this account
    await supabase
      .from('drafts')
      .delete()
      .eq('email_account_id', accountId)
      .eq('user_id', user.id);

    // 2. Delete scheduled emails associated with this account
    await supabase
      .from('scheduled_emails')
      .delete()
      .eq('email_account_id', accountId)
      .eq('user_id', user.id);

    // 3. Delete email signatures for this account
    await supabase
      .from('email_signatures')
      .delete()
      .eq('email_account_id', accountId)
      .eq('user_id', user.id);

    // 4. Delete email rules for this account
    await supabase
      .from('email_rules')
      .delete()
      .eq('email_account_id', accountId)
      .eq('user_id', user.id);

    // 5. Delete snoozed emails (user-specific, not account-specific, but still cleanup)
    await (supabase
      .from('snoozed_emails') as any)
      .delete()
      .eq('user_id', user.id);

    // 6. Delete custom labels and their associations
    const { data: userLabels } = await (supabase
      .from('custom_labels') as any)
      .select('id')
      .eq('user_id', user.id);

    if (userLabels && userLabels.length > 0) {
      // Delete message_labels associations
      await (supabase
        .from('message_labels') as any)
        .delete()
        .eq('user_id', user.id);

      // Delete the labels themselves
      await (supabase
        .from('custom_labels') as any)
        .delete()
        .eq('user_id', user.id);
    }

    // 7. Delete email templates
    await (supabase
      .from('email_templates') as any)
      .delete()
      .eq('user_id', user.id);

    // Note: For data tied to grant_id (calendar events, contacts, messages, folders),
    // these are stored in Nylas and will be inaccessible once the grant is revoked.
    // We clean up our cached data below.

    // 8. Clear cached data for this account
    // Note: Cache entries have 60-second TTL and will expire naturally.
    // We clear specific known cache keys to speed up the process.
    if (accountToDelete.grant_id) {
      try {
        // Clear common cache patterns (events, contacts, messages)
        const cacheKeys = [
          `events:${accountToDelete.grant_id}:all:all`,
          `contacts:${accountToDelete.grant_id}`,
          `messages:${accountToDelete.grant_id}`,
        ];

        await Promise.all(cacheKeys.map(key => deleteCache(key)));
        console.log(`Cleared cache for grant_id: ${accountToDelete.grant_id}`);
      } catch (cacheError) {
        console.error('Failed to clear cache:', cacheError);
        // Don't fail the deletion if cache clear fails
      }
    }

    // Delete the email account (this will cascade delete via DB constraints)
    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If this was the primary account, set another one as primary
    if (accountToDelete.is_primary) {
      const { data: remainingAccounts } = (await supabase
        .from('email_accounts')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)) as { data: { id: string }[] | null };

      if (remainingAccounts && remainingAccounts.length > 0) {
        await (supabase as any)
          .from('email_accounts')
          .update({ is_primary: true })
          .eq('id', remainingAccounts[0].id);
      }
    }

    console.log(`Successfully deleted account ${accountId} and all associated data`);

    // Revalidate all relevant paths to refresh server components
    revalidatePath('/app', 'layout'); // Revalidate entire app layout and all nested pages
    revalidatePath('/app/inbox');
    revalidatePath('/app/settings/email-accounts');

    return NextResponse.json({
      success: true,
      message: 'Email account and all associated data deleted successfully',
      deleted: {
        account: accountToDelete.email,
        data_types: [
          'email_account',
          'drafts',
          'scheduled_emails',
          'email_signatures',
          'email_rules',
          'snoozed_emails',
          'custom_labels',
          'message_labels',
          'email_templates',
          'cached_events',
          'cached_messages',
          'cached_contacts'
        ]
      }
    });
  } catch (error) {
    console.error('Delete email account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete email account' },
      { status: 500 }
    );
  }
}
