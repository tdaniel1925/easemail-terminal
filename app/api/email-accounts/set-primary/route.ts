import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountId } = await request.json();

    // First, unset all accounts as non-primary
    await (supabase as any)
      .from('email_accounts')
      .update({ is_primary: false })
      .eq('user_id', user.id);

    // Then set the selected account as primary
    const { error } = await (supabase as any)
      .from('email_accounts')
      .update({ is_primary: true })
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set primary account error:', error);
    return NextResponse.json(
      { error: 'Failed to set primary account' },
      { status: 500 }
    );
  }
}
