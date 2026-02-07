'use client';

/**
 * Subscription Status Component
 *
 * Displays current subscription status, trial information, and billing details
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface SubscriptionStatusProps {
  type: 'individual' | 'organization';
  organizationId?: string;
}

interface StatusData {
  isBeta: boolean;
  subscriptionContext?: string;
  localStatus?: {
    subscriptionId?: string;
    status?: string;
    trialEndsAt?: string;
    trialStartedAt?: string;
    seats?: number;
    seatsUsed?: number;
  };
  paypalStatus?: {
    id: string;
    status: string;
    nextBillingTime?: string;
    lastPaymentAmount?: any;
  };
  isAdmin?: boolean;
}

export function SubscriptionStatus({ type, organizationId }: SubscriptionStatusProps) {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchStatus = async () => {
    try {
      const endpoint =
        type === 'individual'
          ? '/api/billing/individual/status'
          : `/api/billing/organization/status?organizationId=${organizationId}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }

      setStatus(data);
    } catch (error: any) {
      console.error('Error fetching subscription status:', error);
      toast.error(error.message || 'Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [type, organizationId]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setCancelling(true);
    try {
      const endpoint =
        type === 'individual'
          ? '/api/billing/individual/cancel'
          : '/api/billing/organization/cancel';

      const body = type === 'organization' ? { organizationId } : {};

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }

      toast.success('Subscription cancelled successfully');
      fetchStatus(); // Refresh status
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load subscription status</p>
        </CardContent>
      </Card>
    );
  }

  // Beta mode
  if (status.isBeta) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Beta Access</CardTitle>
          <CardDescription>
            You're currently in beta mode with full access to all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              Beta User
            </Badge>
            <span className="text-muted-foreground">
              No payment required during beta period
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No subscription
  if (!status.localStatus?.subscriptionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            {status.subscriptionContext === 'organization'
              ? 'Your organization handles billing'
              : 'Subscribe to continue using EaseMail'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status.subscriptionContext === 'organization' ? (
            <p className="text-sm text-muted-foreground">
              Your subscription is managed by your organization. Contact your organization admin for
              billing information.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              You don't have an active subscription. Subscribe now to continue using EaseMail.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
      case 'EXPIRED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'SUSPENDED':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'destructive';
      case 'SUSPENDED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>
              {type === 'individual' ? 'Individual Plan' : 'Organization Plan'}
            </CardDescription>
          </div>
          {getStatusIcon(status.paypalStatus?.status || status.localStatus?.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={getStatusBadgeVariant(status.paypalStatus?.status)}>
              {status.paypalStatus?.status || status.localStatus?.status || 'Unknown'}
            </Badge>
          </div>

          {/* Subscription ID */}
          {status.localStatus?.subscriptionId && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Subscription ID</span>
              <span className="text-sm text-muted-foreground font-mono">
                {status.localStatus.subscriptionId.substring(0, 20)}...
              </span>
            </div>
          )}

          {/* Organization seats */}
          {type === 'organization' && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Seats</span>
              <span className="text-sm text-muted-foreground">
                {status.localStatus?.seatsUsed} / {status.localStatus?.seats} used
              </span>
            </div>
          )}

          {/* Trial info */}
          {status.localStatus?.trialEndsAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trial Ends</span>
              <span className="text-sm text-muted-foreground">
                {new Date(status.localStatus.trialEndsAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Next billing */}
          {status.paypalStatus?.nextBillingTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Next Billing</span>
              <span className="text-sm text-muted-foreground">
                {new Date(status.paypalStatus.nextBillingTime).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Cancel button */}
        {(status.paypalStatus?.status === 'ACTIVE' ||
          status.localStatus?.status === 'ACTIVE') &&
          (type === 'individual' || status.isAdmin) && (
            <div className="pt-4 border-t">
              <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
