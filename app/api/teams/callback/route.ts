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
      console.error('User verification failed:', { hasUser: !!user, userId, sessionUserId: user?.id });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/app/teams?error=unauthorized`
      );
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/teams/callback`;
    console.log('Exchanging code for tokens with redirect URI:', redirectUri);

    let tokens;
    try {
      tokens = await getTokenFromCode(code, redirectUri);
      console.log('Token exchange successful');
    } catch (tokenError: any) {
      console.error('Token exchange error details:', {
        message: tokenError?.message,
        errorCode: tokenError?.errorCode,
        errorMessage: tokenError?.errorMessage,
        stack: tokenError?.stack,
      });
      throw new Error(`Token exchange failed: ${tokenError?.message || 'Unknown error'}`);
    }

    if (!tokens?.accessToken) {
      console.error('Invalid tokens received:', { hasAccessToken: !!tokens?.accessToken, hasRefreshToken: !!tokens?.refreshToken, tokens });
      throw new Error('No access token received from Microsoft');
    }

    const hasRealRefreshToken = tokens.refreshToken && tokens.refreshToken !== 'placeholder';
    console.log('Token validation:', { hasAccessToken: true, hasRefreshToken: hasRealRefreshToken });

    // Store tokens in database
    try {
      const { error: dbError } = await (supabase
        .from('ms_graph_tokens') as any)
        .upsert({
          user_id: user.id,
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_at: tokens.expiresOn!.toISOString(),
          scope: 'Calendars.ReadWrite OnlineMeetings.ReadWrite User.Read',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
      console.log('Tokens stored successfully in database');
    } catch (dbError: any) {
      console.error('Database operation failed:', dbError);
      throw new Error(`Database error: ${dbError?.message || 'Unknown database error'}`);
    }

    // Redirect to Teams page with success
    console.log('MS Teams connection successful for user:', user.id);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/teams?connected=true`
    );
  } catch (error: any) {
    console.error('MS Graph callback error:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/teams?error=token_exchange_failed&details=${encodeURIComponent(error?.message || 'Unknown error')}`
    );
  }
}
