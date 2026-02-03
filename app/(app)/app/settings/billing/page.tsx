'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CreditCard,
  Download,
  Plus,
  DollarSign,
  Calendar,
  TrendingUp,
  Key,
  Users,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  plan: string;
  seats: number;
  billing_cycle: string;
  mrr: number;
  arr: number;
  next_billing_date: string;
  uses_master_api_key: boolean;
  api_key_id: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  total_amount: number;
  status: string;
  paid_at: string | null;
  pdf_url: string | null;
}

interface PaymentMethod {
  id: string;
  type: string;
  is_default: boolean;
  card_brand?: string;
  card_last4?: string;
  bank_name?: string;
  bank_last4?: string;
  invoice_email?: string;
}

interface ApiKey {
  id: string;
  key_name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [addSeatsDialogOpen, setAddSeatsDialogOpen] = useState(false);
  const [seatsToAdd, setSeatsToAdd] = useState(1);
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      // Fetch organization details
      const orgResponse = await fetch('/api/organization');
      const orgData = await orgResponse.json();
      if (orgData.organization) {
        setOrganization(orgData.organization);
      }

      // Fetch invoices
      const invoicesResponse = await fetch('/api/invoices');
      const invoicesData = await invoicesResponse.json();
      if (invoicesData.invoices) {
        setInvoices(invoicesData.invoices);
      }

      // Fetch payment methods
      const paymentResponse = await fetch('/api/payment-methods');
      const paymentData = await paymentResponse.json();
      if (paymentData.payment_methods) {
        setPaymentMethods(paymentData.payment_methods);
      }

