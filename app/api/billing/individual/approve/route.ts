/**
 * POST /api/billing/individual/approve
 *
 * Approve and activate an individual subscription after user returns from PayPal
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { approveSubscription } from '@/lib/paypal/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, subscriberId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId is required' },
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

    // Verify this subscription belongs to this user
    const { data: userData } = await supabase
      .from('users')
      .select('paypal_subscription_id')
      .eq('id', user.id)
      .single();

    if (userData?.paypal_subscription_id !== subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription does not belong to this user' },
        { status: 403 }
      );
    }

    // Approve subscription
    await approveSubscription(subscriptionId, subscriberId);

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
    });
  } catch (error: any) {
    console.error('Error approving subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve subscription' },
      { status: 500 }
    );
  }
}
