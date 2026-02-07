# EaseMail PayPal Billing - Complete Implementation Guide

## Executive Summary

Your billing system uses **PayPal Subscriptions API** for all payments:

### Account Types

1. **Individual Users**
   - Pay $20/month after 14-day trial
   - PayPal required upfront for trial
   - Billing attached to user record

2. **Organization Users**
   - Organization pays for all seats
   - No individual billing responsibility

3. **Beta Mode** (Current)
   - FREE for everyone
   - No PayPal charges
   - System-wide flag controls billing

### Key Differences: PayPal vs Stripe

**Advantages of PayPal**:
- No merchant account needed
- Users can pay with PayPal balance, cards, or bank account
- Lower international fees
- Familiar payment method (especially outside US)
- Buyer protection built-in

**PayPal-Specific Features**:
- Subscription IDs format: `I-xxxxxxxx`
- Billing agreements required
- Webhooks for subscription events
- No customer objects (just payer IDs)

---

## Database Schema (PayPal Fields)

### Users Table Fields
```sql
paypal_subscriber_id    TEXT   -- PayPal subscriber/customer ID
paypal_subscription_id  TEXT   -- Subscription ID (I-xxx format)
paypal_payer_id         TEXT   -- Payer ID
paypal_email            TEXT   -- PayPal account email
subscription_status     TEXT   -- ACTIVE, SUSPENDED, CANCELLED, etc.
trial_ends_at           TIMESTAMPTZ
trial_started_at        TIMESTAMPTZ
is_beta_user            BOOLEAN DEFAULT TRUE
```

### Organizations Table Fields
```sql
paypal_subscription_id  TEXT   -- Org subscription ID
paypal_subscriber_id    TEXT   -- Subscriber ID
paypal_email            TEXT   -- Billing contact email
trial_ends_at           TIMESTAMPTZ
trial_started_at        TIMESTAMPTZ
```

---

## PayPal Setup Guide

### Step 1: Create PayPal Business Account

1. Go to https://www.paypal.com/bizsignup
2. Sign up for Business account
3. Verify your email and bank account
4. Complete business profile

### Step 2: Get API Credentials

1. Go to https://developer.paypal.com/dashboard
2. Navigate to "My Apps & Credentials"
3. Under "REST API apps" click "Create App"
4. Name it "EaseMail Billing"
5. Copy your credentials:
   - **Client ID**: `AXxxx...`
   - **Secret**: `ELxxx...`

**Important**: Use **Sandbox** credentials for testing, **Live** for production

### Step 3: Create Subscription Plans

PayPal subscriptions require pre-created plans. Create these in PayPal dashboard:

1. Go to https://www.paypal.com/billing/plans
2. Click "Create Plan"

**Individual Plan**:
- Name: "EaseMail Individual"
- Billing Cycle: Monthly
- Price: $20.00 USD
- Trial: 14 days free
- Plan ID: Copy this (P-xxx...)

**Team Plan** (2-10 seats):
- Name: "EaseMail Team"
- Billing Cycle: Monthly
- Price: $18.00 USD per seat
- Plan ID: Copy this

**Growth Plan** (11-49 seats):
- Name: "EaseMail Growth"
- Billing Cycle: Monthly
- Price: $15.00 USD per seat
- Plan ID: Copy this

### Step 4: Set Environment Variables

Add to `.env.local`:

```bash
# PayPal API Credentials
PAYPAL_CLIENT_ID=AXxxx...  # From Step 2
PAYPAL_CLIENT_SECRET=ELxxx...  # From Step 2
PAYPAL_MODE=sandbox  # Use 'live' for production

# PayPal Plan IDs (from Step 3)
PAYPAL_INDIVIDUAL_PLAN_ID=P-xxx...  # $20/month individual
PAYPAL_TEAM_PLAN_ID=P-xxx...        # $18/seat team
PAYPAL_GROWTH_PLAN_ID=P-xxx...      # $15/seat growth

# PayPal Webhook ID (will set up later)
PAYPAL_WEBHOOK_ID=xxx...

# Your app URL
NEXT_PUBLIC_APP_URL=https://www.easemail.app
```

---

## PayPal Integration Code

### 1. Install PayPal SDK

```bash
npm install @paypal/checkout-server-sdk
```

### 2. Create PayPal Client

**File**: `lib/paypal/client.ts`

```typescript
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  if (process.env.PAYPAL_MODE === 'live') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  }
}

export function getPayPalClient() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

// Helper to get access token for API calls
export async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(
    `https://api${process.env.PAYPAL_MODE === 'sandbox' ? '-m.sandbox' : ''}.paypal.com/v1/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    }
  );

  const data = await response.json();
  return data.access_token;
}

// Helper for API requests
export async function paypalRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  const token = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_MODE === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayPal API Error: ${JSON.stringify(error)}`);
  }

  return response.json();
}
```

