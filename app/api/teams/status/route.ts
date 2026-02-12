import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { refreshAccessToken } from '@/lib/msgraph';

/**
 * GET /api/teams/status
 * Check if MS Graph is connected and refresh token if expired
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
    const { data: tokenData, error} = await (supabase
      .from('ms_graph_tokens') as any)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !tokenData) {
      return NextResponse.json({ connected: false });
    }

    const tokenRecord = tokenData as any;
    const expiresAt = new Date(tokenRecord.expires_at);
    const now = new Date();

    // If token is expired, try to refresh it
    if (expiresAt <= now) {
      try {
        console.log('Token expired, attempting refresh for user:', user.id);
        const newTokens = await refreshAccessToken(tokenRecord.refresh_token);

        // Update in database
        await (supabase
          .from('ms_graph_tokens') as any)
          .update({
            access_token: newTokens.accessToken,
            refresh_token: newTokens.refreshToken!,
            expires_at: newTokens.expiresOn!.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        console.log('Token refreshed successfully for user:', user.id);

        return NextResponse.json({
          connected: true,
          expiresAt: newTokens.expiresOn!.toISOString(),
          isExpired: false,
          connectedSince: tokenRecord.created_at,
          refreshed: true,
        });
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, user needs to reconnect
        return NextResponse.json({
          connected: false,
          error: 'Token expired and refresh failed. Please reconnect.',
          needsReauth: true,
        });
      }
    }

    return NextResponse.json({
      connected: true,
      expiresAt: expiresAt.toISOString(),
      isExpired: false,
      connectedSince: tokenRecord.created_at,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teams/status
 * Disconnect MS Graph and clean up all Teams data
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log(`Disconnecting Teams for user ${user.id}`);

    // Delete Teams tokens
    const { error } = await (supabase
      .from('ms_graph_tokens') as any)
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    console.log(`Successfully disconnected Teams for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Microsoft Teams disconnected successfully',
      note: 'Teams meetings remain in your Microsoft account but will no longer sync to EaseMail'
    });
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
