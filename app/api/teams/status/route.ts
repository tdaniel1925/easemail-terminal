import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/teams/status
 * Check if MS Graph is connected
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
      .select('expires_at, created_at')
      .eq('user_id', user.id)
      .single();

    if (error || !tokenData) {
      return NextResponse.json({ connected: false });
    }

    const tokenRecord = tokenData as any;
    const expiresAt = new Date(tokenRecord.expires_at);
    const now = new Date();

    return NextResponse.json({
      connected: true,
      expiresAt: expiresAt.toISOString(),
      isExpired: expiresAt <= now,
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
 * Disconnect MS Graph
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
    const { error } = await (supabase
      .from('ms_graph_tokens') as any)
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
