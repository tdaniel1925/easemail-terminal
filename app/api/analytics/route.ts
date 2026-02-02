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

    // Fetch all data upfront to avoid N+1 queries (3 queries instead of 5*N queries)
    const [
      { data: allMembers },
      { data: allUsage },
      { data: allEmailAccounts }
    ] = await Promise.all([
      // Query 1: Get all organization members
      supabase
        .from('organization_members')
        .select('organization_id, user_id')
        .in('organization_id', orgIds),

      // Query 2: Get all usage tracking for last 30 days
      supabase
        .from('usage_tracking')
        .select('user_id, feature, timestamp')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

      // Query 3: Get all email accounts
      supabase
        .from('email_accounts')
        .select('user_id')
    ]);

    // Group members by organization
    const membersByOrg = (allMembers || []).reduce((acc: any, member: any) => {
      if (!acc[member.organization_id]) {
        acc[member.organization_id] = [];
      }
      acc[member.organization_id].push(member.user_id);
      return acc;
    }, {});

    // Create user ID to org ID mapping for usage data
    const userToOrgMap = (allMembers || []).reduce((acc: any, member: any) => {
      acc[member.user_id] = member.organization_id;
      return acc;
    }, {});

    // Group usage by organization
    const usageByOrg = (allUsage || []).reduce((acc: any, usage: any) => {
      const orgId = userToOrgMap[usage.user_id];
      if (orgId) {
        if (!acc[orgId]) {
          acc[orgId] = [];
        }
        acc[orgId].push(usage);
      }
      return acc;
    }, {});

    // Group email accounts by organization
    const emailAccountsByOrg = (allEmailAccounts || []).reduce((acc: any, account: any) => {
      const orgId = userToOrgMap[account.user_id];
      if (orgId) {
        acc[orgId] = (acc[orgId] || 0) + 1;
      }
      return acc;
    }, {});

    // Calculate stats for each organization (in memory, no more queries)
    const usageStats = orgIds.map((orgId) => {
      const members = membersByOrg[orgId] || [];
      const usage = usageByOrg[orgId] || [];

      // Count by feature
      const featureCounts = usage.reduce((acc: any, item: any) => {
        acc[item.feature] = (acc[item.feature] || 0) + 1;
        return acc;
      }, {});

      // Count by day for time series
      const dailyUsage = usage.reduce((acc: any, item: any) => {
        const date = new Date(item.timestamp).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return {
        organizationId: orgId,
        memberCount: members.length,
        emailAccountCount: emailAccountsByOrg[orgId] || 0,
        featureUsage: featureCounts,
        totalUsage: usage.length,
        dailyUsage: dailyUsage,
      };
    });

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
