/**
 * POST /api/webhooks/paypal
 *
 * Handle PayPal subscription webhook events
 * https://developer.paypal.com/docs/api-basics/notifications/webhooks/event-names/
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verify PayPal webhook signature
 * In production, you should verify the webhook came from PayPal
 * https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#verify-webhook-signature
 */
async function verifyWebhookSignature(request: NextRequest): Promise<boolean> {
  // TODO: Implement PayPal webhook signature verification
  // For now, we'll trust the webhook (development only)
  // In production, MUST verify signature

  const webhookId = request.headers.get('paypal-transmission-id');
  const transmissionSig = request.headers.get('paypal-transmission-sig');
  const transmissionTime = request.headers.get('paypal-transmission-time');
  const certUrl = request.headers.get('paypal-cert-url');
  const authAlgo = request.headers.get('paypal-auth-algo');

  // Basic validation
  if (!webhookId || !transmissionSig || !transmissionTime) {
    console.error('Missing PayPal webhook headers');
    return false;
  }

  // In production, verify signature using PayPal SDK
  // https://github.com/paypal/PayPal-node-SDK/blob/master/samples/notifications/webhook-events/verify.js

  return true; // Development mode - accept all
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(request);
    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = await request.json();
    console.log('PayPal webhook event received:', event.event_type);

    const { event_type, resource } = event;

    // Handle different event types
    switch (event_type) {
      // Subscription activated
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(resource);
        break;

      // Subscription suspended (payment failure or manual suspension)
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(resource);
        break;

      // Subscription cancelled
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(resource);
        break;

      // Subscription expired (trial or billing period ended)
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handleSubscriptionExpired(resource);
        break;

      // Payment completed
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(resource);
        break;

      // Payment failed
      case 'PAYMENT.SALE.DENIED':
      case 'PAYMENT.SALE.REFUNDED':
        await handlePaymentFailed(resource);
        break;

      default:
        console.log(`Unhandled PayPal event type: ${event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionActivated(resource: any) {
  const subscriptionId = resource.id;
  const customId = resource.custom_id || '';

  console.log('Subscription activated:', subscriptionId);

  if (customId.startsWith('user_')) {
    // Individual user subscription
    const userId = customId.replace('user_', '');
    await supabase
      .from('users')
      .update({
        subscription_status: 'ACTIVE',
        paypal_subscriber_id: resource.subscriber?.payer_id,
        updated_at: new Date().toISOString(),
      })
      .eq('paypal_subscription_id', subscriptionId);
  } else if (customId.startsWith('org_')) {
    // Organization subscription
    const parts = customId.split('_');
    const orgId = parts[1];
    await supabase
      .from('organizations')
      .update({
        paypal_subscriber_id: resource.subscriber?.payer_id,
        updated_at: new Date().toISOString(),
      })
      .eq('paypal_subscription_id', subscriptionId);
  }
}

async function handleSubscriptionSuspended(resource: any) {
  const subscriptionId = resource.id;
  const customId = resource.custom_id || '';

  console.log('Subscription suspended:', subscriptionId);

  if (customId.startsWith('user_')) {
    const userId = customId.replace('user_', '');
    await supabase
      .from('users')
      .update({
        subscription_status: 'SUSPENDED',
        updated_at: new Date().toISOString(),
      })
      .eq('paypal_subscription_id', subscriptionId);
  }
  // Note: Organizations don't suspend, they cancel
}

async function handleSubscriptionCancelled(resource: any) {
  const subscriptionId = resource.id;
  const customId = resource.custom_id || '';

  console.log('Subscription cancelled:', subscriptionId);

  if (customId.startsWith('user_')) {
    const userId = customId.replace('user_', '');
    await supabase
      .from('users')
      .update({
        subscription_status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('paypal_subscription_id', subscriptionId);
  } else if (customId.startsWith('org_')) {
    // Organization cancelled - could trigger notifications or cleanup
    const parts = customId.split('_');
    const orgId = parts[1];
    await supabase
      .from('organizations')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('paypal_subscription_id', subscriptionId);
  }
}

async function handleSubscriptionExpired(resource: any) {
  const subscriptionId = resource.id;
  const customId = resource.custom_id || '';

  console.log('Subscription expired:', subscriptionId);

  if (customId.startsWith('user_')) {
    const userId = customId.replace('user_', '');
    await supabase
      .from('users')
      .update({
        subscription_status: 'EXPIRED',
        updated_at: new Date().toISOString(),
      })
      .eq('paypal_subscription_id', subscriptionId);
  }
}

async function handlePaymentCompleted(resource: any) {
  const billingAgreementId = resource.billing_agreement_id;

  console.log('Payment completed for subscription:', billingAgreementId);

  // Update last payment information
  // This is useful for tracking payment history
  // You could store this in a payments table for full history
}

async function handlePaymentFailed(resource: any) {
  const billingAgreementId = resource.billing_agreement_id;

  console.log('Payment failed for subscription:', billingAgreementId);

  // Handle failed payment
  // Could send notification to user, suspend account, etc.
}
