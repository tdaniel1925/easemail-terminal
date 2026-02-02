import { NextRequest, NextResponse } from 'next/server';
import { nylas, nylasOAuthConfig } from '@/lib/nylas/client';
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

    // Build Nylas OAuth URL
    const authUrl = nylas.auth.urlForOAuth2({
      clientId: nylasOAuthConfig.clientId,
      redirectUri: nylasOAuthConfig.redirectUri,
      provider: nylasProvider,
      scopes: ['email', 'calendar', 'contacts'],
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
