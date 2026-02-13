import { NextRequest, NextResponse } from 'next/server';
import { nylas, getNylasOAuthConfig } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { safeExternalCall } from '@/lib/api-helpers';
import { isString } from '@/lib/guards';
import { performInitialSync } from '@/lib/nylas/initial-sync';

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

  console.log('OAuth callback received:', {
    hasCode: !!code,
    hasState: !!state,
    hasError: !!error,
    url: request.url,
  });

  // Handle OAuth error from provider
  if (error) {
    logger.warn('OAuth error from provider', { error });
    return NextResponse.redirect(
      new URL(`/onboarding?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Validate required parameters
  if (!code || !isString(code)) {
    logger.warn('OAuth callback missing code parameter');
    return NextResponse.redirect(
      new URL('/onboarding?error=missing_code', request.url)
    );
  }

  if (!state || !isString(state)) {
    logger.warn('OAuth callback missing state parameter (user ID)');
    return NextResponse.redirect(
      new URL('/onboarding?error=missing_state', request.url)
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
        new URL('/onboarding?error=oauth_exchange_failed', request.url)
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
        new URL('/onboarding?error=invalid_grant', request.url)
      );
    }

    // Save to database using service role to bypass RLS
    // OAuth callbacks happen server-side and session cookies may not be reliable
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('Saving email account:', {
      userId: state,
      grantId: grantId?.substring(0, 10) + '...',
      email,
      provider: (provider || 'GOOGLE').toUpperCase(),
    });

    // Use upsert to handle duplicate grant_ids (user reconnecting same account)
    const { error: dbError } = (await (serviceClient
      .from('email_accounts') as any)
      .upsert({
        user_id: state,
        grant_id: grantId,
        email: email || 'unknown@example.com',
        provider: (provider || 'GOOGLE').toUpperCase(),
        is_primary: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'grant_id',
      })) as { error: any };

    if (dbError) {
      logger.error('Database error saving email account', dbError, {
        userId: state,
        grantId,
        email,
        errorMessage: dbError?.message,
        errorDetails: dbError?.details,
        errorHint: dbError?.hint,
        errorCode: dbError?.code,
      });
      console.error('Full database error:', JSON.stringify(dbError, null, 2));
      return NextResponse.redirect(
        new URL('/onboarding?error=database_error', request.url)
      );
    }

    logger.info('Email account connected successfully', {
      userId: state,
      grantId,
      email,
      provider,
    });

    // Get the account ID for folder sync
    const { data: savedAccount } = await serviceClient
      .from('email_accounts')
      .select('id')
      .eq('grant_id', grantId)
      .single();

    // Automatically perform initial sync for the newly connected account
    // This syncs: folders, recent messages, and calendar metadata
    if (savedAccount?.id) {
      console.log('Triggering automatic initial sync for new account:', savedAccount.id);
      try {
        const syncResult = await performInitialSync(
          savedAccount.id,
          state,
          grantId
        );
        console.log('Automatic initial sync completed:', {
          success: syncResult.success,
          folders: `${syncResult.folders.synced} synced, ${syncResult.folders.errors.length} errors`,
          messages: `${syncResult.messages.synced} synced, ${syncResult.messages.errors.length} errors`,
          calendars: `${syncResult.calendars.synced} synced, ${syncResult.calendars.errors.length} errors`,
        });
      } catch (syncError) {
        // Log error but don't fail the OAuth flow
        console.error('Failed to auto-sync (non-fatal):', syncError);
      }
    }

    // Check if user has completed onboarding
    const { data: preferences } = await serviceClient
      .from('user_preferences')
      .select('onboarding_completed')
      .eq('user_id', state)
      .single();

    // Redirect based on onboarding status
    if (preferences?.onboarding_completed) {
      // User has already completed onboarding, send them to email accounts settings
      return NextResponse.redirect(
        new URL('/app/settings/email-accounts?success=true', request.url)
      );
    } else {
      // User is in onboarding flow
      return NextResponse.redirect(
        new URL('/onboarding?email_connected=true', request.url)
      );
    }
  } catch (error: any) {
    logger.error('OAuth callback error', error, {
      userId: state,
      component: 'api/oauth/callback',
    });
    return NextResponse.redirect(
      new URL('/onboarding?error=oauth_failed', request.url)
    );
  }
}
