/**
 * POST /api/billing/organization/create
 *
 * Create a new organization subscription
 * Only organization admins can create subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrganizationSubscription } from '@/lib/paypal/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, seats } = body;

    if (!organizationId || !seats) {
      return NextResponse.json(
        { error: 'organizationId and seats are required' },
        { status: 400 }
      );
    }

    if (seats < 2) {
      return NextResponse.json(
        { error: 'Organization must have at least 2 seats' },
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

    // Check if in beta mode (no billing required)
    const { data: betaMode } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'beta_mode')
      .single();

    if ((betaMode as any)?.value?.enabled) {
      return NextResponse.json(
        { error: 'Billing is not active during beta mode' },
        { status: 400 }
      );
    }

    // Verify user is admin of this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!membership || (membership as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Only organization admins can create subscriptions' },
        { status: 403 }
      );
    }

    // Check if organization already has a subscription
    const { data: orgData } = await supabase
      .from('organizations')
      .select('paypal_subscription_id')
      .eq('id', organizationId)
      .single();

    if ((orgData as any)?.paypal_subscription_id) {
      return NextResponse.json(
        {
          error: 'Organization already has an active subscription',
          subscriptionId: (orgData as any).paypal_subscription_id,
        },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await createOrganizationSubscription(organizationId, seats);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.subscriptionId,
      approvalUrl: subscription.approvalUrl,
      status: subscription.status,
      seats,
      message: 'Please visit the approval URL to complete your subscription',
    });
  } catch (error: any) {
    console.error('Error creating organization subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
