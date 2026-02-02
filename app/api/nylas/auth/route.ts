import { NextRequest, NextResponse } from 'next/server';
import { nylas, getNylasOAuthConfig } from '@/lib/nylas/client';
import { getUser } from '@/lib/auth/actions';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await request.json();

    // Map provider to Nylas provider name
    const providerMap: { [key: string]: string } = {
      google: 'google',
      microsoft: 'microsoft',
      imap: 'imap',
    };

    const nylasProvider = providerMap[provider] || 'google';

    // Define scopes based on provider
    // Microsoft has different scope requirements than Google
    const scopeMap: { [key: string]: string[] } = {
      google: ['email', 'calendar', 'contacts'],
      microsoft: ['email'], // Microsoft calendar requires separate consent
      imap: ['email'],
    };

    const scopes = scopeMap[nylasProvider] || ['email'];

    // Build Nylas OAuth URL
    const nylasClient = nylas();
    const oauthConfig = getNylasOAuthConfig();
    const authUrl = nylasClient.auth.urlForOAuth2({
      clientId: oauthConfig.clientId,
      redirectUri: oauthConfig.redirectUri,
      provider: nylasProvider as any,
      scope: scopes,
      state: user.id, // Pass user ID in state for callback
    });

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Nylas auth error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
