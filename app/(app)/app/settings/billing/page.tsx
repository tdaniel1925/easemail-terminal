'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CreditCard, Download, Loader2, Crown, Users, Zap } from 'lucide-react';

interface BillingInfo {
  plan: string;
  seats: number;
  seats_used: number;
  billing_cycle: string;
  next_billing_date: string;
  amount: number;
}

const plans = [
  {
    name: 'Free',
    price: 0,
    seats: 1,
    features: [
      '1 email account',
      'Basic email features',
      'Limited AI features (10/month)',
      '1GB storage',
    ],
  },
  {
    name: 'Pro',
    price: 12,
    seats: 1,
    features: [
      'Unlimited email accounts',
      'All email features',
      'Unlimited AI features',
      '50GB storage',
      'Priority support',
      'Calendar integration',
    ],
    popular: true,
  },
  {
    name: 'Business',
    price: 25,
    seats: 5,
    features: [
      'Everything in Pro',
      '5 team seats (starting)',
      'Admin panel',
      'Team analytics',
      '500GB shared storage',
      'SMS integration',
      'Advanced security',
    ],
  },
  {
    name: 'Enterprise',
    price: null,
    seats: 'Unlimited',
    features: [
      'Everything in Business',
      'Unlimited seats',
      'Custom domain',
      'SSO & SAML',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];

export default function BillingSettingsPage() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing');
      const data = await response.json();

      if (data.billing) {
        setBillingInfo(data.billing);
      }
    } catch (error) {
      console.error('Failed to fetch billing info:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planName: string) => {
    toast.success(`Upgrading to ${planName}...`);
    // TODO: Implement Stripe checkout
  };

  const handleManageSubscription = () => {
    toast.success('Opening Stripe portal...');
    // TODO: Implement Stripe customer portal
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">{billingInfo?.plan || 'Free'}</h3>
                {billingInfo?.plan !== 'Free' && (
                  <Badge className="gap-1">
                    <Crown className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {billingInfo?.seats_used || 0} of {billingInfo?.seats || 1} seats used
              </p>
            </div>
            {billingInfo?.plan !== 'Free' && (
              <div className="text-right">
                <div className="text-2xl font-bold">${billingInfo?.amount || 0}</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            )}
          </div>

          {billingInfo?.plan !== 'Free' && (
            <>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next billing date</span>
                <span className="font-medium">
                  {billingInfo?.next_billing_date || 'N/A'}
                </span>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-2">
            {billingInfo?.plan === 'Free' ? (
              <Button onClick={() => handleUpgrade('Pro')}>
                <Zap className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleManageSubscription}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add Seats
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? 'border-primary shadow-lg' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      {plan.price !== null ? (
                        <>
                          <span className="text-3xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold">Custom</span>
                      )}
                    </div>
                  </div>
                  {plan.popular && (
                    <Badge className="gap-1">
                      <Crown className="h-3 w-3" />
                      Popular
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.price === null ? 'Contact Sales' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      {billingInfo?.plan !== 'Free' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="font-medium">•••• •••• •••• 4242</div>
                  <div className="text-sm text-muted-foreground">Expires 12/25</div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billingInfo?.plan === 'Free' ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No billing history available
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">January 2026</div>
                    <div className="text-sm text-muted-foreground">
                      ${billingInfo?.amount || 0} • Paid
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">December 2025</div>
                    <div className="text-sm text-muted-foreground">
                      ${billingInfo?.amount || 0} • Paid
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
