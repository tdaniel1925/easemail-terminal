# PayPal Billing Integration Guide

## 🎯 Quick Start

You now have a complete PayPal billing system ready to integrate. Here's how to use it:

### 1. Environment Variables

Add these to your `.env` file:

```env
# PayPal API Credentials (get from https://developer.paypal.com)
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_MODE=sandbox  # or 'production'

# PayPal Plan IDs (create in PayPal Dashboard)
PAYPAL_PLAN_INDIVIDUAL=P-xxx  # $20/month
PAYPAL_PLAN_TEAM=P-xxx        # $18/seat/month
PAYPAL_PLAN_GROWTH=P-xxx      # $15/seat/month

# Public Client ID for frontend (same as PAYPAL_CLIENT_ID)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=https://easemail.app  # or http://localhost:3000 for dev
```

---

## 📦 Components Available

### PayPalSubscribeButton

Renders PayPal subscription button that handles the entire checkout flow.

**Usage:**
```tsx
import { PayPalSubscribeButton } from '@/components/billing/paypal-subscribe-button';

// Individual subscription
<PayPalSubscribeButton
  planId={process.env.NEXT_PUBLIC_PAYPAL_PLAN_INDIVIDUAL!}
  type="individual"
  onSuccess={() => console.log('Subscribed!')}
  onError={(error) => console.error(error)}
/>

// Organization subscription
<PayPalSubscribeButton
  planId={process.env.NEXT_PUBLIC_PAYPAL_PLAN_TEAM!}
  type="organization"
  organizationId="org-uuid"
  seats={5}
  onSuccess={() => router.refresh()}
/>
```

### SubscriptionStatus

Displays subscription status, trial info, and management options.

**Usage:**
```tsx
import { SubscriptionStatus } from '@/components/billing/subscription-status';

// Individual
<SubscriptionStatus type="individual" />

// Organization
<SubscriptionStatus
  type="organization"
  organizationId="org-uuid"
/>
```

---

## 🔌 Integration Examples

### Individual Billing Page

Update `app/(app)/app/settings/billing/page.tsx`:

```tsx
import { PayPalSubscribeButton } from '@/components/billing/paypal-subscribe-button';
import { SubscriptionStatus } from '@/components/billing/subscription-status';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BillingPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your EaseMail subscription
        </p>
      </div>

      {/* Current Status */}
      <SubscriptionStatus type="individual" />

      {/* Subscribe Section */}
      <Card>
        <CardHeader>
          <CardTitle>EaseMail Individual Plan</CardTitle>
          <CardDescription>
            $20/month with 14-day free trial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li>✓ Unlimited email accounts</li>
              <li>✓ AI-powered email assistance</li>
              <li>✓ Advanced filtering and automation</li>
              <li>✓ Priority support</li>
            </ul>

            <PayPalSubscribeButton
              planId={process.env.NEXT_PUBLIC_PAYPAL_PLAN_INDIVIDUAL!}
              type="individual"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Organization Billing Page

Create `app/(app)/app/organization/[id]/billing/page.tsx`:

```tsx
'use client';

import { useState } from 'use';
import { PayPalSubscribeButton } from '@/components/billing/paypal-subscribe-button';
import { SubscriptionStatus } from '@/components/billing/subscription-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OrganizationBillingPage({
  params,
}: {
  params: { id: string };
}) {
  const [seats, setSeats] = useState(5);
  const pricePerSeat = seats >= 10 ? 15 : 18;
  const monthlyTotal = seats * pricePerSeat;

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Organization Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization's subscription
        </p>
      </div>

      {/* Current Status */}
      <SubscriptionStatus
        type="organization"
        organizationId={params.id}
      />

      {/* Subscribe/Upgrade Section */}
      <Card>
        <CardHeader>
          <CardTitle>Team Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="seats">Number of Seats</Label>
              <Input
                id="seats"
                type="number"
                min="2"
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value) || 2)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                ${pricePerSeat}/seat/month • Total: ${monthlyTotal}/month
              </p>
              {seats >= 10 && (
                <p className="text-sm text-green-600 mt-1">
                  Growth pricing applied! Saves ${(18 - 15) * seats}/month
                </p>
              )}
            </div>

            <PayPalSubscribeButton
              planId={
                seats >= 10
                  ? process.env.NEXT_PUBLIC_PAYPAL_PLAN_GROWTH!
                  : process.env.NEXT_PUBLIC_PAYPAL_PLAN_TEAM!
              }
              type="organization"
              organizationId={params.id}
              seats={seats}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Pricing Page

Update `app/(app)/app/pricing/page.tsx` to include PayPal buttons:

```tsx
import { PayPalSubscribeButton } from '@/components/billing/paypal-subscribe-button';

// In your pricing cards:
<Card>
  <CardHeader>
    <CardTitle>Individual</CardTitle>
    <CardDescription>
      <span className="text-3xl font-bold">$20</span>/month
    </CardDescription>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2 mb-6">
      <li>✓ All features included</li>
      <li>✓ 14-day free trial</li>
      <li>✓ Cancel anytime</li>
    </ul>

    <PayPalSubscribeButton
      planId={process.env.NEXT_PUBLIC_PAYPAL_PLAN_INDIVIDUAL!}
      type="individual"
    />
  </CardContent>
</Card>
```

---

## 🔄 API Endpoints Usage

### Frontend API Calls

