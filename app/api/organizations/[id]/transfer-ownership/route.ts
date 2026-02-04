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

    const { id: orgId } = await params;
    const { newOwnerId } = await request.json();

    if (!newOwnerId) {
      return NextResponse.json({ error: 'New owner ID required' }, { status: 400 });
    }

    // Check if current user is the owner
    const { data: currentMembership } = (await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!currentMembership || currentMembership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only the owner can transfer ownership' },
        { status: 403 }
      );
    }

    // Check if new owner is a member
    const { data: newOwnerMembership } = (await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', newOwnerId)
      .single()) as { data: any };

    if (!newOwnerMembership) {
      return NextResponse.json(
        { error: 'New owner must be a member of the organization' },
        { status: 400 }
      );
    }

    if (newOwnerMembership.role === 'OWNER') {
      return NextResponse.json(
        { error: 'User is already the owner' },
        { status: 400 }
      );
    }

    // Update current owner to admin
    const { error: demoteError } = await (supabase
      .from('organization_members') as any)
      .update({ role: 'ADMIN' })
      .eq('organization_id', orgId)
      .eq('user_id', user.id);

    if (demoteError) {
      console.error('Failed to demote current owner:', demoteError);
      return NextResponse.json(
        { error: 'Failed to transfer ownership' },
        { status: 500 }
      );
    }

    // Update new owner
    const { error: promoteError } = await (supabase
      .from('organization_members') as any)
      .update({ role: 'OWNER' })
      .eq('organization_id', orgId)
      .eq('user_id', newOwnerId);

    if (promoteError) {
      console.error('Failed to promote new owner:', promoteError);
      // Rollback: restore current owner
      await (supabase
        .from('organization_members') as any)
        .update({ role: 'OWNER' })
        .eq('organization_id', orgId)
        .eq('user_id', user.id);

      return NextResponse.json(
        { error: 'Failed to transfer ownership' },
        { status: 500 }
      );
    }

    // Log the ownership transfer (if audit logs exist)
    try {
      await (supabase
        .from('audit_logs') as any)
        .insert({
          organization_id: orgId,
          user_id: user.id,
          action: 'transfer_ownership',
          details: {
            old_owner_id: user.id,
            new_owner_id: newOwnerId,
          },
          timestamp: new Date().toISOString(),
        });
    } catch (logError) {
      // Audit log is optional, don't fail the request
      console.error('Failed to create audit log:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Ownership transferred successfully',
    });
  } catch (error) {
    console.error('Transfer ownership error:', error);
    return NextResponse.json(
      { error: 'Failed to transfer ownership' },
      { status: 500 }
    );
  }
}
