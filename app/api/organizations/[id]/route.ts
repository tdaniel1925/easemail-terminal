import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Check if user is a member
    const { data: membership } = (await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    // Get organization details
    const { data: organization } = (await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()) as { data: any };

    // Get all members
    const { data: members } = (await supabase
      .from('organization_members')
      .select('*, users:user_id(email)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true })) as { data: any };

    return NextResponse.json({
      organization,
      members,
      currentUserRole: membership.role,
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

    const updates = await request.json();

    // Only allow certain fields to be updated
    const allowedUpdates: any = {};
    if (updates.name) allowedUpdates.name = updates.name;
    if (updates.seats && membership.role === 'OWNER') allowedUpdates.seats = updates.seats;

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

    // Check if user is owner
    const { data: membership } = (await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can delete organizations' }, { status: 403 });
    }

    // Delete organization (cascade will handle members)
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
