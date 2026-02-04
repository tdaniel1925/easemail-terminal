'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  RefreshCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  response_status: number | null;
  response_body: string | null;
  delivered_at: string | null;
  retry_count: number;
  next_retry_at: string | null;
  created_at: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const AVAILABLE_EVENTS = [
  'member.added',
  'member.removed',
  'member.role_changed',
  'invite.sent',
  'invite.accepted',
  'organization.updated',
  'plan.changed',
  'payment.succeeded',
  'payment.failed',
  'webhook.test',
];

export default function WebhookDeliveriesPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  const webhookId = params.webhookId as string;

  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  // Detail dialog
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    if (orgId && webhookId) {
      fetchDeliveries();
    }
  }, [orgId, webhookId, statusFilter, eventTypeFilter, pagination.offset]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (eventTypeFilter !== 'all') {
        params.append('event_type', eventTypeFilter);
      }

      const response = await fetch(
        `/api/organizations/${orgId}/webhooks/${webhookId}/deliveries?${params}`
      );
      const data = await response.json();

      if (response.ok) {
        setDeliveries(data.deliveries);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'Failed to load deliveries');
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (deliveryId: string) => {
    try {
      setRetrying(deliveryId);
      const response = await fetch(
        `/api/organizations/${orgId}/webhooks/${webhookId}/deliveries/${deliveryId}/retry`,
        { method: 'POST' }
      );
      const data = await response.json();

      if (data.success) {
        toast.success('Webhook resent successfully');
        fetchDeliveries();
      } else {
        toast.error(data.message || 'Failed to resend webhook');
      }
    } catch (error) {
      console.error('Failed to retry delivery:', error);
      toast.error('Failed to resend webhook');
    } finally {
      setRetrying(null);
    }
  };

  const getStatusBadge = (delivery: WebhookDelivery) => {
    if (delivery.next_retry_at) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending Retry
        </Badge>
      );
    }

    if (delivery.response_status === null) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    }

    if (delivery.response_status >= 200 && delivery.response_status < 300) {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Success
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  };

  const formatFeatureName = (name: string) => {
    return name
      .split('.')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleViewDetails = (delivery: WebhookDelivery) => {
    setSelectedDelivery(delivery);
    setShowDetailDialog(true);
  };

  const handlePreviousPage = () => {
    if (pagination.offset > 0) {
      setPagination((prev) => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setEventTypeFilter('all');
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  if (loading && deliveries.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/app/organization/${orgId}/webhooks`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Webhook Delivery Logs</h1>
          <p className="text-muted-foreground">View and manage webhook delivery attempts</p>
        </div>
        <Button variant="outline" onClick={fetchDeliveries} disabled={loading}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending Retry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Event Type</label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {AVAILABLE_EVENTS.map((event) => (
                    <SelectItem key={event} value={event}>
                      {formatFeatureName(event)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {deliveries.length} of {pagination.total} deliveries
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
          <CardDescription>All webhook delivery attempts for this webhook</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No deliveries found</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter !== 'all' || eventTypeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Webhook deliveries will appear here once events are triggered'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(delivery)}
                        <span className="font-medium">{formatFeatureName(delivery.event_type)}</span>
                        {delivery.response_status !== null && (
                          <Badge variant="outline">HTTP {delivery.response_status}</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(delivery.created_at).toLocaleString()}
                        </div>
                        {delivery.delivered_at && (
                          <div>
                            <span className="font-medium">Delivered:</span>{' '}
                            {new Date(delivery.delivered_at).toLocaleString()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Retry Count:</span> {delivery.retry_count}
                        </div>
                        {delivery.next_retry_at && (
                          <div>
                            <span className="font-medium">Next Retry:</span>{' '}
                            {new Date(delivery.next_retry_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(delivery)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>

                      {(delivery.response_status === null ||
                        delivery.response_status >= 400 ||
                        delivery.next_retry_at) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(delivery.id)}
                          disabled={retrying === delivery.id}
                        >
                          {retrying === delivery.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <RefreshCcw className="h-4 w-4 mr-1" />
                          )}
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1} to{' '}
                {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
                {pagination.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={pagination.offset === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>
              Full details for this webhook delivery attempt
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                {getStatusBadge(selectedDelivery)}
              </div>

              {/* Metadata */}
              <div>
                <h3 className="font-semibold mb-2">Metadata</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Event Type:</span>
                    <p className="font-medium">{formatFeatureName(selectedDelivery.event_type)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Response Status:</span>
                    <p className="font-medium">
                      {selectedDelivery.response_status !== null
                        ? `HTTP ${selectedDelivery.response_status}`
                        : 'No response'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">
                      {new Date(selectedDelivery.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedDelivery.delivered_at && (
                    <div>
                      <span className="text-muted-foreground">Delivered:</span>
                      <p className="font-medium">
                        {new Date(selectedDelivery.delivered_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Retry Count:</span>
                    <p className="font-medium">{selectedDelivery.retry_count}</p>
                  </div>
                  {selectedDelivery.next_retry_at && (
                    <div>
                      <span className="text-muted-foreground">Next Retry:</span>
                      <p className="font-medium">
                        {new Date(selectedDelivery.next_retry_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payload */}
              <div>
                <h3 className="font-semibold mb-2">Payload</h3>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(selectedDelivery.payload, null, 2)}
                </pre>
              </div>

              {/* Response */}
              {selectedDelivery.response_body && (
                <div>
                  <h3 className="font-semibold mb-2">Response</h3>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-[300px]">
                    {selectedDelivery.response_body}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