      // Fetch API key if not using master
      if (orgData.organization && !orgData.organization.uses_master_api_key) {
        const apiKeyResponse = await fetch('/api/api-keys');
        const apiKeyData = await apiKeyResponse.json();
        if (apiKeyData.api_key) {
          setApiKey(apiKeyData.api_key);
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const calculateNewCost = (currentSeats: number, additionalSeats: number) => {
    const newSeats = currentSeats + additionalSeats;
    let monthlyCost = 0;

    if (newSeats === 1) {
      monthlyCost = 30;
    } else if (newSeats >= 2 && newSeats <= 10) {
      monthlyCost = newSeats * 25;
    } else if (newSeats >= 11) {
      monthlyCost = newSeats * 20;
    }

    return {
      newSeats,
      monthlyCost,
      annualCost: organization?.billing_cycle === 'annual' ? monthlyCost * 10 : monthlyCost * 12,
    };
  };

  const handleAddSeats = async () => {
    try {
      const response = await fetch('/api/organization/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additional_seats: seatsToAdd }),
      });

      if (!response.ok) {
        throw new Error('Failed to add seats');
      }

      toast.success(`Successfully added ${seatsToAdd} seat(s)`);

      setAddSeatsDialogOpen(false);
      setSeatsToAdd(1);
      fetchBillingData();
    } catch (error) {
      toast.error('Failed to add seats');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Organization Found</h2>
          <p className="text-muted-foreground">Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  const costPreview = seatsToAdd > 0 ? calculateNewCost(organization.seats, seatsToAdd) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization's billing, invoices, and payment methods
        </p>
      </div>

      {/* Current Plan Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.plan}</div>
            <p className="text-xs text-muted-foreground">
              {organization.billing_cycle === 'annual' ? 'Annual billing' : 'Monthly billing'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Seats</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.seats}</div>
            <p className="text-xs text-muted-foreground">
              {organization.seats === 1 ? 'Single user' : `${organization.seats} users`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {organization.billing_cycle === 'annual' ? 'Annual Cost' : 'Monthly Cost'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(organization.billing_cycle === 'annual' ? organization.arr : organization.mrr)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(organization.mrr)}/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatDate(organization.next_billing_date)}
            </div>
            <p className="text-xs text-muted-foreground">Auto-renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Detailed breakdown of your subscription costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Plan Type</span>
            <Badge variant="secondary">{organization.plan}</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Number of Seats</span>
            <span>{organization.seats} × {formatCurrency(organization.mrr / organization.seats)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Billing Cycle</span>
            <span className="capitalize">{organization.billing_cycle}</span>
          </div>
          {organization.billing_cycle === 'annual' && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-green-600">Annual Savings</span>
              <span className="text-green-600 font-semibold">
                {formatCurrency(organization.mrr * 2)} (2 months free)
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between items-center py-2">
            <span className="text-base font-bold">Total {organization.billing_cycle === 'annual' ? 'Annual' : 'Monthly'}</span>
            <span className="text-xl font-bold">
              {formatCurrency(organization.billing_cycle === 'annual' ? organization.arr : organization.mrr)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Manage Seats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Seats
          </CardTitle>
          <CardDescription>Add or remove user seats for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Current seats: <span className="font-semibold">{organization.seats}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Pricing: $30/month (1 seat), $25/seat (2-10), $20/seat (11+)
              </p>
            </div>
            <Dialog open={addSeatsDialogOpen} onOpenChange={setAddSeatsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Seats
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add User Seats</DialogTitle>
                  <DialogDescription>
                    Add additional seats to your organization. Changes will be reflected in your next invoice.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="seats">Number of seats to add</Label>
                    <Input
                      id="seats"
                      type="number"
                      min="1"
                      value={seatsToAdd}
                      onChange={(e) => setSeatsToAdd(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  {costPreview && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm">Cost Preview</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Current seats:</span>
                          <span>{organization.seats}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>New seats:</span>
                          <span className="font-semibold">{costPreview.newSeats}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between">
                          <span>New monthly cost:</span>
                          <span className="font-bold">{formatCurrency(costPreview.monthlyCost)}</span>
                        </div>
                        {organization.billing_cycle === 'annual' && (
                          <div className="flex justify-between">
                            <span>New annual cost:</span>
                            <span className="font-bold">{formatCurrency(costPreview.annualCost)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-green-600">
                          <span>Additional cost:</span>
                          <span className="font-semibold">
                            +{formatCurrency(costPreview.monthlyCost - organization.mrr)}/month
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddSeatsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSeats}>Add Seats</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Key
          </CardTitle>
          <CardDescription>
            Manage your organization's OpenAI API key configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organization.uses_master_api_key ? (
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                    Using Master API Key
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Your organization is currently using the platform's master API key.
                    AI usage is included in your seat pricing.
                  </p>
                </div>
              </div>
            ) : apiKey ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold text-sm">{apiKey.key_name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {formatDate(apiKey.created_at)}
                      {apiKey.last_used_at && ` • Last used ${formatDate(apiKey.last_used_at)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Usage count: {apiKey.usage_count}
                    </p>
                  </div>
                  <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                    {apiKey.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  Update API Key
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No custom API key configured</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </div>
            <Dialog open={addPaymentDialogOpen} onOpenChange={setAddPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new payment method for your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Payment method management UI will be implemented with Stripe integration
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payment methods added</p>
            </div>
          ) : (
            <div className="space-y-2">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="flex justify-between items-center p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      {pm.type === 'card' && (
                        <p className="text-sm font-medium">
                          {pm.card_brand} •••• {pm.card_last4}
                        </p>
                      )}
                      {pm.type === 'ach' && (
                        <p className="text-sm font-medium">
                          {pm.bank_name} •••• {pm.bank_last4}
                        </p>
                      )}
                      {pm.type === 'invoice' && (
                        <p className="text-sm font-medium">Invoice - {pm.invoice_email}</p>
                      )}
                    </div>
                  </div>
                  {pm.is_default && <Badge variant="default">Default</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No invoices yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex justify-between items-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{invoice.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(invoice.total_amount)}</p>
                        <Badge
                          variant={
                            invoice.status === 'paid'
                              ? 'default'
                              : invoice.status === 'overdue'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" disabled={!invoice.pdf_url}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
