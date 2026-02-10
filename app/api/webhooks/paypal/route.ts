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
 * Implements proper signature verification to prevent forged webhooks
 * https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#verify-webhook-signature
 */
async function verifyWebhookSignature(request: NextRequest, body: string): Promise<boolean> {
  // Extract required headers
  const webhookId = request.headers.get('paypal-transmission-id');
  const transmissionSig = request.headers.get('paypal-transmission-sig');
  const transmissionTime = request.headers.get('paypal-transmission-time');
  const certUrl = request.headers.get('paypal-cert-url');
  const authAlgo = request.headers.get('paypal-auth-algo');

  // Basic validation - all headers must be present
  if (!webhookId || !transmissionSig || !transmissionTime || !certUrl || !authAlgo) {
    console.error('[PayPal Webhook] Missing required headers', {
      hasWebhookId: !!webhookId,
      hasTransmissionSig: !!transmissionSig,
      hasTransmissionTime: !!transmissionTime,
      hasCertUrl: !!certUrl,
      hasAuthAlgo: !!authAlgo
    });
    return false;
  }

  // Verify webhook using PayPal's verification endpoint
  try {
    const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

    if (!PAYPAL_WEBHOOK_ID) {
      console.error('[PayPal Webhook] PAYPAL_WEBHOOK_ID not configured');
      // In development, allow if PAYPAL_WEBHOOK_ID is not set
      if (process.env.NODE_ENV === 'development') {
        console.warn('[PayPal Webhook] Development mode - skipping verification (INSECURE)');
        return true;
      }
      return false;
    }

    // Use PayPal's webhook verification API
    const isProduction = process.env.PAYPAL_MODE === 'live';
    const baseUrl = isProduction
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const authToken = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const verifyResponse = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken}`
      },
      body: JSON.stringify({
        transmission_id: webhookId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body)
      })
    });

    if (!verifyResponse.ok) {
      console.error('[PayPal Webhook] Verification API error', {
        status: verifyResponse.status,
        statusText: verifyResponse.statusText
      });
      return false;
    }

    const verification = await verifyResponse.json();

    if (verification.verification_status === 'SUCCESS') {
      console.log('[PayPal Webhook] Signature verified successfully');
      return true;
    } else {
      console.error('[PayPal Webhook] Signature verification failed', verification);
      return false;
    }

  } catch (error: any) {
    console.error('[PayPal Webhook] Verification error:', error.message);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Read the raw body for signature verification
    const body = await request.text();

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(request, body);
    if (!isValid) {
      console.error('[PayPal Webhook] Invalid webhook signature - potential forgery attempt');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('[PayPal Webhook] Event received and verified:', event.event_type);

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
