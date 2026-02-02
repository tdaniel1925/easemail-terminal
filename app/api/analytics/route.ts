import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: any; error: any };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    // Get ALL organization details (super admins can see everything)
    const { data: organizations } = await supabase
      .from('organizations')
      .select('*');

    const orgIds = (organizations as any[])?.map((org: any) => org.id) || [];

    // Get usage stats for all organizations
    const usagePromises = orgIds.map(async (orgId) => {
      // Get members
      const { count: memberCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      // Get usage tracking
      const { data: usage } = await supabase
        .from('usage_tracking')
        .select('feature, created_at')
        .in('user_id', (
          await supabase
            .from('organization_members')
            .select('user_id')
            .eq('organization_id', orgId)
        ).data?.map((m: any) => m.user_id) || [])
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      // Count by feature
      const featureCounts = usage?.reduce((acc: any, item: any) => {
        acc[item.feature] = (acc[item.feature] || 0) + 1;
        return acc;
      }, {});

      // Count by day for time series
      const dailyUsage = usage?.reduce((acc: any, item: any) => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Get email accounts
      const { count: emailAccountCount } = await supabase
        .from('email_accounts')
        .select('*', { count: 'exact', head: true })
        .in('user_id', (
          await supabase
            .from('organization_members')
            .select('user_id')
            .eq('organization_id', orgId)
        ).data?.map((m: any) => m.user_id) || []);

      return {
        organizationId: orgId,
        memberCount: memberCount || 0,
        emailAccountCount: emailAccountCount || 0,
        featureUsage: featureCounts || {},
        totalUsage: usage?.length || 0,
        dailyUsage: dailyUsage || {},
      };
    });

    const usageStats = await Promise.all(usagePromises);

    // Combine daily usage across all organizations
    const combinedDailyUsage = usageStats.reduce((acc: any, stat) => {
      Object.entries(stat.dailyUsage).forEach(([date, count]) => {
        acc[date] = (acc[date] || 0) + (count as number);
      });
      return acc;
    }, {});

    // Create array of last 30 days with counts
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyUsageArray = last30Days.map(date => ({
      date,
      count: combinedDailyUsage[date] || 0,
      displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    // Plan distribution
    const planDistribution = organizations?.reduce((acc: any, org: any) => {
      acc[org.plan] = (acc[org.plan] || 0) + 1;
      return acc;
    }, {});

    // Aggregate analytics
    const analytics = {
      organizations: organizations?.map((org: any, index) => ({
        ...org,
        stats: usageStats[index],
      })),
      totalMembers: usageStats.reduce((sum, s) => sum + s.memberCount, 0),
      totalEmailAccounts: usageStats.reduce((sum, s) => sum + s.emailAccountCount, 0),
      totalUsage: usageStats.reduce((sum, s) => sum + s.totalUsage, 0),
      featureBreakdown: usageStats.reduce((acc: any, stat) => {
        Object.entries(stat.featureUsage).forEach(([feature, count]) => {
          acc[feature] = (acc[feature] || 0) + (count as number);
        });
        return acc;
      }, {}),
      dailyUsage: dailyUsageArray,
      planDistribution: planDistribution || {},
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