```typescript
// Check subscription status
const response = await fetch('/api/billing/individual/status');
const status = await response.json();

// Cancel subscription
await fetch('/api/billing/individual/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reason: 'User requested' }),
});

// Update organization seats
await fetch('/api/billing/organization/update-seats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organizationId: 'uuid',
    seats: 10,
  }),
});
```

---

## 🧪 Testing in Sandbox

### 1. PayPal Sandbox Setup

1. Go to https://developer.paypal.com
2. Log in / create account
3. Go to **Dashboard** > **Apps & Credentials**
4. Switch to **Sandbox** mode
5. Create a new app
6. Copy **Client ID** and **Secret**

### 2. Create Test Plans

1. In PayPal Dashboard, go to **Products** > **Subscriptions**
2. Create 3 plans:
   - **Individual**: $20/month, 14-day trial
   - **Team**: $18/month per quantity, 14-day trial
   - **Growth**: $15/month per quantity, 14-day trial
3. Copy the Plan IDs (start with `P-`)

### 3. Test Subscriptions

1. Set `PAYPAL_MODE=sandbox` in `.env`
2. Use sandbox credentials
3. Visit your billing page
4. Click PayPal button
5. Use test account credentials from PayPal Dashboard
6. Complete checkout flow

### Test Accounts

PayPal provides test accounts:
- **Buyer**: test-buyer@example.com
- **Seller**: test-seller@example.com
- Password: Set in PayPal Dashboard

---

## 🚀 Production Deployment

### 1. Switch to Production

```env
PAYPAL_MODE=production
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_secret
```

### 2. Create Production Plans

1. Switch to **Live** mode in PayPal Dashboard
2. Create the same 3 plans with real pricing
3. Update `PAYPAL_PLAN_*` env vars with production Plan IDs

### 3. Configure Webhook

1. In PayPal Dashboard > **Apps** > Your App
2. Add webhook URL: `https://easemail.app/api/webhooks/paypal`
3. Subscribe to events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`

### 4. Enable Signature Verification

⚠️ **IMPORTANT**: Update `app/api/webhooks/paypal/route.ts` to verify webhook signatures in production.

See: https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#verify-signature

---

## 🔒 Security Checklist

- [ ] Webhook signature verification enabled (production)
- [ ] Rate limiting on billing endpoints
- [ ] Environment variables properly secured
- [ ] No API keys committed to git
- [ ] HTTPS enabled in production
- [ ] Error messages don't leak sensitive data
- [ ] Audit logging for all billing operations

---

## 🐛 Troubleshooting

### PayPal Button Not Loading

**Issue**: "Loading PayPal..." never completes

**Fix**:
1. Check `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set
2. Verify client ID is correct
3. Check browser console for errors
4. Ensure no ad blockers blocking PayPal scripts

### Subscription Not Activating

**Issue**: User completes checkout but status stays "APPROVAL_PENDING"

**Fix**:
1. Check webhook is configured
2. Verify webhook URL is accessible
3. Check webhook logs in PayPal Dashboard
4. Manually call `/api/billing/individual/approve` with subscription ID

### "Already Have Subscription" Error

**Issue**: User can't subscribe, says they already have subscription

**Fix**:
1. Check database for existing `paypal_subscription_id`
2. Cancel old subscription if needed
3. Clear `paypal_subscription_id` if orphaned

### Organization Member Can't Subscribe Individually

**Issue**: User gets error when trying individual subscription

**Fix**: This is expected behavior. Users in organizations cannot have individual subscriptions (mutual exclusivity). They must leave the organization first.

---

## 📊 Monitoring

### Key Metrics to Track

1. **Subscription Success Rate**: Completed subscriptions / Started subscriptions
2. **Trial Conversion Rate**: Paid subscriptions / Trials started
3. **Churn Rate**: Cancellations / Active subscriptions
4. **MRR**: Monthly Recurring Revenue
5. **ARPU**: Average Revenue Per User

### Database Queries

```sql
-- Active individual subscriptions
SELECT COUNT(*)
FROM users
WHERE subscription_status = 'ACTIVE';

-- Active organization subscriptions
SELECT COUNT(*), SUM(seats)
FROM organizations
WHERE paypal_subscription_id IS NOT NULL;

-- Trials ending soon (next 7 days)
SELECT COUNT(*)
FROM users
WHERE trial_ends_at BETWEEN NOW() AND NOW() + INTERVAL '7 days';

-- Beta users
SELECT COUNT(*)
FROM users
WHERE is_beta_user = true;
```

---

## 🆘 Support

### PayPal Support

- Developer Documentation: https://developer.paypal.com/docs/subscriptions/
- Sandbox Testing: https://developer.paypal.com/dashboard/
- Production Issues: https://www.paypal.com/us/business/contact-us

### Implementation Files

- **Database**: `supabase/migrations/002_dual_billing_paypal.sql`
- **Backend APIs**: `app/api/billing/**/*.ts`
- **Webhook**: `app/api/webhooks/paypal/route.ts`
- **Components**: `components/billing/*.tsx`
- **Utilities**: `lib/paypal/*.ts`
- **Documentation**: `docs/PAYPAL-*.md`

---

## ✅ Next Steps

1. **Set up PayPal account and plans** (1-2 hours)
2. **Add components to your billing pages** (1 hour)
3. **Test in sandbox** (1 hour)
4. **Deploy to production** (30 min)
5. **Monitor and iterate** (ongoing)

**Total estimated time to go live**: 3-4 hours

You're ready to start accepting payments!
