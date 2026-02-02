import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId, plan, seats } = await request.json();

    if (!organizationId || !plan) {
      return NextResponse.json(
        { error: 'Organization ID and plan are required' },
        { status: 400 }
      );
    }

    // Verify user is owner or admin of the organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      organizationId,
      plan,
      seats: plan === 'BUSINESS' ? seats || 5 : 1,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/organization/${organizationId}?checkout=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/billing?checkout=cancelled`,
      customerEmail: user.email!,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
