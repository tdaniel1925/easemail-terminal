// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function GET(
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

    // Check if user is super admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single() as { data: { is_super_admin: boolean } | null };

    const isSuperAdmin = userData?.is_super_admin || false;

    // Check if user is a member and has appropriate role (skip for super admins)
    let membership: any = null;
    if (!isSuperAdmin) {
      const { data: memberData } = (await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single()) as { data: any };

      membership = memberData;

      if (!membership) {
        return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
      }

      // Only OWNER and ADMIN roles can access organization management
      if (membership.role === 'MEMBER') {
        return NextResponse.json(
          { error: 'Insufficient permissions. Only organization admins can manage the organization.' },
          { status: 403 }
        );
      }
    }

    // Get organization details
    const { data: organization } = (await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()) as { data: any };

    // Get all members with login tracking
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: members, error: membersError} = (await serviceClient
      .from('organization_members')
      .select(`
        *,
        users:user_id(email, name)
      `)
      .eq('organization_id', orgId)
      .order('joined_at', { ascending: true })) as { data: any; error: any };

    if (membersError) {
      console.error('Members query error:', {
        message: membersError.message,
        details: membersError.details,
        hint: membersError.hint,
        code: membersError.code,
      });
    }

    // Get login tracking separately for each member if we have members
    if (members && members.length > 0) {
      const memberIds = members.map((m: any) => m.user_id);
      const { data: loginData } = await serviceClient
        .from('user_login_tracking')
        .select('user_id, last_login_at, login_count')
        .in('user_id', memberIds);

      // Attach login tracking to members
      if (loginData) {
        members.forEach((member: any) => {
          member.user_login_tracking = loginData.filter((l: any) => l.user_id === member.user_id);
        });
      }
    }

    // Get pending invites
    const { data: pendingInvites } = (await supabase
      .from('organization_invites')
      .select('*')
      .eq('organization_id', orgId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false })) as { data: any };

    return NextResponse.json({
      organization,
      members,
      pendingInvites: pendingInvites || [],
      currentUserRole: isSuperAdmin ? 'SUPER_ADMIN' : membership.role,
    });
  } catch (error) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { error: 'Failed to get organization' },
      { status: 500 }
    );
  }
}

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

    // Check if user is super admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single() as { data: { is_super_admin: boolean } | null };

    const isSuperAdmin = userData?.is_super_admin || false;

    // Check if user is owner or admin (skip for super admins)
    let membership: any = null;
    if (!isSuperAdmin) {
      const { data: memberData } = (await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single()) as { data: any };

      membership = memberData;

      if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    const updates = await request.json();

    // Only allow certain fields to be updated
    const allowedUpdates: any = {};
    if (updates.name) allowedUpdates.name = updates.name;
    if (updates.seats && (isSuperAdmin || membership?.role === 'OWNER')) allowedUpdates.seats = updates.seats;

    const { data: organization, error } = (await (supabase as any)
      .from('organizations')
      .update(allowedUpdates)
      .eq('id', orgId)
      .select()
      .single()) as { data: any; error: any };

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Update organization error:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
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

    // Check if user is super admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single() as { data: { is_super_admin: boolean } | null };

    const isSuperAdmin = userData?.is_super_admin || false;

    // Check if user is owner (skip for super admins)
    if (!isSuperAdmin) {
      const { data: membership } = (await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single()) as { data: any };

      if (!membership || membership.role !== 'OWNER') {
        return NextResponse.json({ error: 'Only owners can delete organizations' }, { status: 403 });
      }
    }

    // Use service role client for super admins to bypass RLS policies
    // Regular owners will still use their authenticated client
    const clientToUse = isSuperAdmin
      ? createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
      : supabase;

    // Delete organization (cascade will handle members)
    const { error } = await clientToUse
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (error) {
      console.error('Delete organization error:', {
        orgId,
        isSuperAdmin,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        errorCode: error.code,
      });
      return NextResponse.json({
        error: error.message || 'Failed to delete organization',
        details: error.details,
        hint: error.hint
      }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