### 3. Subscription Management

**File**: `lib/paypal/subscriptions.ts`

```typescript
import { paypalRequest } from './client';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function createIndividualSubscription(
  userId: string,
  userEmail: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ subscriptionId: string; approvalUrl: string }> {
  // Check beta mode
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: settings } = await serviceClient
    .from('system_settings')
    .select('value')
    .eq('key', 'beta_mode')
    .single();

  if (settings?.value?.enabled) {
    throw new Error('Billing disabled during beta');
  }

  // Create subscription with PayPal
  const subscription = await paypalRequest('/v1/billing/subscriptions', 'POST', {
    plan_id: process.env.PAYPAL_INDIVIDUAL_PLAN_ID,
    subscriber: {
      email_address: userEmail,
    },
    application_context: {
      brand_name: 'EaseMail',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  });

  // Find approval link
  const approvalLink = subscription.links.find((link: any) => link.rel === 'approve');

  // Store subscription ID in database (pending approval)
  await serviceClient
    .from('users')
    .update({
      paypal_subscription_id: subscription.id,
      subscription_status: 'APPROVAL_PENDING',
      trial_started_at: new Date().toISOString(),
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', userId);

  return {
    subscriptionId: subscription.id,
    approvalUrl: approvalLink.href,
  };
}

export async function activateSubscription(
  subscriptionId: string
): Promise<void> {
  // Activate the subscription after user approves
  await paypalRequest(`/v1/billing/subscriptions/${subscriptionId}/activate`, 'POST');
}

export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<any> {
  return paypalRequest(`/v1/billing/subscriptions/${subscriptionId}`, 'GET');
}

export async function cancelSubscription(
  subscriptionId: string,
  reason: string = 'User cancelled'
): Promise<void> {
  await paypalRequest(
    `/v1/billing/subscriptions/${subscriptionId}/cancel`,
    'POST',
    { reason }
  );
}

export async function updateOrganizationSeats(
  organizationId: string,
  newSeats: number
): Promise<void> {
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get organization
  const { data: org } = await serviceClient
    .from('organizations')
    .select('paypal_subscription_id, seats, plan')
    .eq('id', organizationId)
    .single();

  if (!org?.paypal_subscription_id) {
    throw new Error('No PayPal subscription found');
  }

  // Determine plan based on seats
  let planId;
  if (newSeats >= 2 && newSeats <= 10) {
    planId = process.env.PAYPAL_TEAM_PLAN_ID;
  } else if (newSeats >= 11) {
    planId = process.env.PAYPAL_GROWTH_PLAN_ID;
  } else {
    throw new Error('Invalid seat count for organization');
  }

  // Update subscription quantity in PayPal
  await paypalRequest(
    `/v1/billing/subscriptions/${org.paypal_subscription_id}/revise`,
    'POST',
    {
      plan_id: planId,
      quantity: newSeats.toString(),
    }
  );

  // Update database
  await serviceClient
    .from('organizations')
    .update({
      seats: newSeats,
      seats_used: Math.min(newSeats, org.seats),
    })
    .eq('id', organizationId);
}
```

---

## API Endpoints

### Individual Subscription - Start Trial

