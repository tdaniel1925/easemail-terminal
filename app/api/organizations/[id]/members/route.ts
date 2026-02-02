import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orgId = id;

    // Check if user is owner or admin
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    // Check if organization has available seats
    const { data: org } = await supabase
      .from('organizations')
      .select('seats, seats_used')
      .eq('id', orgId)
      .single();

    if (org && org.seats_used >= org.seats) {
      return NextResponse.json({ error: 'No available seats' }, { status: 400 });
    }

    // Create invite
    const { data: invite, error } = await supabase
      .from('organization_invites')
      .insert({
        organization_id: orgId,
        email,
        role,
        invited_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // TODO: Send invite email via Resend

    return NextResponse.json({ invite });
  } catch (error) {
    console.error('Invite member error:', error);
    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orgId = id;
    const { searchParams } = new URL(request.url);
    const memberUserId = searchParams.get('userId');

    if (!memberUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if user is owner or admin
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Cannot remove the last owner
    if (memberUserId === user.id && membership.role === 'OWNER') {
      const { count } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('role', 'OWNER');

      if (count === 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last owner' },
          { status: 400 }
        );
      }
    }

    // Remove member
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', orgId)
      .eq('user_id', memberUserId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Decrement seats_used
    await supabase
      .from('organizations')
      .update({ seats_used: supabase.rpc('decrement_seats', { org_id: orgId }) })
      .eq('id', orgId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
