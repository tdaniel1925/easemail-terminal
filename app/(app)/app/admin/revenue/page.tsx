'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
  Users,
  Target,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  plan: string;
  seats: number;
  mrr: number;
  arr: number;
  billing_cycle: string;
  member_count: number;
}

interface RevenueMetrics {
  totalMRR: number;
  totalARR: number;
  mrrGrowth: number;
  arrGrowth: number;
  avgRevenuePerOrg: number;
  avgSeatsPerOrg: number;
  planDistribution: Record<string, number>;
  topOrganizations: Organization[];
}

export default function AdminRevenuePage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalMRR: 0,
    totalARR: 0,
    mrrGrowth: 0,
    arrGrowth: 0,
    avgRevenuePerOrg: 0,
    avgSeatsPerOrg: 0,
    planDistribution: {},
    topOrganizations: [],
  });

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      // Fetch organizations
      const response = await fetch('/api/admin/organizations');
      const data = await response.json();

      if (response.ok && data.organizations) {
        const orgs = data.organizations;

        // Calculate metrics
        const paidOrgs = orgs.filter((org: Organization) => org.plan !== 'FREE');
        const totalMRR = orgs.reduce((sum: number, org: Organization) => sum + (org.mrr || 0), 0);
        const totalARR = orgs.reduce((sum: number, org: Organization) => sum + (org.arr || 0), 0);

        // Fetch revenue history for growth calculation
        const historyResponse = await fetch('/api/admin/revenue-snapshot');
        const historyData = await historyResponse.json();

        let mrrGrowth = 0;
        let arrGrowth = 0;

        if (historyResponse.ok && historyData.history && historyData.history.length >= 2) {
          // Most recent month is at index 0, previous month at index 1
          const currentMonth = historyData.history[0];
          const previousMonth = historyData.history[1];

          if (previousMonth.total_mrr > 0) {
            mrrGrowth = ((currentMonth.total_mrr - previousMonth.total_mrr) / previousMonth.total_mrr) * 100;
          }

          if (previousMonth.total_arr > 0) {
            arrGrowth = ((currentMonth.total_arr - previousMonth.total_arr) / previousMonth.total_arr) * 100;
          }
        }

        // Plan distribution
        const planDist: Record<string, number> = {};
        orgs.forEach((org: Organization) => {
          planDist[org.plan] = (planDist[org.plan] || 0) + 1;
        });

        // Top organizations by revenue
        const topOrgs = [...orgs]
          .filter((org: Organization) => org.mrr > 0)
          .sort((a: Organization, b: Organization) => (b.mrr || 0) - (a.mrr || 0))
          .slice(0, 10);

        setMetrics({
          totalMRR,
          totalARR,
          mrrGrowth,
          arrGrowth,
          avgRevenuePerOrg: paidOrgs.length > 0 ? totalMRR / paidOrgs.length : 0,
          avgSeatsPerOrg: paidOrgs.length > 0
            ? paidOrgs.reduce((sum: number, org: Organization) => sum + org.seats, 0) / paidOrgs.length
            : 0,
          planDistribution: planDist,
          topOrganizations: topOrgs,
        });
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    const colors: Record<string, string> = {
      FREE: 'bg-gray-500',
      PRO: 'bg-blue-500',
      BUSINESS: 'bg-purple-500',
      ENTERPRISE: 'bg-orange-500',
    };
    return colors[plan] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${metrics.totalMRR.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              {metrics.mrrGrowth >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{metrics.mrrGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{metrics.mrrGrowth.toFixed(1)}%</span>
                </>
              )}
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Annual Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${metrics.totalARR.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              {metrics.arrGrowth >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{metrics.arrGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{metrics.arrGrowth.toFixed(1)}%</span>
                </>
              )}
              <span>vs last year</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              ARPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${metrics.avgRevenuePerOrg.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-2">Average Revenue Per Organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Avg Seats/Org
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.avgSeatsPerOrg.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-2">Average seats per paid organization</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Plan Distribution
          </CardTitle>
          <CardDescription>Organizations by subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.planDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([plan, count]) => {
                const percentage = (count / Object.values(metrics.planDistribution).reduce((a, b) => a + b, 0)) * 100;
                return (
                  <div key={plan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getPlanBadgeColor(plan)}>{plan}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {count} {count === 1 ? 'organization' : 'organizations'}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Top Revenue Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Organizations by Revenue</CardTitle>
          <CardDescription>Highest MRR contributors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topOrganizations.map((org, index) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge className={getPlanBadgeColor(org.plan)} variant="outline">
                        {org.plan}
                      </Badge>
                      <span>•</span>
                      <span>{org.seats} seats</span>
                      <span>•</span>
                      <span>{org.member_count} members</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${org.mrr.toFixed(2)}/mo</div>
                  <div className="text-sm text-muted-foreground">
                    ${org.arr.toFixed(2)}/yr
                  </div>
                </div>
              </div>
            ))}

            {metrics.topOrganizations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No revenue data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Insights</CardTitle>
          <CardDescription>Key metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Revenue Growth Potential</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on current plan distribution and seat utilization, there's opportunity to increase revenue through
                  upselling {metrics.planDistribution['FREE'] || 0} free organizations and expanding seats for existing paid customers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Users className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <div className="font-medium">Expansion Opportunity</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Average {metrics.avgSeatsPerOrg.toFixed(1)} seats per organization. Monitor organizations approaching their seat limits
                  for expansion opportunities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Target className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <div className="font-medium">ARPU Analysis</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Average revenue per paying organization is ${metrics.avgRevenuePerOrg.toFixed(2)}/month.
                  Focus on moving free users to paid plans and upgrading existing customers to higher tiers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
