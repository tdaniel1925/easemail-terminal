/**
 * GET /api/billing/individual/status
 *
 * Get the current subscription status for an individual user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSubscription } from '@/lib/paypal/subscriptions';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is beta user
    const { data: isBeta } = await supabase.rpc('is_beta_user', {
      user_id_param: user.id,
    } as any);

    if (isBeta) {
      return NextResponse.json({
        isBeta: true,
        subscriptionContext: 'beta',
        message: 'User is in beta mode - no billing required',
      });
    }

    // Get subscription context
    const { data: context } = await supabase.rpc('get_subscription_context', {
      user_id_param: user.id,
    } as any);

    // Get user data
    const { data: userData } = await supabase
      .from('users')
      .select('paypal_subscription_id, subscription_status, trial_ends_at, trial_started_at')
      .eq('id', user.id)
      .single();

    let paypalStatus = null;
    if ((userData as any)?.paypal_subscription_id) {
      try {
        paypalStatus = await getSubscription((userData as any).paypal_subscription_id);
      } catch (error) {
        console.error('Error fetching PayPal subscription:', error);
      }
    }

    return NextResponse.json({
      isBeta: false,
      subscriptionContext: context,
      localStatus: {
        subscriptionId: (userData as any)?.paypal_subscription_id,
        status: (userData as any)?.subscription_status,
        trialEndsAt: (userData as any)?.trial_ends_at,
        trialStartedAt: (userData as any)?.trial_started_at,
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
    console.error('Error getting subscription status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