**File**: `app/api/billing/individual/create-subscription/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createIndividualSubscription } from '@/lib/paypal/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can have individual subscription
    const { data: canSubscribe } = await supabase.rpc('can_have_individual_subscription', {
      user_id_param: user.id
    });

    if (!canSubscribe) {
      return NextResponse.json(
        { error: 'Cannot create subscription while part of organization' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${appUrl}/billing/subscription/success`;
    const cancelUrl = `${appUrl}/billing/subscription/cancelled`;

    const { subscriptionId, approvalUrl } = await createIndividualSubscription(
      user.id,
      user.email!,
      returnUrl,
      cancelUrl
    );

    return NextResponse.json({
      subscriptionId,
      approvalUrl,
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Subscription Approval Callback

**File**: `app/api/billing/individual/approve-subscription/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { activateSubscription, getSubscriptionDetails } from '@/lib/paypal/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = await request.json();

    // Activate subscription
    await activateSubscription(subscriptionId);

    // Get subscription details
    const details = await getSubscriptionDetails(subscriptionId);

    // Update database
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await serviceClient
      .from('users')
      .update({
        paypal_subscription_id: subscriptionId,
        paypal_subscriber_id: details.subscriber.payer_id,
        paypal_payer_id: details.subscriber.payer_id,
        paypal_email: details.subscriber.email_address,
        subscription_status: 'ACTIVE',
      })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Approve subscription error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Cancel Subscription

**File**: `app/api/billing/individual/cancel/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { cancelSubscription } from '@/lib/paypal/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's subscription
    const { data: userData } = await serviceClient
      .from('users')
      .select('paypal_subscription_id')
      .eq('id', user.id)
      .single();

    if (!userData?.paypal_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      );
    }

    // Cancel in PayPal
    await cancelSubscription(userData.paypal_subscription_id);

    // Update database
    await serviceClient
      .from('users')
      .update({
        subscription_status: 'CANCELLED',
      })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## PayPal Webhooks

### Setup Webhook in PayPal Dashboard

1. Go to https://developer.paypal.com/dashboard/webhooks
2. Click "Add Webhook"
3. Webhook URL: `https://www.easemail.app/api/webhooks/paypal`
4. Select events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.REFUNDED`
5. Copy the Webhook ID
6. Add to `.env.local`: `PAYPAL_WEBHOOK_ID=xxx...`

### Webhook Handler

**File**: `app/api/webhooks/paypal/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { paypalRequest } from '@/lib/paypal/client';

// Verify webhook signature
async function verifyWebhook(request: NextRequest): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID!;
  const headers = {
    'transmission-id': request.headers.get('paypal-transmission-id'),
    'transmission-time': request.headers.get('paypal-transmission-time'),
    'cert-url': request.headers.get('paypal-cert-url'),
    'auth-algo': request.headers.get('paypal-auth-algo'),
    'transmission-sig': request.headers.get('paypal-transmission-sig'),
  };

  const body = await request.text();

  try {
    const verification = await paypalRequest('/v1/notifications/verify-webhook-signature', 'POST', {
      transmission_id: headers['transmission-id'],
      transmission_time: headers['transmission-time'],
      cert_url: headers['cert-url'],
      auth_algo: headers['auth-algo'],
      transmission_sig: headers['transmission-sig'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    });

    return verification.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const isValid = await verifyWebhook(request);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = await request.json();
    const eventType = event.event_type;
    const resource = event.resource;

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        // Update subscription status to ACTIVE
        await serviceClient
          .from('users')
          .update({ subscription_status: 'ACTIVE' })
          .eq('paypal_subscription_id', resource.id);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        // Update subscription status
        await serviceClient
          .from('users')
          .update({ subscription_status: 'CANCELLED' })
          .eq('paypal_subscription_id', resource.id);
        break;

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        // Handle payment failures
        await serviceClient
          .from('users')
          .update({ subscription_status: 'SUSPENDED' })
          .eq('paypal_subscription_id', resource.id);
        break;

      case 'BILLING.SUBSCRIPTION.UPDATED':
        // Handle subscription updates (seat changes, etc.)
        break;

      case 'PAYMENT.SALE.COMPLETED':
        // Payment succeeded
        console.log('Payment completed:', resource.id);
        break;

      case 'PAYMENT.SALE.REFUNDED':
        // Handle refunds
        console.log('Payment refunded:', resource.id);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Frontend Integration

### PayPal Button Component

**File**: `components/billing/PayPalSubscribeButton.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface PayPalButtonProps {
  onApprove: (subscriptionId: string) => void;
  onCancel: () => void;
}

export function PayPalSubscribeButton({ onApprove, onCancel }: PayPalButtonProps) {
  useEffect(() => {
    if (window.paypal) {
      renderButton();
    }
  }, []);

  const renderButton = () => {
    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe',
      },
      createSubscription: async (data: any, actions: any) => {
        // Call your API to create subscription
        const response = await fetch('/api/billing/individual/create-subscription', {
          method: 'POST',
        });
        const { subscriptionId } = await response.json();
        return subscriptionId;
      },
      onApprove: async (data: any) => {
        // Call your API to activate subscription
        await fetch('/api/billing/individual/approve-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId: data.subscriptionID }),
        });
        onApprove(data.subscriptionID);
      },
      onCancel: () => {
        onCancel();
      },
    }).render('#paypal-button-container');
  };

  return (
    <>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`}
        onLoad={renderButton}
      />
      <div id="paypal-button-container" />
    </>
  );
}
```

---

## Summary: Next Steps

1. ✅ **Apply Database Migration**
   - Use `002_dual_billing_paypal.sql`
   - Adds all PayPal fields

2. **Set Up PayPal**
   - Get API credentials
   - Create subscription plans
   - Set environment variables

3. **Install & Configure**
   - `npm install @paypal/checkout-server-sdk`
   - Create PayPal client files
   - Create subscription management utilities

4. **Build APIs**
   - Create subscription endpoint
   - Approval callback
   - Cancel endpoint
   - Webhook handler

5. **Frontend**
   - Add PayPal button component
   - Update pricing page
   - Build subscription dashboard

6. **Test in Sandbox**
   - Use PayPal sandbox accounts
   - Test full subscription flow
   - Verify webhooks work

7. **Go Live**
   - Switch to live credentials
   - Update webhook URL
   - Monitor for errors

The PayPal integration is actually simpler than Stripe in many ways - no complex customer objects, straightforward subscription API, and built-in trial support. Let me know when you're ready to start implementing!
