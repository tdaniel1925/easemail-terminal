// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Check if user is admin or owner
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { additional_seats } = await request.json();

    if (!additional_seats || additional_seats < 1) {
      return NextResponse.json(
        { error: 'Additional seats must be at least 1' },
        { status: 400 }
      );
    }

    // Get current organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('seats, plan, billing_cycle, mrr')
      .eq('id', membership.organization_id)
      .single();

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Calculate new seat count
    const newSeats = org.seats + additional_seats;

    // Calculate new MRR based on pricing tiers
    let newMrr = 0;
    if (org.plan !== 'FREE') {
      if (newSeats === 1) {
        newMrr = 30;
      } else if (newSeats >= 2 && newSeats <= 10) {
        newMrr = newSeats * 25;
      } else if (newSeats >= 11) {
        newMrr = newSeats * 20;
      }
    }

    // Calculate new ARR
    const newArr = org.billing_cycle === 'annual' ? newMrr * 10 : newMrr * 12;

    // Update organization
    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update({
        seats: newSeats,
        mrr: newMrr,
        arr: newArr,
      })
      .eq('id', membership.organization_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log billing event
    await supabase.from('billing_history').insert({
      organization_id: membership.organization_id,
      event_type: 'seat_added',
      old_value: {
        seats: org.seats,
        mrr: org.mrr,
      },
      new_value: {
        seats: newSeats,
        mrr: newMrr,
      },
      amount: newMrr - org.mrr,
      triggered_by: user.id,
    });

    // Revalidate organization pages to reflect updated seat count
    revalidatePath('/app/organization');
    revalidatePath('/app/settings/billing');

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      message: `Successfully added ${additional_seats} seat(s)`,
    });
  } catch (error) {
    console.error('Error adding seats:', error);
    return NextResponse.json(
      { error: 'Failed to add seats' },
      { status: 500 }
    );
  }
}
