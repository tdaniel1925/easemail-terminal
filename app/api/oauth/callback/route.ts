import { NextRequest, NextResponse } from 'next/server';
import { nylas, nylasOAuthConfig } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user ID
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/app/connect?error=${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/app/connect?error=missing_params', request.url)
    );
  }

  try {
    // Exchange code for grant
    const response = await nylas.auth.exchangeCodeForToken({
      clientId: nylasOAuthConfig.clientId,
      redirectUri: nylasOAuthConfig.redirectUri,
      code,
    });

    const { grantId, email, provider } = response;

    // Save to database
    const supabase = await createClient();

    const { error: dbError } = await (supabase as any)
      .from('email_accounts')
      .insert({
        user_id: state,
        grant_id: grantId,
        email: email,
        provider: (provider || 'GOOGLE').toUpperCase(),
        is_primary: true,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.redirect(
        new URL('/app/connect?error=database_error', request.url)
      );
    }

    // Success - redirect to app
    return NextResponse.redirect(
      new URL('/app?connected=true', request.url)
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/app/connect?error=oauth_failed', request.url)
    );
  }
}
