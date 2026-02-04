import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelSubscription } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
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
      .select('stripe_subscription_id, plan')
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
        { error: 'Already on free plan' },
        { status: 400 }
      );
    }

    // Cancel subscription in Stripe (at period end)
    await cancelSubscription(organization.stripe_subscription_id, false);

    // Update organization status
    const { error: updateError } = await (supabase
      .from('organizations') as any)
      .update({
        subscription_status: 'canceling',
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    if (updateError) {
      console.error('Failed to update organization:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully. Access will continue until the end of the billing period.',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
