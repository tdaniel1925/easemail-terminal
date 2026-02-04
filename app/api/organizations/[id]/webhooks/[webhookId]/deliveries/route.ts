import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
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

    // Verify webhook belongs to organization
    const { data: webhook } = await supabase
      .from('webhooks')
      .select('id')
      .eq('id', webhookId)
      .eq('organization_id', orgId)
      .single();

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // 'success', 'failed', 'pending'
    const eventType = searchParams.get('event_type');

    // Build query
    let query = supabase
      .from('webhook_deliveries')
      .select('*', { count: 'exact' })
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status === 'success') {
      query = query.gte('response_status', 200).lt('response_status', 300);
    } else if (status === 'failed') {
      query = query.or('response_status.is.null,response_status.gte.400');
    } else if (status === 'pending') {
      query = query.not('next_retry_at', 'is', null);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: deliveries, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      deliveries: deliveries || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Fetch webhook deliveries error:', error);
    return NextResponse.json({ error: 'Failed to fetch webhook deliveries' }, { status: 500 });
  }
}
