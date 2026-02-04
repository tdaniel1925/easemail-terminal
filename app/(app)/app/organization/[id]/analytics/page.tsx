'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Loader2, Download, Users, Activity } from 'lucide-react';
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

interface AnalyticsData {
  organization: {
    name: string;
    plan: string;
    seats: number;
    mrr: number;
    arr: number;
    member_count: number;
  };
  timeSeriesData: Array<{
    date: string;
    total: number;
    [key: string]: any;
  }>;
  featureBreakdown: Array<{
    feature: string;
    count: number;
  }>;
  totals: {
    total_actions: number;
    unique_users: number;
    growth_rate: number;
  };
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'];

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    if (orgId) {
      fetchAnalytics();
    }
  }, [orgId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${orgId}/analytics?days=${timeRange}`);
      const responseData = await response.json();

      if (response.ok) {
        setData(responseData);
      } else {
        toast.error(responseData.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!data) return;

    const csv = [
      ['Date', 'Total Actions', ...data.featureBreakdown.map(f => f.feature)].join(','),
      ...data.timeSeriesData.map(day => [
        day.date,
        day.total,
        ...data.featureBreakdown.map(f => day[f.feature] || 0),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString()}.csv`;
    a.click();
  };

  const formatFeatureName = (feature: string) => {
    return feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

  if (!data) return null;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/app/organization/${orgId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">{data.organization.name}</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 60 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportData}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.total_actions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.unique_users}</div>
            <p className="text-xs text-muted-foreground">
              out of {data.organization.member_count} members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            {data.totals.growth_rate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.totals.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.totals.growth_rate > 0 ? '+' : ''}{data.totals.growth_rate}%
            </div>
            <p className="text-xs text-muted-foreground">vs previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily Actions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.totals.total_actions / parseInt(timeRange))}
            </div>
            <p className="text-xs text-muted-foreground">per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Over Time Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Activity Over Time</CardTitle>
          <CardDescription>Daily usage trends for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Actions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Feature Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage Breakdown</CardTitle>
            <CardDescription>Distribution of actions by feature type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.featureBreakdown}
                  dataKey="count"
                  nameKey="feature"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => formatFeatureName(entry.feature)}
                >
                  {data.featureBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>Total usage count by feature</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.featureBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="feature"
                  tickFormatter={formatFeatureName}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip labelFormatter={(label: any) => formatFeatureName(String(label))} />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-lg font-semibold">{data.organization.plan}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seats</p>
              <p className="text-lg font-semibold">{data.organization.seats}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-lg font-semibold">${data.organization.mrr.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
