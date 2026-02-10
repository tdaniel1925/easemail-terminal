import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitationId } = await params;

    // Get user email
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invites')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Verify invitation belongs to this user's email
    if (invitation.email !== userData.email) {
      return NextResponse.json({ error: 'This invitation is not for you' }, { status: 403 });
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 });
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', invitation.organization_id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this organization' }, { status: 400 });
    }

    // Add user as member
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
      } as any);

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('organization_invites')
      .update({ accepted_at: new Date().toISOString() } as any)
      .eq('id', invitationId);

    if (updateError) {
      console.error('Failed to update invitation:', updateError);
      // Don't fail the request if we can't update the invitation
    }

    // Increment seats_used
    const { error: seatsError } = await supabase.rpc('increment_seats', {
      org_id: invitation.organization_id
    });

    if (seatsError) {
      console.error('Failed to increment seats:', seatsError);
      // Don't fail the request
    }

    return NextResponse.json({ success: true, organization_id: invitation.organization_id });
  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
