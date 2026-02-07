/**
 * POST /api/billing/organization/cancel
 *
 * Cancel an organization subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelSubscription } from '@/lib/paypal/subscriptions';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, reason } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin of this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only organization admins can cancel subscriptions' },
        { status: 403 }
      );
    }

    // Get organization's subscription
    const { data: orgData } = await supabase
      .from('organizations')
      .select('paypal_subscription_id')
      .eq('id', organizationId)
      .single();

    if (!orgData?.paypal_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel with PayPal
    await cancelSubscription(orgData.paypal_subscription_id, reason);

    // Update database with service client
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await serviceClient
      .from('organizations')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    return NextResponse.json({
      success: true,
      message: 'Organization subscription cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling organization subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
