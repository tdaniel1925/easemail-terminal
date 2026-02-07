# EaseMail Dual Billing Model - Complete Implementation Plan

## Executive Summary

Based on your requirements, here's how EaseMail's billing system works:

### Account Types

1. **Individual Users**
   - Have their own account
   - Pay $20/month after 14-day trial
   - Credit card required upfront for trial
   - Billing attached to user record
   - Cannot be part of an organization (mutual exclusivity)

2. **Organization Users**
   - Created/invited by organization
   - Organization pays for their seat
   - No individual billing responsibility
   - Cannot have personal subscription while in org

3. **Beta Users** (Current State)
   - NO billing during beta
   - Everyone gets full access for free
   - Beta mode flag controls this system-wide

### Key Business Rules

- **Mutual Exclusivity**: Users CANNOT have both individual subscription AND be org member
- **Auto-Cancellation**: When user joins org, individual subscription automatically cancels
- **Auto-Upgrade**: When org adds users beyond seat limit, subscription auto-upgrades
- **Same Features**: Individual and org users get identical features (no tiering)
- **Trial**: 14 days, credit card required upfront

---

## Current State vs Desired State

### What You Currently Have ✅

- Organizations table with Stripe fields
- Users table (but NO billing fields)
- Organization members junction table
- Proper RLS policies
- Service client for admin operations

### What's Missing ❌

- Individual user billing fields (Stripe customer/subscription)
- Trial management fields
- Beta mode system flag
- Mutual exclusivity enforcement
- Auto-upgrade logic
- Migration logic (individual → org)

---

## Implementation Steps

### STEP 1: Apply Database Migration ⚠️ REQUIRED FIRST

**File Created**: `supabase/migrations/002_dual_billing_model.sql`

**How to Apply** (Choose ONE method):

#### Option A: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb/sql/new
2. Copy entire contents of `002_dual_billing_model.sql`
3. Paste into SQL Editor
4. Click "Run"

#### Option B: Supabase CLI
```bash
npx supabase db push
# Enter database password when prompted
```

#### Option C: Direct psql (if installed)
```bash
PGPASSWORD=your_password psql \
  -h aws-0-us-west-2.pooler.supabase.com \
  -p 6543 \
  -d postgres \
  -U postgres.bfswjaswmfwvpwvrsqdb \
  -f supabase/migrations/002_dual_billing_model.sql
```

**What This Migration Does**:

1. Adds billing fields to `users` table:
   - `stripe_customer_id`
   - `stripe_subscription_id`
   - `subscription_status`
   - `trial_ends_at`
   - `trial_started_at`
   - `is_beta_user`

2. Adds trial fields to `organizations` table:
   - `trial_ends_at`
   - `trial_started_at`

3. Creates `system_settings` table for beta mode flag

4. Creates utility functions:
   - `can_have_individual_subscription(user_id)` - Checks if user can have personal billing
   - `is_beta_user(user_id)` - Checks if user is in beta
   - `should_enforce_billing()` - Returns FALSE during beta
   - `get_subscription_context(user_id)` - Returns 'beta', 'individual', 'organization', or 'none'

5. Creates triggers:
   - `prevent_dual_subscription` - Auto-cancels individual sub when joining org
   - `auto_upgrade_seats` - Auto-upgrades org subscription when seats exceeded

6. Adds indexes for performance

---

### STEP 2: Create TypeScript Types

**File to Create**: `types/billing.ts`

```typescript
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'past_due'
  | 'pending_cancellation';

export type SubscriptionContext =
  | 'beta'
  | 'individual'
  | 'organization'
  | 'none';

export interface UserBilling {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  trial_ends_at: string | null;
  trial_started_at: string | null;
  is_beta_user: boolean;
}

export interface OrganizationBilling {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  seats: number;
  seats_used: number;
  trial_ends_at: string | null;
  trial_started_at: string | null;
}

export interface SystemSettings {
  beta_mode: {
    enabled: boolean;
    disabled_at: string | null;
  };
}
```

---

### STEP 3: Create Subscription Utilities

