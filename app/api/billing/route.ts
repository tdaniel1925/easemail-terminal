import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization membership
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      // User has no organization, return free plan
      return NextResponse.json({
        billing: {
          plan: 'Free',
          seats: 1,
          seats_used: 1,
          billing_cycle: 'monthly',
          next_billing_date: null,
          amount: 0,
        },
      });
    }

    // Get organization billing info
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', membership.organization_id)
      .single();

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Calculate amount based on plan
    const planPrices: { [key: string]: number } = {
      FREE: 0,
      PRO: 12,
      BUSINESS: 25,
      ENTERPRISE: 0, // Custom pricing
    };

    const basePrice = planPrices[organization.plan] || 0;
    const amount = organization.plan === 'BUSINESS'
      ? basePrice * organization.seats
      : basePrice;

    return NextResponse.json({
      billing: {
        plan: organization.plan,
        seats: organization.seats,
        seats_used: organization.seats_used,
        billing_cycle: 'monthly',
        next_billing_date: organization.subscription_end_date,
        amount,
      },
    });
  } catch (error) {
    console.error('Get billing info error:', error);
    return NextResponse.json(
      { error: 'Failed to get billing info' },
      { status: 500 }
    );
  }
}
