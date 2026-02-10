'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Camera,
  Loader2,
  Calendar,
  DollarSign,
  Users,
  Building2,
  TrendingUp,
} from 'lucide-react';

interface RevenueSnapshot {
  id: string;
  snapshot_date: string;
  total_revenue: number;
  monthly_recurring_revenue: number;
  annual_recurring_revenue: number;
  total_users: number;
  paying_users: number;
  trial_users: number;
  cancelled_users: number;
  total_organizations: number;
  paying_organizations: number;
  created_at: string;
}

export default function AdminRevenueSnapshotPage() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [snapshots, setSnapshots] = useState<RevenueSnapshot[]>([]);

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const fetchSnapshots = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/revenue-snapshot');
      const data = await response.json();

      if (response.ok && data.snapshots) {
        setSnapshots(data.snapshots);
      }
    } catch (error) {
      console.error('Failed to fetch snapshots:', error);
      toast.error('Failed to load snapshots');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      setCreating(true);
      const response = await fetch('/api/admin/revenue-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Snapshot created successfully!');
        fetchSnapshots();
      } else {
        toast.error(data.error || 'Failed to create snapshot');
      }
    } catch (error) {
      console.error('Create snapshot error:', error);
      toast.error('Failed to create snapshot');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const latestSnapshot = snapshots[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Snapshots</h1>
          <p className="text-muted-foreground mt-1">Track historical revenue metrics</p>
        </div>
        <Button onClick={handleCreateSnapshot} disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Create Snapshot
            </>
          )}
        </Button>
      </div>

      {/* Latest Snapshot Stats */}
      {latestSnapshot && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${latestSnapshot.monthly_recurring_revenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(latestSnapshot.snapshot_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">ARR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${latestSnapshot.annual_recurring_revenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Annual recurring revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Paying Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestSnapshot.paying_users}</div>
              <p className="text-xs text-muted-foreground mt-1">
                of {latestSnapshot.total_users} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Paying Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestSnapshot.paying_organizations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                of {latestSnapshot.total_organizations} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Snapshots History */}
      <Card>
        <CardHeader>
          <CardTitle>Snapshot History ({snapshots.length})</CardTitle>
          <CardDescription>Historical revenue data points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {new Date(snapshot.snapshot_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(snapshot.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <div className="text-muted-foreground">MRR</div>
                    <div className="font-semibold">
                      ${snapshot.monthly_recurring_revenue.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ARR</div>
                    <div className="font-semibold">
                      ${snapshot.annual_recurring_revenue.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Users</div>
                    <div className="font-semibold">
                      {snapshot.paying_users}/{snapshot.total_users}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Orgs</div>
                    <div className="font-semibold">
                      {snapshot.paying_organizations}/{snapshot.total_organizations}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {snapshots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No snapshots yet. Create one to start tracking revenue history.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
