import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAuditLog } from '@/lib/audit-logs';
import { sendEmail } from '@/lib/resend';
import { getOrgOwnershipTransferNewOwnerEmailHtml, getOrgOwnershipTransferPreviousOwnerEmailHtml } from '@/lib/email-templates';

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

    // Get organization details
    const { data: organization } = (await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()) as { data: any };

    // Get current owner details
    const { data: currentOwnerData } = (await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()) as { data: any };

    // Check if new owner is a member and get their details
    const { data: newOwnerMembership } = (await supabase
      .from('organization_members')
      .select('role, users:user_id(email, name)')
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

    // Log the ownership transfer
    await createAuditLog({
      organizationId: orgId,
      userId: user.id,
      action: 'transfer_ownership',
      details: {
        old_owner_id: user.id,
        new_owner_id: newOwnerId,
      },
    });

    // Send email to new owner
    if (newOwnerMembership?.users?.email) {
      try {
        const newOwnerHtml = getOrgOwnershipTransferNewOwnerEmailHtml({
          userName: newOwnerMembership.users.name || newOwnerMembership.users.email.split('@')[0],
          organizationName: organization?.name || 'Organization',
          organizationId: orgId,
          previousOwnerName: currentOwnerData?.name || currentOwnerData?.email || 'Previous Owner',
        });

        await sendEmail({
          to: newOwnerMembership.users.email,
          subject: `You're now the owner of ${organization?.name || 'Organization'}`,
          html: newOwnerHtml,
        });
      } catch (emailError) {
        console.error('Failed to send new owner email:', emailError);
      }
    }

    // Send email to previous owner (now admin)
    if (currentOwnerData?.email) {
      try {
        const previousOwnerHtml = getOrgOwnershipTransferPreviousOwnerEmailHtml({
          userName: currentOwnerData.name || currentOwnerData.email.split('@')[0],
          organizationName: organization?.name || 'Organization',
          organizationId: orgId,
          newOwnerName: newOwnerMembership?.users?.name || newOwnerMembership?.users?.email || 'New Owner',
        });

        await sendEmail({
          to: currentOwnerData.email,
          subject: `Ownership transfer confirmed for ${organization?.name || 'Organization'}`,
          html: previousOwnerHtml,
        });
      } catch (emailError) {
        console.error('Failed to send previous owner email:', emailError);
      }
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
