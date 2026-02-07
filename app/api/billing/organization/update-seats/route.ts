/**
 * POST /api/billing/organization/update-seats
 *
 * Update organization seat count
 * This cancels the old subscription and creates a new one with the new seat count
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateOrganizationSeats } from '@/lib/paypal/subscriptions';

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

    // Verify user is admin of this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!membership || (membership as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Only organization admins can update subscriptions' },
        { status: 403 }
      );
    }

    // Get current organization data
    const { data: orgData } = await supabase
      .from('organizations')
      .select('seats, seats_used')
      .eq('id', organizationId)
      .single();

    if (!orgData) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Ensure new seat count is not less than seats currently in use
    if (seats < ((orgData as any).seats_used || 0)) {
      return NextResponse.json(
        {
          error: `Cannot reduce seats below current usage. Currently using ${(orgData as any).seats_used} seats.`,
        },
        { status: 400 }
      );
    }

    // Update seats
    const subscription = await updateOrganizationSeats(organizationId, seats);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.subscriptionId,
      approvalUrl: subscription.approvalUrl,
      status: subscription.status,
      seats,
      message: 'Please visit the approval URL to approve the updated subscription',
    });
  } catch (error: any) {
    console.error('Error updating organization seats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update seats' },
      { status: 500 }
    );
  }
}
