import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orgId } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Check if user is super admin OR a member of the organization
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    const isSuperAdmin = userData?.is_super_admin || false;

    // If not super admin, check membership
    if (!isSuperAdmin) {
      const { data: membership } = (await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single()) as { data: any };

      if (!membership) {
        return NextResponse.json(
          { error: 'Not a member of this organization' },
          { status: 403 }
        );
      }
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get time-series usage data
    const { data: usageData } = (await supabase
      .from('usage_tracking')
      .select('feature, timestamp, user_id')
      .eq('organization_id', orgId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })) as { data: any };

    // Aggregate data by date and feature
    const dailyUsage: Record<string, Record<string, number>> = {};
    const featureUsage: Record<string, number> = {};
    const userActivity: Record<string, number> = {};

    usageData?.forEach((item: any) => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      const feature = item.feature;

      // Daily usage
      if (!dailyUsage[date]) {
        dailyUsage[date] = {};
      }
      dailyUsage[date][feature] = (dailyUsage[date][feature] || 0) + 1;

      // Feature totals
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;

      // User activity
      userActivity[item.user_id] = (userActivity[item.user_id] || 0) + 1;
    });

    // Convert to arrays for charts
    const timeSeriesData = Object.entries(dailyUsage).map(([date, features]) => ({
      date,
      ...features,
      total: Object.values(features).reduce((a: number, b: number) => a + b, 0),
    }));

    const featureBreakdown = Object.entries(featureUsage).map(([feature, count]) => ({
      feature,
      count,
    }));

    // Get organization info
    const { data: organization } = (await supabase
      .from('organizations')
      .select('name, plan, seats, mrr, arr')
      .eq('id', orgId)
      .single()) as { data: any };

    // Get member count
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    // Calculate growth metrics
    const halfwayDate = new Date(startDate);
    halfwayDate.setDate(halfwayDate.getDate() + Math.floor(days / 2));

    const firstHalfUsage = usageData?.filter((item: any) =>
      new Date(item.timestamp) < halfwayDate
    ).length || 0;

    const secondHalfUsage = usageData?.filter((item: any) =>
      new Date(item.timestamp) >= halfwayDate
    ).length || 0;

    const growthRate = firstHalfUsage > 0
      ? ((secondHalfUsage - firstHalfUsage) / firstHalfUsage) * 100
      : 0;

    return NextResponse.json({
      organization: {
        ...organization,
        member_count: memberCount || 0,
      },
      timeSeriesData,
      featureBreakdown,
      totals: {
        total_actions: usageData?.length || 0,
        unique_users: Object.keys(userActivity).length,
        growth_rate: Math.round(growthRate * 10) / 10,
      },
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    );
  }
}
