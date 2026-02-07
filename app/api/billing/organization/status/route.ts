/**
 * GET /api/billing/organization/status
 *
 * Get the current subscription status for an organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSubscription } from '@/lib/paypal/subscriptions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

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

    // Verify user is member of this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this organization' },
        { status: 403 }
      );
    }

    // Check if in beta mode
    const { data: betaMode } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'beta_mode')
      .single();

    if ((betaMode as any)?.value?.enabled) {
      return NextResponse.json({
        isBeta: true,
        message: 'Organization is in beta mode - no billing required',
      });
    }

    // Get organization data
    const { data: orgData } = await supabase
      .from('organizations')
      .select('paypal_subscription_id, paypal_subscriber_id, seats, seats_used, trial_ends_at, trial_started_at')
      .eq('id', organizationId)
      .single();

    let paypalStatus = null;
    if ((orgData as any)?.paypal_subscription_id) {
      try {
        paypalStatus = await getSubscription((orgData as any).paypal_subscription_id);
      } catch (error) {
        console.error('Error fetching PayPal subscription:', error);
      }
    }

    return NextResponse.json({
      isBeta: false,
      isAdmin: (membership as any).role === 'admin',
      localStatus: {
        subscriptionId: (orgData as any)?.paypal_subscription_id,
        subscriberId: (orgData as any)?.paypal_subscriber_id,
        seats: (orgData as any)?.seats,
        seatsUsed: (orgData as any)?.seats_used,
        trialEndsAt: (orgData as any)?.trial_ends_at,
        trialStartedAt: (orgData as any)?.trial_started_at,
      },
      paypalStatus: paypalStatus
        ? {
            id: paypalStatus.id,
            status: paypalStatus.status,
            nextBillingTime: paypalStatus.billingInfo?.nextBillingTime,
            lastPaymentAmount: paypalStatus.billingInfo?.lastPayment?.amount,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error getting organization subscription status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
