/**
 * PayPal Client Utility
 *
 * Provides authenticated PayPal API client for subscription management.
 * Uses the official PayPal Server SDK.
 */

import { Client, LogLevel, Environment } from '@paypal/paypal-server-sdk';

// Validate environment variables
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.warn('PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
}

// Determine environment (sandbox vs production)
const environment = process.env.PAYPAL_MODE === 'production'
  ? Environment.Production
  : Environment.Sandbox;

/**
 * Creates and returns an authenticated PayPal client
 */
export function getPayPalClient() {
  const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    },
    timeout: 0,
    environment,
    logging: {
      logLevel: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Error,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  });

  return paypalClient;
}

/**
 * PayPal Plan IDs (configured in your PayPal Dashboard)
 * You need to create these subscription plans in PayPal first
 */
export const PAYPAL_PLANS = {
  // Individual user plan: $20/month
  INDIVIDUAL: process.env.PAYPAL_PLAN_INDIVIDUAL || '',

  // Organization plans (per seat pricing)
  TEAM: process.env.PAYPAL_PLAN_TEAM || '',        // $18/seat/month (2-9 seats)
  GROWTH: process.env.PAYPAL_PLAN_GROWTH || '',    // $15/seat/month (10+ seats)
} as const;

/**
 * Get the appropriate organization plan based on seat count
 */
export function getOrganizationPlan(seats: number): string {
  if (seats >= 10) {
    return PAYPAL_PLANS.GROWTH;
  }
  return PAYPAL_PLANS.TEAM;
}

/**
 * Calculate monthly price for organization
 */
export function calculateOrganizationPrice(seats: number): number {
  if (seats >= 10) {
    return seats * 15; // $15 per seat
  }
  return seats * 18; // $18 per seat
}

/**
 * PayPal subscription status types
 */
export enum PayPalSubscriptionStatus {
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * Type guard to check if status is valid PayPal status
 */
export function isValidPayPalStatus(status: string): status is PayPalSubscriptionStatus {
  return Object.values(PayPalSubscriptionStatus).includes(status as PayPalSubscriptionStatus);
}
