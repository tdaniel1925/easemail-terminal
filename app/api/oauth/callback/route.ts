import { NextRequest, NextResponse } from 'next/server';
import { nylas, getNylasOAuthConfig } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { safeExternalCall } from '@/lib/api-helpers';
import { isString } from '@/lib/guards';

interface NylasTokenResponse {
  grantId: string;
  email?: string;
  provider?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user ID
  const error = searchParams.get('error');

  // Handle OAuth error from provider
  if (error) {
    logger.warn('OAuth error from provider', { error });
    return NextResponse.redirect(
      new URL(`/app/connect?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Validate required parameters
  if (!code || !isString(code)) {
    logger.warn('OAuth callback missing code parameter');
    return NextResponse.redirect(
      new URL('/app/connect?error=missing_code', request.url)
    );
  }

  if (!state || !isString(state)) {
    logger.warn('OAuth callback missing state parameter (user ID)');
    return NextResponse.redirect(
      new URL('/app/connect?error=missing_state', request.url)
    );
  }

  try {
    // Exchange code for grant with error handling
    const nylasClient = nylas();
    const oauthConfig = getNylasOAuthConfig();

    const { data: response, error: exchangeError } = await safeExternalCall<NylasTokenResponse>(
      () => nylasClient.auth.exchangeCodeForToken({
        clientId: oauthConfig.clientId,
        redirectUri: oauthConfig.redirectUri,
        code,
      }),
      'Nylas OAuth Token Exchange'
    );

    if (exchangeError || !response) {
      logger.error('Failed to exchange OAuth code', undefined, {
        userId: state,
        error: exchangeError,
      });
      return NextResponse.redirect(
        new URL('/app/connect?error=oauth_exchange_failed', request.url)
      );
    }

    const { grantId, email, provider } = response;

    // Validate grant ID
    if (!grantId || !isString(grantId)) {
      logger.error('Invalid grant ID from Nylas', undefined, {
        userId: state,
        grantId,
      });
      return NextResponse.redirect(
        new URL('/app/connect?error=invalid_grant', request.url)
      );
    }

    // Save to database with proper typing
    const supabase = await createClient();

    const { error: dbError } = (await (supabase
      .from('email_accounts') as any)
      .insert({
        user_id: state,
        grant_id: grantId,
        email: email || 'unknown@example.com',
        provider: (provider || 'GOOGLE').toUpperCase(),
        is_primary: true,
      })) as { error: any };

    if (dbError) {
      logger.error('Database error saving email account', dbError, {
        userId: state,
        grantId,
        email,
      });
      return NextResponse.redirect(
        new URL('/app/connect?error=database_error', request.url)
      );
    }

    logger.info('Email account connected successfully', {
      userId: state,
      grantId,
      email,
      provider,
    });

    // Check if this is part of onboarding flow
    // Note: We can't access sessionStorage server-side, so we'll redirect to a client page
    // that checks sessionStorage and handles the redirect appropriately

    // Success - redirect to app (client will check onboarding status)
    return NextResponse.redirect(
      new URL('/app?connected=true&check_onboarding=true', request.url)
    );
  } catch (error: any) {
    logger.error('OAuth callback error', error, {
      userId: state,
      component: 'api/oauth/callback',
    });
    return NextResponse.redirect(
      new URL('/app/connect?error=oauth_failed', request.url)
    );
  }
}
