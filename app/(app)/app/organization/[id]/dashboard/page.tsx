'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  Mail,
  Calendar,
  TrendingUp,
  Activity,
  Loader2,
  Crown,
  BarChart3,
  Clock,
  Zap,
} from 'lucide-react';

interface DashboardStats {
  organization: {
    id: string;
    name: string;
    plan: string;
    seats: number;
    seats_used: number;
    member_count: number;
  };
  usage: {
    total_emails_sent: number;
    total_ai_requests: number;
    total_calendar_events: number;
    total_sms_sent: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    user_email: string;
  }>;
  topUsers: Array<{
    email: string;
    usage_count: number;
  }>;
}

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (orgId) {
      fetchDashboard();
    }
  }, [orgId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${orgId}/dashboard`);
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      } else {
        toast.error(data.error || 'Failed to load dashboard');
        router.push('/app/organization');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      toast.error('Failed to load dashboard');
      router.push('/app/organization');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/app/organization/${orgId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {stats.organization.name}
            <Badge>{stats.organization.plan}</Badge>
          </h1>
          <p className="text-muted-foreground">Organization Dashboard</p>
        </div>
        <Button onClick={() => router.push(`/app/organization/${orgId}`)}>
          Manage Organization
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.organization.member_count}</div>
            <p className="text-xs text-muted-foreground">
              {stats.organization.seats_used} / {stats.organization.seats} seats used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usage.total_emails_sent}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usage.total_ai_requests}</div>
            <p className="text-xs text-muted-foreground">Remix & Dictate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calendar Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usage.total_calendar_events}</div>
            <p className="text-xs text-muted-foreground">Created this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Active Users
            </CardTitle>
            <CardDescription>Most active members in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topUsers.length > 0 ? (
                stats.topUsers.map((user, index) => (
                  <div key={user.email} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.usage_count} actions
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{user.usage_count}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No usage data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted flex-shrink-0">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user_email} • {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common organization management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push(`/app/organization/${orgId}`)}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Members
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push('/app/settings/billing')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Billing
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push(`/app/organization/${orgId}`)}
            >
              <Crown className="mr-2 h-4 w-4" />
              Organization Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
