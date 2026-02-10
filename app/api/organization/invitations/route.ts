import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all invitations for this user's email
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all invitations for this email
    const { data: invitations, error } = await supabase
      .from('organization_invites')
      .select(`
        id,
        organization_id,
        email,
        role,
        invited_by,
        expires_at,
        created_at,
        accepted_at,
        organizations (
          name
        )
      `)
      .eq('email', (userData as any).email)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transform to match expected format
    const transformedInvitations = invitations?.map((inv: any) => ({
      id: inv.id,
      organization_id: inv.organization_id,
      organization: {
        name: inv.organizations?.name || 'Unknown Organization',
      },
      email: inv.email,
      role: inv.role,
      invited_by: inv.invited_by,
      expires_at: inv.expires_at,
      created_at: inv.created_at,
      accepted_at: inv.accepted_at,
    })) || [];

    return NextResponse.json({ invitations: transformedInvitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to get invitations' },
      { status: 500 }
    );
  }
}
