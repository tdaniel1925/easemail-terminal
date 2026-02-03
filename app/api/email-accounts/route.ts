import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message, accounts: [] }, { status: 400 });
    }

    return NextResponse.json({ accounts: accounts || [] });
  } catch (error) {
    console.error('Get email accounts error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get email accounts',
        accounts: []
      },
      { status: 500 }
    );
  }
}
