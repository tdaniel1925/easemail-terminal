/**
 * PayPal Subscription Management
 *
 * Handles creating, updating, and canceling PayPal subscriptions
 * for both individual users and organizations.
 */

import { getPayPalClient, PAYPAL_PLANS } from './client';
import { createClient } from '@supabase/supabase-js';
import { SubscriptionsController } from '@paypal/paypal-server-sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CreateSubscriptionParams {
  planId: string;
  returnUrl: string;
  cancelUrl: string;
  customId?: string; // User ID or org ID for tracking
}

export interface SubscriptionDetails {
  subscriptionId: string;
  subscriberId: string;
  status: string;
  approvalUrl?: string;
  nextBillingTime?: string;
}

/**
 * Create a new PayPal subscription
 * Returns approval URL that user must visit to approve the subscription
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<SubscriptionDetails> {
  const client = getPayPalClient();
  const subscriptions = new SubscriptionsController(client);

  try {
    const response = await subscriptions.createSubscription({
      body: {
        planId: params.planId,
        customId: params.customId,
        applicationContext: {
          brandName: 'EaseMail',
          locale: 'en-US',
          shippingPreference: 'NO_SHIPPING',
          userAction: 'SUBSCRIBE_NOW',
          paymentMethod: {
            payerSelected: 'PAYPAL',
            payeePreferred: 'IMMEDIATE_PAYMENT_REQUIRED',
          },
          returnUrl: params.returnUrl,
          cancelUrl: params.cancelUrl,
        },
      },
    });

    const subscription = response.result;
    const approvalLink = subscription.links?.find((link) => link.rel === 'approve');

    return {
      subscriptionId: subscription.id!,
      subscriberId: subscription.subscriber?.payerId || '',
      status: subscription.status!,
      approvalUrl: approvalLink?.href,
      nextBillingTime: subscription.billingInfo?.nextBillingTime,
    };
  } catch (error: any) {
    console.error('PayPal subscription creation error:', error);
    throw new Error(`Failed to create PayPal subscription: ${error.message}`);
  }
}

/**
 * Get subscription details from PayPal
 */
export async function getSubscription(subscriptionId: string): Promise<any> {
  const client = getPayPalClient();
  const subscriptions = new SubscriptionsController(client);

  try {
    const response = await subscriptions.getSubscription({
      id: subscriptionId,
    });

    return response.result;
  } catch (error: any) {
    console.error('PayPal get subscription error:', error);
    throw new Error(`Failed to get PayPal subscription: ${error.message}`);
  }
}

/**
 * Cancel a PayPal subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason?: string
): Promise<void> {
  const client = getPayPalClient();
  const subscriptions = new SubscriptionsController(client);

  try {
    await subscriptions.cancelSubscription({
      id: subscriptionId,
      body: {
        reason: reason || 'User requested cancellation',
      },
    });
  } catch (error: any) {
    console.error('PayPal cancel subscription error:', error);
    throw new Error(`Failed to cancel PayPal subscription: ${error.message}`);
  }
}

/**
 * Suspend a PayPal subscription
 */
export async function suspendSubscription(
  subscriptionId: string,
  reason?: string
): Promise<void> {
  const client = getPayPalClient();
  const subscriptions = new SubscriptionsController(client);

  try {
    await subscriptions.suspendSubscription({
      id: subscriptionId,
      body: {
        reason: reason || 'Account suspended',
      },
    });
  } catch (error: any) {
    console.error('PayPal suspend subscription error:', error);
    throw new Error(`Failed to suspend PayPal subscription: ${error.message}`);
  }
}

/**
 * Reactivate a suspended PayPal subscription
 */
export async function reactivateSubscription(
  subscriptionId: string,
  reason?: string
): Promise<void> {
  const client = getPayPalClient();
  const subscriptions = new SubscriptionsController(client);

  try {
    await subscriptions.activateSubscription({
      id: subscriptionId,
      body: {
        reason: reason || 'Account reactivated',
      },
    });
  } catch (error: any) {
    console.error('PayPal reactivate subscription error:', error);
    throw new Error(`Failed to reactivate PayPal subscription: ${error.message}`);
  }
}

