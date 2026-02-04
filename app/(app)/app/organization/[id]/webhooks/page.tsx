'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Edit, Webhook, Loader2, AlertCircle, CheckCircle, Send, History } from 'lucide-react';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
}

const AVAILABLE_EVENTS = [
  { value: 'member.added', label: 'Member Added' },
  { value: 'member.removed', label: 'Member Removed' },
  { value: 'member.role_changed', label: 'Member Role Changed' },
  { value: 'invite.sent', label: 'Invitation Sent' },
  { value: 'invite.accepted', label: 'Invitation Accepted' },
  { value: 'organization.updated', label: 'Organization Updated' },
  { value: 'plan.changed', label: 'Plan Changed' },
  { value: 'subscription.cancelled', label: 'Subscription Cancelled' },
  { value: 'payment.succeeded', label: 'Payment Succeeded' },
  { value: 'payment.failed', label: 'Payment Failed' },
];

export default function WebhooksPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (orgId) {
      fetchWebhooks();
    }
  }, [orgId]);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${orgId}/webhooks`);
      const data = await response.json();

      if (response.ok) {
        setWebhooks(data.webhooks);
      } else {
        toast.error(data.error || 'Failed to load webhooks');
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.url || formData.events.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch(`/api/organizations/${orgId}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Webhook created successfully');
        setShowCreateDialog(false);
        setFormData({ name: '', url: '', events: [], secret: '' });
        fetchWebhooks();
      } else {
        toast.error(data.error || 'Failed to create webhook');
      }
    } catch (error) {
      console.error('Create webhook error:', error);
      toast.error('Failed to create webhook');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedWebhook) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/organizations/${orgId}/webhooks/${selectedWebhook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Webhook updated successfully');
        setShowEditDialog(false);
        setSelectedWebhook(null);
        setFormData({ name: '', url: '', events: [], secret: '' });
        fetchWebhooks();
      } else {
        toast.error(data.error || 'Failed to update webhook');
      }
    } catch (error) {
      console.error('Update webhook error:', error);
      toast.error('Failed to update webhook');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWebhook) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/organizations/${orgId}/webhooks/${selectedWebhook.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Webhook deleted successfully');
        setShowDeleteDialog(false);
        setSelectedWebhook(null);
        fetchWebhooks();
      } else {
        toast.error(data.error || 'Failed to delete webhook');
      }
    } catch (error) {
      console.error('Delete webhook error:', error);
      toast.error('Failed to delete webhook');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (webhook: Webhook) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/webhooks/${webhook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !webhook.is_active }),
      });

      if (response.ok) {
        toast.success(`Webhook ${!webhook.is_active ? 'enabled' : 'disabled'}`);
        fetchWebhooks();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update webhook');
      }
    } catch (error) {
      console.error('Toggle webhook error:', error);
      toast.error('Failed to update webhook');
    }
  };

  const handleTest = async () => {
    if (!selectedWebhook) return;

    try {
      setTesting(true);
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from EaseMail',
          webhook_id: selectedWebhook.id,
        },
      };

      const response = await fetch(selectedWebhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        toast.success('Test webhook sent successfully');
        setShowTestDialog(false);
        setSelectedWebhook(null);
      } else {
        toast.error(`Test failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Test webhook error:', error);
      toast.error('Failed to send test webhook');
    } finally {
      setTesting(false);
    }
  };

  const openEditDialog = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
    });
    setShowEditDialog(true);
  };

  const toggleEvent = (eventValue: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventValue)
        ? prev.events.filter(e => e !== eventValue)
        : [...prev.events, eventValue],
    }));
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = 'whsec_';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, secret }));
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

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/app/organization/${orgId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Webhook className="h-8 w-8" />
            Webhooks
          </h1>
          <p className="text-muted-foreground">Configure webhooks to receive real-time notifications</p>
        </div>
        <Button onClick={() => {
          setFormData({ name: '', url: '', events: [], secret: '' });
          setShowCreateDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Webhook
        </Button>
      </div>

      {/* Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Webhooks</strong> allow your application to receive real-time notifications when events occur in your organization.
          </p>
          <p>
            <strong>Events:</strong> Subscribe to specific events you want to be notified about.
          </p>
          <p>
            <strong>Secret:</strong> Use the webhook secret to verify that requests are coming from EaseMail.
          </p>
        </CardContent>
      </Card>

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Webhook className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No webhooks configured</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create your first webhook to start receiving real-time notifications
            </p>
            <Button onClick={() => {
              setFormData({ name: '', url: '', events: [], secret: '' });
              setShowCreateDialog(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{webhook.name}</CardTitle>
                      {webhook.is_active ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription className="break-all">{webhook.url}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={() => handleToggleActive(webhook)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Subscribed Events ({webhook.events.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline">
                          {AVAILABLE_EVENTS.find(e => e.value === event)?.label || event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedWebhook(webhook);
                        setShowTestDialog(true);
                      }}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/app/organization/${orgId}/webhooks/${webhook.id}/deliveries`)}
                    >
                      <History className="mr-2 h-4 w-4" />
                      View Logs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(webhook)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedWebhook(webhook);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        setShowEditDialog(open);
        if (!open) {
          setFormData({ name: '', url: '', events: [], secret: '' });
          setSelectedWebhook(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Edit' : 'Create'} Webhook</DialogTitle>
            <DialogDescription>
              Configure your webhook to receive real-time notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Webhook Name</Label>
              <Input
                id="name"
                placeholder="My Webhook"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="url">Endpoint URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/webhook"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The URL where webhook events will be sent
              </p>
            </div>

            <div>
              <Label>Events to Subscribe</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <div key={event.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={event.value}
                      checked={formData.events.includes(event.value)}
                      onChange={() => toggleEvent(event.value)}
                      className="rounded"
                    />
                    <label htmlFor={event.value} className="text-sm cursor-pointer">
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Select at least one event to subscribe to
              </p>
            </div>

            <div>
              <Label htmlFor="secret">Webhook Secret (Optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="secret"
                  type="password"
                  placeholder="whsec_..."
                  value={formData.secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                />
                <Button variant="outline" onClick={generateSecret}>
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use this to verify webhook signatures
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              setFormData({ name: '', url: '', events: [], secret: '' });
              setSelectedWebhook(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={showEditDialog ? handleUpdate : handleCreate}
              disabled={creating || updating}
            >
              {(creating || updating) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {showEditDialog ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                showEditDialog ? 'Update Webhook' : 'Create Webhook'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this webhook?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive mb-1">Warning</p>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. The webhook will stop receiving events immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setShowDeleteDialog(false);
              setSelectedWebhook(null);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Webhook
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Webhook</DialogTitle>
            <DialogDescription>
              Send a test event to verify your webhook is working
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Test Payload</p>
              <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`{
  "event": "webhook.test",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "message": "This is a test webhook from EaseMail",
    "webhook_id": "${selectedWebhook?.id}"
  }
}`}
              </pre>
            </div>

            <p className="text-sm text-muted-foreground">
              This will send a POST request to: <span className="font-mono text-xs">{selectedWebhook?.url}</span>
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setShowTestDialog(false);
              setSelectedWebhook(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleTest} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
