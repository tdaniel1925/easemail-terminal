import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAuditLog } from '@/lib/audit-logs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orgId, webhookId } = await params;

    // Check permissions
    const { data: membership } = (await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId)
      .eq('organization_id', orgId);

    if (error) {
      throw error;
    }

    await createAuditLog({
      organizationId: orgId,
      userId: user.id,
      action: 'settings_changed',
      details: { type: 'webhook_deleted', webhook_id: webhookId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete webhook error:', error);
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orgId, webhookId } = await params;
    const { name, url, events, secret, is_active } = await request.json();

    // Check permissions
    const { data: membership } = (await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (events !== undefined) updateData.events = events;
    if (secret !== undefined) updateData.secret = secret;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: webhook, error } = await (supabase
      .from('webhooks') as any)
      .update(updateData)
      .eq('id', webhookId)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await createAuditLog({
      organizationId: orgId,
      userId: user.id,
      action: 'settings_changed',
      details: { type: 'webhook_updated', webhook_id: webhookId },
    });

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Update webhook error:', error);
    return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
  }
}
