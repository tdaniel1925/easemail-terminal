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

    const { id } = await params;
    const orgId = id;

    // Check if user is super admin OR a member with appropriate role
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    const isSuperAdmin = userData?.is_super_admin || false;

    // If not super admin, check membership and role
    if (!isSuperAdmin) {
      const { data: membership } = (await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single()) as { data: any };

      if (!membership) {
        return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
      }

      // Only OWNER and ADMIN roles can access organization dashboard
      if (membership.role === 'MEMBER') {
        return NextResponse.json(
          { error: 'Insufficient permissions. Only organization admins can access the dashboard.' },
          { status: 403 }
        );
      }
    }

    // Get organization details
    const { data: organization } = (await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()) as { data: any };

    // Get member count
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    // Get usage statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: usageData } = (await supabase
      .from('usage_tracking')
      .select('feature')
      .eq('organization_id', orgId)
      .gte('timestamp', thirtyDaysAgo.toISOString())) as { data: any };

    // Calculate usage by feature type
    const usage = {
      total_emails_sent: usageData?.filter((u: any) => u.feature === 'email_sent').length || 0,
      total_ai_requests: usageData?.filter((u: any) => ['ai_remix', 'ai_dictate'].includes(u.feature)).length || 0,
      total_calendar_events: usageData?.filter((u: any) => u.feature === 'calendar_event').length || 0,
      total_sms_sent: usageData?.filter((u: any) => u.feature === 'sms').length || 0,
    };

    // Get top users by usage
    const { data: topUsersData } = (await supabase
      .from('usage_tracking')
      .select('user_id, users!inner(email)')
      .eq('organization_id', orgId)
      .gte('timestamp', thirtyDaysAgo.toISOString())) as { data: any };

    // Aggregate by user
    const userUsageMap = new Map<string, { email: string; count: number }>();
    topUsersData?.forEach((item: any) => {
      const email = item.users?.email;
      if (email) {
        const current = userUsageMap.get(email) || { email, count: 0 };
        userUsageMap.set(email, { email, count: current.count + 1 });
      }
    });

    const topUsers = Array.from(userUsageMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(u => ({ email: u.email, usage_count: u.count }));

    // Get recent activity
    const { data: recentActivity } = (await supabase
      .from('usage_tracking')
      .select('feature, timestamp, user_id, users!inner(email)')
      .eq('organization_id', orgId)
      .order('timestamp', { ascending: false })
      .limit(10)) as { data: any };

    const formattedActivity = recentActivity?.map((activity: any) => ({
      type: activity.feature,
      description: getActivityDescription(activity.feature),
      timestamp: activity.timestamp,
      user_email: activity.users?.email || 'Unknown',
    })) || [];

    return NextResponse.json({
      organization: {
        ...organization,
        member_count: memberCount || 0,
      },
      usage,
      topUsers,
      recentActivity: formattedActivity,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}

function getActivityDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    email_sent: 'Sent an email',
    ai_remix: 'Used AI Remix',
    ai_dictate: 'Used AI Dictate',
    calendar_event: 'Created calendar event',
    sms: 'Sent SMS message',
    voice_message: 'Sent voice message',
    smart_compose: 'Used Smart Compose',
  };
  return descriptions[feature] || 'Performed action';
}
