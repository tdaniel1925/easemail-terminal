import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthUrl, getTokenFromCode } from '@/lib/msgraph';

/**
 * GET /api/teams/auth
 * Initiate OAuth flow for MS Graph
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/teams/callback`;
    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');

    const authUrl = await getAuthUrl(redirectUri, state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('MS Graph auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
