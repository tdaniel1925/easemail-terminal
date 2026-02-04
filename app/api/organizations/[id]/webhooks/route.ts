import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAuditLog } from '@/lib/audit-logs';

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

    const { id: orgId } = await params;

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

    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ webhooks: webhooks || [] });
  } catch (error) {
    console.error('Fetch webhooks error:', error);
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }
}

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
    const { name, url, events, secret } = await request.json();

    if (!name || !url || !events || events.length === 0) {
      return NextResponse.json(
        { error: 'Name, URL, and at least one event are required' },
        { status: 400 }
      );
    }

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

    const { data: webhook, error } = await (supabase
      .from('webhooks') as any)
      .insert({
        organization_id: orgId,
        name,
        url,
        events,
        secret: secret || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await createAuditLog({
      organizationId: orgId,
      userId: user.id,
      action: 'settings_changed',
      details: { type: 'webhook_created', webhook_id: webhook.id, name },
    });

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Create webhook error:', error);
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }
}
