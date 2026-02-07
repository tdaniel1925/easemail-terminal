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
      // Return empty folders array instead of error for better UX
      return NextResponse.json({ folders: [], message: 'No email account connected' });
    }

    const grantId = account.grant_id;

    if (!grantId) {
      console.log('No grant_id found for account:', account.id);
      return NextResponse.json({ folders: [], message: 'Email account not properly configured' });
    }

    // Fetch folders from Nylas
    try {
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
    } catch (nylasError: any) {
      console.error('Nylas folders error:', nylasError.message || nylasError);
      // Return empty folders array instead of error for better UX
      return NextResponse.json({
        folders: [],
        message: 'Could not fetch folders from email provider'
      });
    }
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
