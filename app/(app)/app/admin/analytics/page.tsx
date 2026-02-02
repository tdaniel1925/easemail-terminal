'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

interface Analytics {
  organizations: any[];
  totalMembers: number;
  totalEmailAccounts: number;
  totalUsage: number;
  featureBreakdown: Record<string, number>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
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
    };
    return labels[feature] || feature;
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Usage insights and organization metrics</p>
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

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
        </TabsList>

        {/* Feature Usage Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Breakdown</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
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

                {Object.keys(analytics.featureBreakdown).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No feature usage data yet
                  </div>
                )}
              </div>
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
