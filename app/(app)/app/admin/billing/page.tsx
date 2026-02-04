'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  CreditCard,
  Search,
  Loader2,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  plan: string;
  seats: number;
  billing_cycle: string;
  mrr: number;
  arr: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  next_billing_date: string | null;
  payment_method_id: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  organization_id: string;
  organization_name: string;
  total_amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  billing_period_start: string;
  billing_period_end: string;
}

interface PaymentMethod {
  id: string;
  organization_id: string;
  organization_name: string;
  type: string;
  card_brand: string | null;
  card_last4: string | null;
  is_default: boolean;
  is_active: boolean;
}

export default function AdminBillingPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'payments'>('subscriptions');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);

      // Fetch organizations with billing info
      const orgsResponse = await fetch('/api/admin/organizations');
      const orgsData = await orgsResponse.json();

      if (orgsResponse.ok && orgsData.organizations) {
        setOrganizations(orgsData.organizations);
      }

      // Fetch invoices (admin-scoped)
      const invoicesResponse = await fetch('/api/admin/invoices');
      const invoicesData = await invoicesResponse.json();
      if (invoicesResponse.ok && invoicesData.invoices) {
        setInvoices(invoicesData.invoices);
      }

      // Fetch payment methods (admin-scoped)
      const pmResponse = await fetch('/api/admin/payment-methods');
      const pmData = await pmResponse.json();
      if (pmResponse.ok && pmData.payment_methods) {
        setPaymentMethods(pmData.payment_methods);
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMRR = organizations.reduce((sum, org) => sum + (org.mrr || 0), 0);
  const totalARR = organizations.reduce((sum, org) => sum + (org.arr || 0), 0);
  const activeSubscriptions = organizations.filter((org) => org.plan !== 'FREE').length;
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue').length;

  const getPlanBadgeColor = (plan: string) => {
    const colors: Record<string, string> = {
      FREE: 'bg-gray-500',
      PRO: 'bg-blue-500',
      BUSINESS: 'bg-purple-500',
      ENTERPRISE: 'bg-orange-500',
    };
    return colors[plan] || 'bg-gray-500';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500',
      pending: 'bg-yellow-500',
      overdue: 'bg-red-500',
      draft: 'bg-gray-500',
      cancelled: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-500';
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
      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMRR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total ARR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalARR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Annual Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">Paying organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Overdue Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invoices'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Payment Methods
          </button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions ({filteredOrgs.filter(o => o.plan !== 'FREE').length})</CardTitle>
            <CardDescription>Manage organization subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>ARR</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs
                  .filter((org) => org.plan !== 'FREE')
                  .map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>
                        <Badge className={getPlanBadgeColor(org.plan)}>{org.plan}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{org.billing_cycle || 'monthly'}</TableCell>
                      <TableCell>{org.seats}</TableCell>
                      <TableCell>${org.mrr?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>${org.arr?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        {org.next_billing_date
                          ? new Date(org.next_billing_date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {org.subscription_status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {org.stripe_customer_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.open(
                                `https://dashboard.stripe.com/customers/${org.stripe_customer_id}`,
                                '_blank'
                              );
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {filteredOrgs.filter((o) => o.plan !== 'FREE').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No active subscriptions found
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices ({invoices.length})</CardTitle>
            <CardDescription>View and manage invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.organization_name}</TableCell>
                      <TableCell className="font-semibold">${invoice.total_amount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invoice.billing_period_start && invoice.billing_period_end
                          ? `${new Date(invoice.billing_period_start).toLocaleDateString()} - ${new Date(invoice.billing_period_end).toLocaleDateString()}`
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods ({paymentMethods.length})</CardTitle>
            <CardDescription>View payment methods across organizations</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethods.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.map((pm) => (
                    <TableRow key={pm.id}>
                      <TableCell className="font-medium">{pm.organization_name}</TableCell>
                      <TableCell className="capitalize">{pm.type || 'card'}</TableCell>
                      <TableCell>
                        {pm.card_brand && pm.card_last4 ? (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{pm.card_brand}</span>
                            <span className="text-muted-foreground">•••• {pm.card_last4}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={pm.is_active ? 'default' : 'secondary'}>
                          {pm.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pm.is_default && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No payment methods found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
