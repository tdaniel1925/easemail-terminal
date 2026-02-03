import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    // Get user's email account(s)
    let account: any;
    if (accountId) {
      const { data: specificAccount } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', accountId)
        .single();

      account = specificAccount;
    } else {
      const { data: primaryAccount } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      account = primaryAccount;
    }

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    const grantId = account.grant_id;

    // Fetch folders from Nylas
    const nylasClient = nylas();
    const response = await nylasClient.folders.list({
      identifier: grantId,
    });

    // Ensure folders is always an array
    const folders = response.data || [];

    console.log('Folders fetched:', folders.length, 'folders');
    if (folders.length > 0) {
      console.log('Sample folder:', {
        id: folders[0].id,
        name: folders[0].name,
        attributes: folders[0].attributes,
      });
    }

    return NextResponse.json({
      folders,
    });
  } catch (error) {
    console.error('Fetch folders error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch folders',
        folders: []
      },
      { status: 500 }
    );
  }
}
