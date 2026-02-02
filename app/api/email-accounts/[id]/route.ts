import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Check if this is the only account
    const { data: accounts } = await supabase
      .from('email_accounts')
      .select('id')
      .eq('user_id', user.id);

    if (accounts && accounts.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot remove your only email account' },
        { status: 400 }
      );
    }

    // Delete the account
    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If this was the primary account, set another one as primary
    const { data: wasPrimary } = await supabase
      .from('email_accounts')
      .select('is_primary')
      .eq('id', accountId)
      .single();

    if (wasPrimary?.is_primary) {
      const { data: remainingAccounts } = await supabase
        .from('email_accounts')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (remainingAccounts && remainingAccounts.length > 0) {
        await supabase
          .from('email_accounts')
          .update({ is_primary: true })
          .eq('id', remainingAccounts[0].id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete email account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete email account' },
      { status: 500 }
    );
  }
}
