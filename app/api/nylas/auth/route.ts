import { NextRequest, NextResponse } from 'next/server';
import { nylas, getNylasOAuthConfig } from '@/lib/nylas/client';
import { getUser } from '@/lib/auth/actions';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      console.error('Nylas auth: User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await request.json();
    console.log('Nylas auth request:', { userId: user.id, provider });

    // Map provider to Nylas provider name
    const providerMap: { [key: string]: string } = {
      google: 'google',
      microsoft: 'microsoft',
      imap: 'imap',
    };

    const nylasProvider = providerMap[provider] || 'google';

    // Define scopes based on provider
    // Microsoft requires full Graph API scope URIs for proper access
    const scopeMap: { [key: string]: string[] } = {
      google: ['email', 'calendar', 'contacts'],
      microsoft: [
        'https://graph.microsoft.com/Mail.ReadWrite',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Calendars.ReadWrite',
        'https://graph.microsoft.com/Contacts.Read',
        'https://graph.microsoft.com/User.Read'
      ],
      imap: ['email'],
    };

    const scopes = scopeMap[nylasProvider] || ['email'];

    // Build Nylas OAuth URL
    const nylasClient = nylas();
    const oauthConfig = getNylasOAuthConfig();

    console.log('Nylas OAuth config:', {
      clientId: oauthConfig.clientId?.substring(0, 10) + '...',
      redirectUri: oauthConfig.redirectUri,
      provider: nylasProvider,
      scopes,
    });

    const authUrl = nylasClient.auth.urlForOAuth2({
      clientId: oauthConfig.clientId,
      redirectUri: oauthConfig.redirectUri,
      provider: nylasProvider as any,
      scope: scopes,
      state: user.id, // Pass user ID in state for callback
    });

    console.log('Generated OAuth URL:', authUrl);
    return NextResponse.json({ url: authUrl });
  } catch (error: any) {
    console.error('Nylas auth error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: 'Failed to generate auth URL', details: error?.message },
      { status: 500 }
    );
  }
}
