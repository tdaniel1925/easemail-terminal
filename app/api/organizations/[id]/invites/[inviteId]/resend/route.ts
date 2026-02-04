import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrganizationInviteEmail } from '@/lib/resend/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orgId, inviteId } = await params;

    // Check if user is owner or admin
    const { data: membership } = (await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get invite details with organization name
    const { data: invite } = (await supabase
      .from('organization_invites')
      .select('*, organizations:organization_id (name)')
      .eq('id', inviteId)
      .eq('organization_id', orgId)
      .single()) as { data: any };

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (invite.accepted_at) {
      return NextResponse.json({ error: 'Invite already accepted' }, { status: 400 });
    }

    // Update expiry date to 7 days from now
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);

    const { error } = await (supabase
      .from('organization_invites') as any)
      .update({ expires_at: newExpiry.toISOString() })
      .eq('id', inviteId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get inviter name
    const { data: inviterData } = (await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()) as { data: any };

    const inviterName = inviterData?.name || inviterData?.email || 'A team member';
    const organizationName = invite.organizations?.name || 'the organization';
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;
    const inviteeName = invite.email.split('@')[0];

    // Send invite email
    try {
      await sendOrganizationInviteEmail({
        to: invite.email,
        inviteeName,
        organizationName,
        inviterName,
        role: invite.role,
        inviteLink,
      });

      console.log('Invite resent successfully to:', invite.email);
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError);
      // Don't fail the request if email fails - invite was still updated
    }

    return NextResponse.json({ success: true, message: 'Invite resent successfully' });
  } catch (error) {
    console.error('Resend invite error:', error);
    return NextResponse.json(
      { error: 'Failed to resend invite' },
      { status: 500 }
    );
  }
}
