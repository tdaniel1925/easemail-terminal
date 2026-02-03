import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Delete account-specific data
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

    // Note: snoozed_emails, message_labels, custom_labels, templates, and signatures
    // are user-wide (not account-specific), so they are preserved as per requirements

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

    return NextResponse.json({
      success: true,
      message: 'Email account and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete email account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete email account' },
      { status: 500 }
    );
  }
}
