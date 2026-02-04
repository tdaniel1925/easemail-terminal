import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId, newCycle } = await request.json();

    if (!organizationId || !newCycle) {
      return NextResponse.json(
        { error: 'Organization ID and new cycle required' },
        { status: 400 }
      );
    }

    if (newCycle !== 'monthly' && newCycle !== 'annual') {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be monthly or annual' },
        { status: 400 }
      );
    }

    // Check if user is owner or admin
    const { data: membership } = (await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get organization stripe subscription ID
    const { data: organization } = (await supabase
      .from('organizations')
      .select('stripe_subscription_id, plan, billing_cycle')
      .eq('id', organizationId)
      .single()) as { data: any };

    if (!organization?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    if (organization.plan === 'FREE') {
      return NextResponse.json(
        { error: 'Cannot change billing cycle for free plan' },
        { status: 400 }
      );
    }

    if (organization.billing_cycle === newCycle) {
      return NextResponse.json(
        { error: `Already on ${newCycle} billing cycle` },
        { status: 400 }
      );
    }

    // Get the current subscription from Stripe
    const stripeClient = stripe();
    const subscription = await stripeClient.subscriptions.retrieve(
      organization.stripe_subscription_id
    );

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found in Stripe' },
        { status: 400 }
      );
    }

    // Get the price ID for the new billing cycle
    const currentPriceId = subscription.items.data[0].price.id;
    let newPriceId: string;

    // Determine new price ID based on plan and cycle
    if (organization.plan === 'PRO') {
      newPriceId = newCycle === 'annual'
        ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID || currentPriceId
        : process.env.STRIPE_PRO_PRICE_ID || currentPriceId;
    } else if (organization.plan === 'BUSINESS') {
      newPriceId = newCycle === 'annual'
        ? process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID || currentPriceId
        : process.env.STRIPE_BUSINESS_PRICE_ID || currentPriceId;
    } else {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Update the subscription in Stripe
    const updatedSubscription = await stripeClient.subscriptions.update(
      organization.stripe_subscription_id,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'always_invoice',
      }
    );

    // Update organization billing cycle in database
    const { error: updateError } = await (supabase
      .from('organizations') as any)
      .update({
        billing_cycle: newCycle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    if (updateError) {
      console.error('Failed to update organization:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: `Billing cycle changed to ${newCycle}`,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
      },
    });
  } catch (error) {
    console.error('Change billing cycle error:', error);
    return NextResponse.json(
      { error: 'Failed to change billing cycle' },
      { status: 500 }
    );
  }
}
