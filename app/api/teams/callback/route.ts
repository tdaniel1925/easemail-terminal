import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTokenFromCode } from '@/lib/msgraph';

/**
 * GET /api/teams/callback
 * OAuth callback for MS Graph
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/teams?error=auth_failed`
    );
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  try {
    // Decode state to get user ID
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

    const supabase = await createClient();

    // Verify user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/teams/callback`;
    const tokens = await getTokenFromCode(code, redirectUri);

    // Store tokens in database
    const { error: dbError } = await (supabase
      .from('ms_graph_tokens') as any)
      .upsert({
        user_id: user.id,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken!,
        expires_at: tokens.expiresOn!.toISOString(),
        scope: 'Calendars.ReadWrite OnlineMeetings.ReadWrite User.Read',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Redirect to Teams page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/teams?connected=true`
    );
  } catch (error) {
    console.error('MS Graph callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/teams?error=token_exchange_failed`
    );
  }
}
