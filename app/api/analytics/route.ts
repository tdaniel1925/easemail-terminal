import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin of any organization
    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .in('role', ['OWNER', 'ADMIN']);

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const orgIds = memberships.map(m => m.organization_id);

    // Get organization details
    const { data: organizations } = await supabase
      .from('organizations')
      .select('*')
      .in('id', orgIds);

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
        ).data?.map(m => m.user_id) || [])
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      // Count by feature
      const featureCounts = usage?.reduce((acc: any, item) => {
        acc[item.feature] = (acc[item.feature] || 0) + 1;
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
        ).data?.map(m => m.user_id) || []);

      return {
        organizationId: orgId,
        memberCount: memberCount || 0,
        emailAccountCount: emailAccountCount || 0,
        featureUsage: featureCounts || {},
        totalUsage: usage?.length || 0,
      };
    });

    const usageStats = await Promise.all(usagePromises);

    // Aggregate analytics
    const analytics = {
      organizations: organizations?.map((org, index) => ({
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
