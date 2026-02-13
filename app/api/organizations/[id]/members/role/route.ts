import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { getOrgRoleChangeEmailHtml } from '@/lib/email-templates';

export async function PATCH(
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
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    // Validate role
    if (!['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if current user is owner or admin
    const { data: membership } = (await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get target member details including old role
    const { data: targetMember } = (await supabase
      .from('organization_members')
      .select('role, users:user_id(email, name)')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single()) as { data: any };

    if (targetMember?.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot change owner role. Use transfer ownership instead.' },
        { status: 400 }
      );
    }

    const oldRole = targetMember?.role;

    // Get organization details
    const { data: organization } = (await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()) as { data: any };

    // Get current user's name
    const { data: currentUser } = (await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()) as { data: any };

    // Update member role
    const { error } = await (supabase
      .from('organization_members') as any)
      .update({ role })
      .eq('organization_id', orgId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send role change email notification
    if (targetMember?.users?.email && oldRole !== role) {
      try {
        const html = getOrgRoleChangeEmailHtml({
          userName: targetMember.users.name || targetMember.users.email.split('@')[0],
          organizationName: organization?.name || 'Organization',
          organizationId: orgId,
          oldRole,
          newRole: role,
          changedByName: currentUser?.name || currentUser?.email || 'Admin',
        });

        await sendEmail({
          to: targetMember.users.email,
          subject: `Your role has been updated in ${organization?.name || 'Organization'}`,
          html,
        });
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error('Failed to send role change email:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}