**File to Create**: `lib/billing/subscription.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function getSubscriptionContext(userId: string): Promise<SubscriptionContext> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase.rpc('get_subscription_context', {
    user_id_param: userId
  });

  return data as SubscriptionContext;
}

export async function isBetaMode(): Promise<boolean> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'beta_mode')
    .single();

  return data?.value?.enabled === true;
}

export async function startIndividualTrial(
  userId: string,
  email: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
  // Check if beta mode
  const betaMode = await isBetaMode();
  if (betaMode) {
    return { success: true }; // No billing during beta
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: process.env.STRIPE_INDIVIDUAL_PRICE_ID!, // $20/month price ID
      }],
      trial_period_days: 14,
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
    });

    // Update user record
    const { error } = await serviceClient
      .from('users')
      .update({
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        subscription_status: 'trialing',
        trial_started_at: new Date().toISOString(),
        trial_ends_at: new Date(subscription.trial_end! * 1000).toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Start trial error:', error);
    return { success: false, error: error.message };
  }
}

export async function cancelIndividualSubscription(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get user's subscription
    const { data: user } = await serviceClient
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (!user?.stripe_subscription_id) {
      return { success: true }; // No subscription to cancel
    }

    // Cancel in Stripe
    await stripe.subscriptions.cancel(user.stripe_subscription_id);

    // Update database
    await serviceClient
      .from('users')
      .update({
        subscription_status: 'canceled',
        stripe_subscription_id: null,
      })
      .eq('id', userId);

    return { success: true };
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return { success: false, error: error.message };
  }
}

export async function upgradeOrganizationSeats(
  organizationId: string,
  newSeats: number
): Promise<{ success: boolean; error?: string }> {
  // Check if beta mode
  const betaMode = await isBetaMode();
  if (betaMode) {
    // Just update database, no Stripe call
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await serviceClient
      .from('organizations')
      .update({ seats: newSeats })
      .eq('id', organizationId);

    return { success: true };
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get organization's subscription
    const { data: org } = await serviceClient
      .from('organizations')
      .select('stripe_subscription_id, seats, plan')
      .eq('id', organizationId)
      .single();

    if (!org?.stripe_subscription_id) {
      throw new Error('No subscription found');
    }

    // Update Stripe subscription
    const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id);
    const item = subscription.items.data[0];

    await stripe.subscriptions.update(org.stripe_subscription_id, {
      items: [{
        id: item.id,
        quantity: newSeats,
      }],
      proration_behavior: 'always_invoice',
    });

    // Update database
    await serviceClient
      .from('organizations')
      .update({
        seats: newSeats,
        seats_used: Math.min(newSeats, org.seats),
      })
      .eq('id', organizationId);

    return { success: true };
  } catch (error: any) {
    console.error('Upgrade seats error:', error);
    return { success: false, error: error.message };
  }
}
```

---

### STEP 4: Update Pricing Page

**File**: `app/(app)/app/pricing/page.tsx`

Update pricing to reflect:
- Individual: $20/month (was $30)
- Organization: Tiered per seat
- Beta banner: "Currently in FREE BETA - No billing yet"

```typescript
const pricingTiers = [
  {
    name: 'Individual',
    price: '$20',
    description: 'For personal use',
    features: [
      'Unlimited email accounts',
      'AI-powered composition',
      'Voice-to-email dictation',
      'Smart categorization',
      'Calendar & contacts sync',
      '2FA security',
      'Mobile access',
      'Priority support',
    ],
    cta: 'Start 14-Day Trial',
    popular: false,
  },
  {
    name: 'Team',
    price: '$18',
    priceDetail: 'per seat/month',
    description: '2-10 users',
    features: [
      'Everything in Individual',
      'Shared templates',
      'Team analytics',
      'Centralized billing',
      'Admin controls',
      'Bulk user management',
    ],
    cta: 'Start Team Trial',
    popular: true,
  },
  {
    name: 'Growth',
    price: '$15',
    priceDetail: 'per seat/month',
    description: '11-49 users',
    features: [
      'Everything in Team',
      'Advanced analytics',
      'API access',
      'Custom workflows',
      'Priority onboarding',
    ],
    cta: 'Start Growth Trial',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: '50+ users',
    features: [
      'Everything in Growth',
      'White-label branding',
      'Dedicated support',
      'SLA guarantees',
      'SSO/SAML',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];
```

