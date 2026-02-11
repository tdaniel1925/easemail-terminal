import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: accounts } = (await supabase
      .from('email_accounts')
      .select('id, email, provider, grant_id, is_primary')
      .eq('user_id', user.id)) as { data: any[] | null };

    return NextResponse.json({
      accounts: accounts?.map((acc: any) => ({
        id: acc.id,
        email: acc.email,
        provider: acc.provider,
        grant_id: acc.grant_id,
        has_grant_id: !!acc.grant_id,
        grant_id_length: acc.grant_id?.length || 0,
        is_primary: acc.is_primary
      })) || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
