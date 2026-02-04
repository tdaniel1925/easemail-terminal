import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string; deliveryId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orgId, webhookId, deliveryId } = await params;

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

    // Get the delivery and webhook
    const { data: delivery } = (await supabase
      .from('webhook_deliveries')
      .select('*, webhooks!inner(id, url, secret, organization_id)')
      .eq('id', deliveryId)
      .eq('webhook_id', webhookId)
      .single()) as { data: any };

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    // Verify webhook belongs to organization
    if (delivery.webhooks.organization_id !== orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Attempt to resend the webhook
    try {
      const webhookUrl = delivery.webhooks.url;
      const secret = delivery.webhooks.secret;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (secret) {
        // In production, you'd generate a proper HMAC signature
        headers['X-Webhook-Secret'] = secret;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(delivery.payload),
      });

      const responseBody = await response.text();

      // Update the delivery record
      const { error: updateError } = await (supabase
        .from('webhook_deliveries') as any)
        .update({
          response_status: response.status,
          response_body: responseBody.slice(0, 5000), // Limit to 5000 chars
          delivered_at: response.ok ? new Date().toISOString() : null,
          retry_count: delivery.retry_count + 1,
          next_retry_at: null,
        })
        .eq('id', deliveryId);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Webhook delivered successfully' : 'Webhook delivery failed',
      });
    } catch (fetchError) {
      // Update delivery with error
      await (supabase
        .from('webhook_deliveries') as any)
        .update({
          response_status: 0,
          response_body: String(fetchError),
          retry_count: delivery.retry_count + 1,
        })
        .eq('id', deliveryId);

      return NextResponse.json({
        success: false,
        message: 'Failed to connect to webhook URL',
      });
    }
  } catch (error) {
    console.error('Retry webhook delivery error:', error);
    return NextResponse.json({ error: 'Failed to retry webhook delivery' }, { status: 500 });
  }
}