---

### STEP 5: Create API Endpoints

**Individual Subscription Management**

**File**: `app/api/billing/individual/start-trial/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startIndividualTrial } from '@/lib/billing/subscription';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method required' },
        { status: 400 }
      );
    }

    // Check if user can have individual subscription
    const { data: canSubscribe } = await supabase.rpc('can_have_individual_subscription', {
      user_id_param: user.id
    });

    if (!canSubscribe) {
      return NextResponse.json(
        { error: 'Cannot create individual subscription while part of organization' },
        { status: 400 }
      );
    }

    const result = await startIndividualTrial(
      user.id,
      user.email!,
      paymentMethodId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Start trial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**File**: `app/api/billing/individual/cancel/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelIndividualSubscription } from '@/lib/billing/subscription';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await cancelIndividualSubscription(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### STEP 6: Update Organization Member Creation

**File**: `app/api/admin/organizations/wizard/route.ts`

Add logic to auto-cancel individual subscriptions when users are added to organizations.

Around line 100, after creating auth user, add:

```typescript
// Check if user had individual subscription
const { data: existingUser } = await serviceClient
  .from('users')
  .select('stripe_subscription_id')
  .eq('id', newAuthUser.user.id)
  .single();

// If they have individual subscription, cancel it
if (existingUser?.stripe_subscription_id) {
  await cancelIndividualSubscription(newAuthUser.user.id);
  console.log(`Canceled individual subscription for user joining org: ${newAuthUser.user.email}`);
}
```

---

### STEP 7: Create Beta Mode Toggle (Super Admin Only)

**File**: `app/api/admin/system/beta-mode/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
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

    // Check super admin
    const { data: userData } = await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get beta mode setting
    const { data } = await serviceClient
      .from('system_settings')
      .select('value')
      .eq('key', 'beta_mode')
      .single();

    return NextResponse.json({ betaMode: data?.value });
  } catch (error: any) {
    console.error('Get beta mode error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Check super admin
    const { data: userData } = await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { enabled } = await request.json();

    // Update beta mode
    const { error } = await serviceClient
      .from('system_settings')
      .update({
        value: {
          enabled,
          disabled_at: enabled ? null : new Date().toISOString()
        }
      })
      .eq('key', 'beta_mode');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update beta mode error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### STEP 8: Environment Variables

Add to `.env.local`:

```bash
# Stripe (already have these)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# NEW: Stripe Price IDs
STRIPE_INDIVIDUAL_PRICE_ID=price_... # $20/month individual plan
STRIPE_TEAM_PRICE_ID=price_...       # $18/seat/month (2-10 seats)
STRIPE_GROWTH_PRICE_ID=price_...     # $15/seat/month (11-49 seats)
```

You'll need to create these prices in Stripe Dashboard:
1. Go to https://dashboard.stripe.com/products
2. Create product: "EaseMail Individual" - $20/month recurring
3. Create product: "EaseMail Team" - $18/seat/month recurring
4. Create product: "EaseMail Growth" - $15/seat/month recurring
5. Copy the price IDs (start with `price_...`)

---

## Testing Plan

### Test Scenario 1: Individual User Lifecycle

1. **Sign Up**
   - Create new account
   - Should be in beta mode (no billing)
   - Verify `is_beta_user = true`

2. **Start Trial** (After beta ends)
   - Add payment method
   - Start trial
   - Verify Stripe customer created
   - Verify trial ends in 14 days

3. **Trial to Paid**
   - Wait for trial to end (or fast-forward in Stripe test mode)
   - Verify subscription becomes `active`
   - Verify charge of $20

4. **Join Organization**
   - Get invited to organization
   - Accept invite
   - Verify individual subscription canceled
   - Verify now part of organization

### Test Scenario 2: Organization Creation

1. **Super Admin Creates Org**
   - Use wizard to create org with 5 users
   - Verify all users created
   - Verify org shows `seats = 5, seats_used = 5`
   - During beta: No Stripe charges

2. **Add 6th User**
   - Admin adds one more user
   - Verify `seats` auto-upgrades to 6
   - After beta ends: Verify Stripe subscription updated

### Test Scenario 3: Beta to Paid Migration

1. **Super Admin Disables Beta**
   - Toggle beta mode OFF
   - System sends emails to all users: "Beta ending, add payment"

2. **Individual Users Add Payment**
   - 7-day grace period
   - Users add payment methods
   - Subscriptions start

3. **Organizations Add Payment**
   - Org owners add payment methods
   - Subscriptions start based on current seats

---

## Stripe Webhook Handler

**File**: `app/api/webhooks/stripe/route.ts`

Update to handle individual user events:

```typescript
// Add these event handlers

case 'customer.subscription.created':
case 'customer.subscription.updated':
  // Update user subscription status
  const subscription = event.data.object as Stripe.Subscription;

  // Check if it's individual or organization subscription
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single();

  if (user) {
    // Individual subscription
    await supabase
      .from('users')
      .update({
        subscription_status: subscription.status,
        stripe_subscription_id: subscription.id,
      })
      .eq('id', user.id);
  } else {
    // Organization subscription
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (org) {
      await supabase
        .from('organizations')
        .update({
          stripe_subscription_id: subscription.id,
        })
        .eq('id', org.id);
    }
  }
  break;

case 'customer.subscription.deleted':
  // Handle subscription cancellation
  const deletedSub = event.data.object as Stripe.Subscription;

  await supabase
    .from('users')
    .update({
      subscription_status: 'canceled',
      stripe_subscription_id: null,
    })
    .eq('stripe_customer_id', deletedSub.customer);
  break;
```

---

## Migration from Beta to Paid

When you're ready to end beta and start charging:

### Super Admin Dashboard

Create page at `/app/admin/system` with:

1. **Beta Mode Toggle**
   - Current status
   - "End Beta" button
   - Confirmation dialog

2. **Migration Dashboard**
   - Total users
   - Users with payment methods
   - Users without payment methods
   - Organizations ready for billing
   - Send reminder emails

3. **Email Templates**
   - 30 days before: "Beta ending soon"
   - 14 days before: "Add payment method"
   - 7 days before: "Final reminder"
   - Day of: "Beta ended - Add payment to continue"
   - After: "Your account is suspended - Add payment"

---

## Security Considerations

1. **Never expose Stripe secret keys** in client-side code
2. **Always verify webhook signatures** to prevent fake events
3. **Use service role key** for all billing operations
4. **Log all billing events** for audit trail
5. **Encrypt sensitive data** (payment method details)
6. **Rate limit** billing endpoints to prevent abuse
7. **Validate all amounts** before creating charges

---

## Summary: What This Achieves

✅ Individual users can have their own subscriptions
✅ Organization users are paid for by the organization
✅ Users CANNOT be both (mutual exclusivity enforced)
✅ 14-day trial with credit card upfront
✅ Beta mode disables all billing
✅ Auto-cancellation when joining org
✅ Auto-upgrade when org exceeds seats
✅ Same features for all paid users
✅ Proper trial management
✅ Comprehensive audit trail

---

## Next Steps

1. ✅ **Apply database migration** (CRITICAL - Do this first!)
2. Create TypeScript types
3. Implement subscription utilities
4. Create API endpoints
5. Update pricing page
6. Create Stripe products/prices
7. Test thoroughly in Stripe test mode
8. Deploy to production
9. Monitor for errors
10. Prepare beta-to-paid migration plan

---

## Questions?

Review this document carefully. When ready to proceed, we'll:
1. Apply the migration
2. Build the subscription management system
3. Update the UI
4. Test everything
5. Prepare for launch

The foundation is solid - now we just need to build on top of it!
