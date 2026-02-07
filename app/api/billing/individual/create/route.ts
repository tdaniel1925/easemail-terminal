/**
 * POST /api/billing/individual/create
 *
 * Create a new individual subscription for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createIndividualSubscription } from '@/lib/paypal/subscriptions';

export async function POST(request: NextRequest) {
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

    // Check if user can have individual subscription
    const { data: canHave } = await supabase.rpc('can_have_individual_subscription', {
      user_id_param: user.id,
    } as any);

    if (!canHave) {
      return NextResponse.json(
        {
          error:
            'You are a member of an organization. Individual subscriptions are not available for organization members.',
        },
        { status: 400 }
      );
    }

    // Check if user already has a subscription
    const { data: userData } = await supabase
      .from('users')
      .select('paypal_subscription_id, subscription_status')
      .eq('id', user.id)
      .single();

    if ((userData as any)?.paypal_subscription_id) {
      return NextResponse.json(
        {
          error: 'You already have an active subscription',
          subscriptionId: (userData as any).paypal_subscription_id,
          status: (userData as any).subscription_status,
        },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await createIndividualSubscription(user.id);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.subscriptionId,
      approvalUrl: subscription.approvalUrl,
      status: subscription.status,
      message: 'Please visit the approval URL to complete your subscription',
    });
  } catch (error: any) {
    console.error('Error creating individual subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
