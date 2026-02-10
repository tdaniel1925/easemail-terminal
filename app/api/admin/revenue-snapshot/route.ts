// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// This endpoint creates a monthly snapshot of revenue data
// Should be called via cron job or manually at the end of each month
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user and verify super admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create service client for super admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = (await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 });
    }

    // Get current month (first day)
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStr = currentMonth.toISOString().split('T')[0];

    // Fetch all organizations using service client
    const { data: organizations, error: orgsError} = await serviceClient
      .from('organizations')
      .select('*');

    if (orgsError) throw orgsError;

    // Calculate metrics
    const totalMRR = organizations?.reduce((sum: number, org: any) => sum + (org.mrr || 0), 0) || 0;
    const totalARR = organizations?.reduce((sum: number, org: any) => sum + (org.arr || 0), 0) || 0;
    const activeSubscriptions = organizations?.filter((org: any) => org.plan !== 'FREE').length || 0;

    // Get plan distribution
    const planDist: Record<string, number> = {};
    organizations?.forEach((org: any) => {
      planDist[org.plan] = (planDist[org.plan] || 0) + 1;
    });

    // Get previous month's data to calculate new/churned subscriptions
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = prevMonth.toISOString().split('T')[0];

    const { data: prevData } = (await serviceClient
      .from('revenue_history')
      .select('*')
      .eq('month', prevMonthStr)
      .single()) as { data: { active_subscriptions: number } | null };

    const prevActiveSubscriptions = prevData?.active_subscriptions || 0;
    const newSubscriptions = Math.max(0, activeSubscriptions - prevActiveSubscriptions);
    const churnedSubscriptions = Math.max(0, prevActiveSubscriptions - activeSubscriptions);

    // Upsert the snapshot (update if exists for this month, insert if not) using service client
    const { data: snapshot, error: snapshotError } = (await serviceClient
      .from('revenue_history')
      .upsert(
        {
          month: monthStr,
          total_mrr: totalMRR,
          total_arr: totalARR,
          active_subscriptions: activeSubscriptions,
          new_subscriptions: newSubscriptions,
          churned_subscriptions: churnedSubscriptions,
          plan_distribution: planDist,
        },
        {
          onConflict: 'month',
        }
      )
      .select()
      .single()) as { data: any; error: any };

    if (snapshotError) throw snapshotError;

    return NextResponse.json({
      success: true,
      snapshot,
      message: `Revenue snapshot created for ${monthStr}`,
    });
  } catch (error) {
    console.error('Error creating revenue snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create revenue snapshot' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve revenue history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user and verify super admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create service client for super admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = (await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 });
    }

    // Get last 12 months of history using service client
    const { data: history, error } = await serviceClient
      .from('revenue_history')
      .select('*')
      .order('month', { ascending: false })
      .limit(12);

    if (error) throw error;

    return NextResponse.json({ snapshots: history || [] });
  } catch (error) {
    console.error('Error fetching revenue history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue history' },
      { status: 500 }
    );
  }
}
