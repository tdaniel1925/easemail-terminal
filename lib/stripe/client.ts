import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as any,
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripe = getStripeClient;

export function getStripePlans() {
  return {
    PRO: {
      name: 'Pro',
      price: 1200, // $12.00 in cents
      priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    },
    BUSINESS: {
      name: 'Business',
      price: 2500, // $25.00 per seat in cents
      priceId: process.env.STRIPE_BUSINESS_PRICE_ID || '',
    },
  };
}

export const STRIPE_PLANS = getStripePlans();

export async function createCheckoutSession(params: {
  organizationId: string;
  plan: 'PRO' | 'BUSINESS';
  seats?: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
}) {
  const { organizationId, plan, seats = 1, successUrl, cancelUrl, customerEmail } = params;

  const planConfig = getStripePlans()[plan];
  const stripeClient = getStripeClient();

  const session = await stripeClient.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price: planConfig.priceId,
        quantity: plan === 'BUSINESS' ? seats : 1,
      },
    ],
    subscription_data: {
      metadata: {
        organizationId,
        plan,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session;
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const stripeClient = getStripeClient();
  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function updateSubscriptionSeats(subscriptionId: string, newSeats: number) {
  const stripeClient = getStripeClient();
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);

  const updatedSubscription = await stripeClient.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        quantity: newSeats,
      },
    ],
    proration_behavior: 'always_invoice',
  });

  return updatedSubscription;
}

export async function cancelSubscription(subscriptionId: string, immediately = false) {
  const stripeClient = getStripeClient();
  if (immediately) {
    return await stripeClient.subscriptions.cancel(subscriptionId);
  } else {
    return await stripeClient.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}