/**
 * Update subscription quantity (for organization seat changes)
 * This requires canceling and recreating the subscription with new quantity
 */
export async function updateOrganizationSeats(
  organizationId: string,
  newSeats: number
): Promise<SubscriptionDetails> {
  // Get current organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (orgError || !org) {
    throw new Error('Organization not found');
  }

  // Cancel existing subscription if it exists
  if (org.paypal_subscription_id) {
    try {
      await cancelSubscription(
        org.paypal_subscription_id,
        'Upgrading to new seat count'
      );
    } catch (error) {
      console.error('Error canceling old subscription:', error);
      // Continue anyway
    }
  }

  // Determine new plan based on seat count
  const planId = newSeats >= 10 ? PAYPAL_PLANS.GROWTH : PAYPAL_PLANS.TEAM;

  // Create new subscription
  const subscription = await createSubscription({
    planId,
    returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/app/settings/organization/billing/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/app/settings/organization/billing`,
    customId: `org_${organizationId}_seats_${newSeats}`,
  });

  // Update organization with new subscription
  await supabase
    .from('organizations')
    .update({
      seats: newSeats,
      seats_used: Math.min(org.seats_used || 0, newSeats),
      paypal_subscription_id: subscription.subscriptionId,
      paypal_subscriber_id: subscription.subscriberId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  return subscription;
}

/**
 * Create individual user subscription
 */
export async function createIndividualSubscription(
  userId: string
): Promise<SubscriptionDetails> {
  // Check if user can have individual subscription
  const { data: canHave } = await supabase.rpc('can_have_individual_subscription', {
    user_id_param: userId,
  });

  if (!canHave) {
    throw new Error('User is part of an organization and cannot have individual subscription');
  }

  // Create subscription
  const subscription = await createSubscription({
    planId: PAYPAL_PLANS.INDIVIDUAL,
    returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/app/settings/billing/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/app/settings/billing`,
    customId: `user_${userId}`,
  });

  // Update user with subscription info
  await supabase
    .from('users')
    .update({
      paypal_subscription_id: subscription.subscriptionId,
      paypal_subscriber_id: subscription.subscriberId,
      subscription_status: subscription.status,
      trial_started_at: new Date().toISOString(),
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return subscription;
}

/**
 * Create organization subscription
 */
export async function createOrganizationSubscription(
  organizationId: string,
  seats: number
): Promise<SubscriptionDetails> {
  const planId = seats >= 10 ? PAYPAL_PLANS.GROWTH : PAYPAL_PLANS.TEAM;

  const subscription = await createSubscription({
    planId,
    returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/app/settings/organization/billing/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/app/settings/organization/billing`,
    customId: `org_${organizationId}_seats_${seats}`,
  });

  // Update organization with subscription info
  await supabase
    .from('organizations')
    .update({
      paypal_subscription_id: subscription.subscriptionId,
      paypal_subscriber_id: subscription.subscriberId,
      seats,
      trial_started_at: new Date().toISOString(),
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  return subscription;
}

/**
 * Approve subscription after user returns from PayPal
 * This is called after user approves on PayPal's site
 */
export async function approveSubscription(
  subscriptionId: string,
  subscriberId: string
): Promise<void> {
  // Get subscription details to verify it's active
  const subscription = await getSubscription(subscriptionId);

  if (subscription.status !== 'ACTIVE') {
    throw new Error(`Subscription not active. Status: ${subscription.status}`);
  }

  // Update in database based on subscription type
  const customId = subscription.customId || '';

  if (customId.startsWith('user_')) {
    const userId = customId.replace('user_', '');
    await supabase
      .from('users')
      .update({
        paypal_subscriber_id: subscriberId,
        subscription_status: 'ACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } else if (customId.startsWith('org_')) {
    const parts = customId.split('_');
    const orgId = parts[1];
    await supabase
      .from('organizations')
      .update({
        paypal_subscriber_id: subscriberId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);
  }
}
