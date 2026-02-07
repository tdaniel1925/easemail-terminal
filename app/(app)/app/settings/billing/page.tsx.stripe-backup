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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  stripe_customer_id?: string | null;
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
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly');
  const [changingPlan, setChangingPlan] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCycleChangeDialog, setShowCycleChangeDialog] = useState(false);
  const [changingCycle, setChangingCycle] = useState(false);

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    try {
      setChangingPlan(true);

      // Create Stripe checkout session for plan change
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organization?.id,
          plan: selectedPlan,
          seats: organization?.seats || 1,
        }),
      });

      const data = await response.json();

      if (response.ok && data.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.sessionUrl;
      } else {
        toast.error(data.error || 'Failed to initiate plan change');
      }
    } catch (error) {
      console.error('Plan change error:', error);
      toast.error('Failed to change plan');
    } finally {
      setChangingPlan(false);
    }
  };

  const openStripePortal = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: organization?.id }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Stripe portal error:', error);
      toast.error('Failed to open billing portal');
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    } else {
      toast.error('Invoice PDF not available');
    }
  };

  const handleCancelSubscription = async () => {
    if (!organization) return;

    try {
      setCancelling(true);

      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: organization.id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Subscription cancelled successfully');
        setShowCancelDialog(false);
        fetchBillingData();
      } else {
        toast.error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const handleChangeBillingCycle = async () => {
    if (!organization) return;

    const newCycle = organization.billing_cycle === 'monthly' ? 'annual' : 'monthly';

    try {
      setChangingCycle(true);

      const response = await fetch('/api/stripe/change-billing-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organization.id,
          newCycle,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Billing cycle changed to ${newCycle}`);
        setShowCycleChangeDialog(false);
        fetchBillingData();
      } else {
        toast.error(data.error || 'Failed to change billing cycle');
      }
    } catch (error) {
      console.error('Change billing cycle error:', error);
      toast.error('Failed to change billing cycle');
    } finally {
      setChangingCycle(false);
    }
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
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSelectedPlan(organization.plan);
                setSelectedBillingCycle(organization.billing_cycle || 'monthly');
                setShowPlanChangeDialog(true);
              }}
            >
              Change Plan
            </Button>
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

      {/* Change Billing Cycle */}
      {organization && organization.plan !== 'FREE' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Billing Cycle
            </CardTitle>
            <CardDescription>
              Switch between monthly and annual billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Current: <span className="capitalize">{organization.billing_cycle}</span> Billing
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {organization.billing_cycle === 'monthly'
                    ? 'Switch to annual billing and save 17% (2 months free)'
                    : 'Switch to monthly billing for more flexibility'}
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowCycleChangeDialog(true)}>
                Switch to {organization.billing_cycle === 'monthly' ? 'Annual' : 'Monthly'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              <CardDescription>Manage your payment methods in Stripe Portal</CardDescription>
            </div>
            {organization?.stripe_customer_id && (
              <Button variant="outline" size="sm" onClick={openStripePortal}>
                <Plus className="mr-2 h-4 w-4" />
                Manage in Portal
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payment methods added</p>
              {organization?.stripe_customer_id && (
                <Button variant="outline" size="sm" className="mt-3" onClick={openStripePortal}>
                  Add Payment Method
                </Button>
              )}
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
              <div className="pt-2">
                <p className="text-xs text-muted-foreground text-center">
                  Use Stripe Portal to add, remove, or set default payment methods
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe Customer Portal */}
      {organization.stripe_customer_id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing Portal
            </CardTitle>
            <CardDescription>Manage all billing settings in Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Access the Stripe customer portal to manage payment methods, view invoices, and update billing information.
                </p>
              </div>
              <Button onClick={openStripePortal} variant="outline">
                Open Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Change Dialog */}
      <Dialog open={showPlanChangeDialog} onOpenChange={setShowPlanChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a new plan and billing cycle. Changes will be reflected in your next billing period.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="plan">Select Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free Plan ($0/mo)</SelectItem>
                  <SelectItem value="PRO">Pro Plan ($12/mo)</SelectItem>
                  <SelectItem value="BUSINESS">Business Plan ($25/seat/mo)</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise Plan (Custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Select value={selectedBillingCycle} onValueChange={setSelectedBillingCycle}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual (Save 17%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPlan !== 'FREE' && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">New Cost Preview</h4>
                <p className="text-sm text-muted-foreground">
                  Based on your current {organization?.seats} seat(s)
                </p>
                <p className="text-2xl font-bold mt-2">
                  {selectedPlan === 'PRO' && '$12/mo'}
                  {selectedPlan === 'BUSINESS' && `$${(organization?.seats || 1) * 25}/mo`}
                  {selectedPlan === 'ENTERPRISE' && 'Custom Pricing'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanChangeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePlan} disabled={changingPlan || selectedPlan === 'ENTERPRISE'}>
              {changingPlan ? 'Processing...' : selectedPlan === 'ENTERPRISE' ? 'Contact Sales' : 'Continue to Checkout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!invoice.pdf_url}
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
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

      {/* Danger Zone */}
      {organization && organization.plan !== 'FREE' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cancel Subscription</p>
                <p className="text-sm text-muted-foreground">
                  Cancel your subscription. Your plan will remain active until the end of the billing period.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                Cancel Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">What happens when you cancel:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Your subscription will remain active until {organization && formatDate(organization.next_billing_date)}</li>
                <li>You will not be charged for the next billing cycle</li>
                <li>After cancellation, your plan will revert to the Free plan</li>
                <li>Some features will be limited or unavailable</li>
              </ul>
            </div>

            <div className="bg-destructive/10 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Warning</p>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. You can resubscribe later, but will need to set up your plan again.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Billing Cycle Dialog */}
      <Dialog open={showCycleChangeDialog} onOpenChange={setShowCycleChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Billing Cycle</DialogTitle>
            <DialogDescription>
              Switch your subscription to {organization?.billing_cycle === 'monthly' ? 'annual' : 'monthly'} billing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {organization?.billing_cycle === 'monthly' ? (
              <>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Save with Annual Billing!
                  </p>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4 list-disc">
                    <li>Pay for 10 months, get 12 months of service</li>
                    <li>Save {formatCurrency(organization.mrr * 2)} per year</li>
                    <li>17% discount on your subscription</li>
                    <li>Lock in current pricing for the full year</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Monthly Cost:</span>
                    <span className="text-sm font-semibold">{formatCurrency(organization.mrr)}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New Annual Cost:</span>
                    <span className="text-sm font-semibold">{formatCurrency(organization.mrr * 10)}/year</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm font-bold">Annual Savings:</span>
                    <span className="text-sm font-bold">{formatCurrency(organization.mrr * 2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Switch to Monthly Billing</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>More flexible payment schedule</li>
                    <li>Monthly cost: {formatCurrency(organization.mrr)}/mo</li>
                    <li>Cancel anytime without long-term commitment</li>
                    <li>Change will take effect at the end of current billing period</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Annual Cost:</span>
                    <span className="text-sm font-semibold">{formatCurrency(organization.arr)}/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New Monthly Cost:</span>
                    <span className="text-sm font-semibold">{formatCurrency(organization.mrr)}/mo</span>
                  </div>
                </div>
              </>
            )}

            <p className="text-xs text-muted-foreground">
              Changes will take effect immediately for new subscriptions or at the next billing date for existing subscriptions.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCycleChangeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeBillingCycle} disabled={changingCycle}>
              {changingCycle ? 'Processing...' : `Switch to ${organization?.billing_cycle === 'monthly' ? 'Annual' : 'Monthly'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
