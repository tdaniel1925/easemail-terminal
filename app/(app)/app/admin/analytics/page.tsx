'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Users,
  Mail,
  TrendingUp,
  Activity,
  Sparkles,
  Calendar,
  Loader2,
  Download,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyUsage {
  date: string;
  count: number;
  displayDate: string;
}

interface Analytics {
  organizations: any[];
  totalMembers: number;
  totalEmailAccounts: number;
  totalUsage: number;
  featureBreakdown: Record<string, number>;
  dailyUsage: DailyUsage[];
  planDistribution: Record<string, number>;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh analytics every 60 seconds
    const refreshInterval = setInterval(() => {
      fetchAnalytics(false); // Silent refresh without loading state
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  const fetchAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch('/api/analytics');
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'ai_remix':
        return Sparkles;
      case 'ai_dictate':
        return Sparkles;
      case 'email_sent':
        return Mail;
      case 'calendar_event':
        return Calendar;
      case 'email_categorization':
        return Activity;
      default:
        return Activity;
    }
  };

  const getFeatureLabel = (feature: string) => {
    const labels: Record<string, string> = {
      ai_remix: 'AI Remix',
      ai_dictate: 'AI Dictate',
      email_sent: 'Emails Sent',
      calendar_event: 'Calendar Events',
      email_categorization: 'Email Categorization',
      sms_sent: 'SMS Sent',
    };
    return labels[feature] || feature;
  };

  const exportToCSV = () => {
    if (!analytics) return;

    const csvRows = [
      ['EaseMail Analytics Report', new Date().toLocaleDateString()],
      [],
      ['Overview'],
      ['Total Members', analytics.totalMembers],
      ['Total Email Accounts', analytics.totalEmailAccounts],
      ['Total Usage (30 days)', analytics.totalUsage],
      [],
      ['Feature Breakdown'],
      ['Feature', 'Count', 'Percentage'],
      ...Object.entries(analytics.featureBreakdown).map(([feature, count]) => [
        getFeatureLabel(feature),
        count,
        `${((count / analytics.totalUsage) * 100).toFixed(2)}%`,
      ]),
      [],
      ['Daily Usage'],
      ['Date', 'Count'],
      ...analytics.dailyUsage.map(d => [d.displayDate, d.count]),
      [],
      ['Organizations'],
      ['Name', 'Plan', 'Members', 'Email Accounts', 'Usage'],
      ...analytics.organizations.map(org => [
        org.name,
        org.plan,
        org.stats?.memberCount || 0,
        org.stats?.emailAccountCount || 0,
        org.stats?.totalUsage || 0,
      ]),
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  if (!analytics) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Analytics Available</h3>
            <p className="text-sm text-muted-foreground">
              You need admin access to view analytics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Usage insights and organization metrics</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {analytics.organizations.length} organization
              {analytics.organizations.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalEmailAccounts}</div>
            <p className="text-xs text-muted-foreground mt-1">Connected accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Events last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Avg per Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.totalMembers > 0
                ? Math.round(analytics.totalUsage / analytics.totalMembers)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Events per member</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Usage Trends
          </TabsTrigger>
          <TabsTrigger value="features">
            <BarChart3 className="h-4 w-4 mr-2" />
            Feature Usage
          </TabsTrigger>
          <TabsTrigger value="plans">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="organizations">
            <Users className="h-4 w-4 mr-2" />
            Organizations
          </TabsTrigger>
        </TabsList>

        {/* Usage Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>Daily usage over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="displayDate"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Usage Events"
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Usage Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Breakdown</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(analytics.featureBreakdown).length > 0 ? (
                <>
                  {/* Bar Chart */}
                  <div className="h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(analytics.featureBreakdown)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([feature, count]) => ({
                            name: getFeatureLabel(feature),
                            count: count,
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="name"
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" name="Usage Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="space-y-4">
                    {Object.entries(analytics.featureBreakdown)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([feature, count]) => {
                        const Icon = getFeatureIcon(feature);
                        const percentage =
                          analytics.totalUsage > 0
                            ? ((count as number) / analytics.totalUsage) * 100
                            : 0;

                        return (
                          <div key={feature} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{getFeatureLabel(feature)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">
                                  {percentage.toFixed(1)}%
                                </span>
                                <Badge variant="secondary">{count.toLocaleString()}</Badge>
                              </div>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No feature usage data yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>Organizations by plan type</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(analytics.planDistribution).length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(analytics.planDistribution).map(
                            ([plan, count], index) => ({
                              name: plan,
                              value: count,
                              fill: CHART_COLORS[index % CHART_COLORS.length],
                            })
                          )}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${((percent || 0) * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          dataKey="value"
                        >
                          {Object.entries(analytics.planDistribution).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(analytics.planDistribution)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([plan, count], index) => {
                        const total = Object.values(analytics.planDistribution).reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percentage = ((count as number) / total) * 100;

                        return (
                          <div
                            key={plan}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                                }}
                              />
                              <div>
                                <div className="font-medium">{plan}</div>
                                <div className="text-sm text-muted-foreground">
                                  {percentage.toFixed(1)}% of organizations
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-lg">
                              {count.toLocaleString()}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No plan data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-4">
          {analytics.organizations.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge>{org.plan}</Badge>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Seats</div>
                    <div className="text-lg font-semibold">
                      {org.seats_used} / {org.seats}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Members</div>
                    <div className="text-2xl font-bold">{org.stats?.memberCount || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email Accounts</div>
                    <div className="text-2xl font-bold">
                      {org.stats?.emailAccountCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Usage</div>
                    <div className="text-2xl font-bold">
                      {org.stats?.totalUsage?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg per Member</div>
                    <div className="text-2xl font-bold">
                      {org.stats?.memberCount > 0
                        ? Math.round(org.stats.totalUsage / org.stats.memberCount)
                        : 0}
                    </div>
                  </div>
                </div>

                {org.stats?.featureUsage &&
                  Object.keys(org.stats.featureUsage).length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm font-medium mb-3">Top Features</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(org.stats.featureUsage)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 5)
                          .map(([feature, count]) => (
                            <Badge key={feature} variant="outline">
                              {getFeatureLabel(feature)}: {count as number}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
