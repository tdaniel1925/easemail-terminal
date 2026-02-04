// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the invite
    const inviteQuery = await supabase
      .from('organization_invites')
      .select('*, organizations:organization_id (id, name, seats, seats_used)')
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    const invite = inviteQuery.data as any;

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Check if invite is expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
    }

    // Get user email
    const { data: userData } = (await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()) as { data: any };

    // Verify email matches invite
    if (userData?.email !== invite.email) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    const orgId = invite.organization_id;
    const org = invite.organizations;

    // Check if organization has available seats
    if (org.seats_used >= org.seats) {
      return NextResponse.json({ error: 'No available seats in this organization' }, { status: 400 });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      // Mark invite as accepted anyway
      await supabase
        .from('organization_invites')
        .update({ accepted_at: new Date().toISOString() } as any)
        .eq('id', invite.id);

      return NextResponse.json({
        success: true,
        message: 'You are already a member of this organization',
        organizationId: orgId,
        organizationName: org.name,
      });
    }

    // Add user to organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: orgId,
        user_id: user.id,
        role: invite.role,
      } as any);

    if (memberError) {
      console.error('Failed to add member:', memberError);
      return NextResponse.json({ error: 'Failed to join organization' }, { status: 500 });
    }

    // Increment seats_used
    await supabase
      .from('organizations')
      .update({ seats_used: org.seats_used + 1 } as any)
      .eq('id', orgId);

    // Mark invite as accepted
    await supabase
      .from('organization_invites')
      .update({ accepted_at: new Date().toISOString() } as any)
      .eq('id', invite.id);

    return NextResponse.json({
      success: true,
      message: `You've successfully joined ${org.name}!`,
      organizationId: orgId,
      organizationName: org.name,
      role: invite.role,
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

// GET endpoint to validate token without accepting
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Find the invite
    const inviteQuery = await supabase
      .from('organization_invites')
      .select('*, organizations:organization_id (id, name)')
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    const invite = inviteQuery.data as any;

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Check if invite is expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      role: invite.role,
      organizationName: invite.organizations?.name,
      expiresAt: invite.expires_at,
    });
  } catch (error) {
    console.error('Validate invite error:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}
