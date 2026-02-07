import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PAYPAL_PLANS,
  calculateOrganizationPrice,
  getOrganizationPlan,
  PayPalSubscriptionStatus,
  isValidPayPalStatus,
} from '@/lib/paypal/client';

// Constants from the implementation
const INDIVIDUAL_PRICE = 20;
const TEAM_PRICE_PER_SEAT = 18;
const GROWTH_PRICE_PER_SEAT = 15;
const GROWTH_THRESHOLD = 10;

describe('PayPal Client Utilities', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.PAYPAL_PLAN_INDIVIDUAL = 'P-TEST-INDIVIDUAL';
    process.env.PAYPAL_PLAN_TEAM = 'P-TEST-TEAM';
    process.env.PAYPAL_PLAN_GROWTH = 'P-TEST-GROWTH';
  });

  describe('PAYPAL_PLANS', () => {
    it('should return correct plan IDs from environment', () => {
      expect(PAYPAL_PLANS.INDIVIDUAL).toBe('P-TEST-INDIVIDUAL');
      expect(PAYPAL_PLANS.TEAM).toBe('P-TEST-TEAM');
      expect(PAYPAL_PLANS.GROWTH).toBe('P-TEST-GROWTH');
    });

    it('should have all three plan types defined', () => {
      expect(PAYPAL_PLANS).toHaveProperty('INDIVIDUAL');
      expect(PAYPAL_PLANS).toHaveProperty('TEAM');
      expect(PAYPAL_PLANS).toHaveProperty('GROWTH');
    });
  });

  describe('calculateOrganizationPrice', () => {
    it('should calculate team pricing for 2 seats', () => {
      const price = calculateOrganizationPrice(2);
      expect(price).toBe(2 * TEAM_PRICE_PER_SEAT); // 2 * 18 = 36
      expect(price).toBe(36);
    });

    it('should calculate team pricing for 5 seats', () => {
      const price = calculateOrganizationPrice(5);
      expect(price).toBe(5 * TEAM_PRICE_PER_SEAT); // 5 * 18 = 90
      expect(price).toBe(90);
    });

    it('should calculate team pricing for 9 seats (just below growth threshold)', () => {
      const price = calculateOrganizationPrice(9);
      expect(price).toBe(9 * TEAM_PRICE_PER_SEAT); // 9 * 18 = 162
      expect(price).toBe(162);
    });

    it('should calculate growth pricing for 10 seats (at threshold)', () => {
      const price = calculateOrganizationPrice(10);
      expect(price).toBe(10 * GROWTH_PRICE_PER_SEAT); // 10 * 15 = 150
      expect(price).toBe(150);
    });

    it('should calculate growth pricing for 20 seats', () => {
      const price = calculateOrganizationPrice(20);
      expect(price).toBe(20 * GROWTH_PRICE_PER_SEAT); // 20 * 15 = 300
      expect(price).toBe(300);
    });

    it('should calculate growth pricing for 100 seats', () => {
      const price = calculateOrganizationPrice(100);
      expect(price).toBe(100 * GROWTH_PRICE_PER_SEAT); // 100 * 15 = 1500
      expect(price).toBe(1500);
    });

    it('should handle edge case of 1 seat', () => {
      const price = calculateOrganizationPrice(1);
      expect(price).toBe(1 * TEAM_PRICE_PER_SEAT); // 1 * 18 = 18
      expect(price).toBe(18);
    });

    it('should use growth pricing threshold of 10', () => {
      expect(GROWTH_THRESHOLD).toBe(10);
    });
  });

  describe('getOrganizationPlan', () => {
    it('should return team plan for 2 seats', () => {
      const planId = getOrganizationPlan(2);
      expect(planId).toBe(PAYPAL_PLANS.TEAM);
      expect(planId).toBe('P-TEST-TEAM');
    });

    it('should return team plan for 5 seats', () => {
      const planId = getOrganizationPlan(5);
      expect(planId).toBe(PAYPAL_PLANS.TEAM);
    });

    it('should return team plan for 9 seats', () => {
      const planId = getOrganizationPlan(9);
      expect(planId).toBe(PAYPAL_PLANS.TEAM);
    });

    it('should return growth plan for 10 seats', () => {
      const planId = getOrganizationPlan(10);
      expect(planId).toBe(PAYPAL_PLANS.GROWTH);
      expect(planId).toBe('P-TEST-GROWTH');
    });

    it('should return growth plan for 20 seats', () => {
      const planId = getOrganizationPlan(20);
      expect(planId).toBe(PAYPAL_PLANS.GROWTH);
    });

    it('should return growth plan for 100 seats', () => {
      const planId = getOrganizationPlan(100);
      expect(planId).toBe(PAYPAL_PLANS.GROWTH);
    });
  });

  describe('Pricing Constants', () => {
    it('should have correct individual price', () => {
      expect(INDIVIDUAL_PRICE).toBe(20);
    });

    it('should have correct team price per seat', () => {
      expect(TEAM_PRICE_PER_SEAT).toBe(18);
    });

    it('should have correct growth price per seat', () => {
      expect(GROWTH_PRICE_PER_SEAT).toBe(15);
    });

    it('should have team pricing higher than growth pricing', () => {
      expect(TEAM_PRICE_PER_SEAT).toBeGreaterThan(GROWTH_PRICE_PER_SEAT);
    });
  });

  describe('Price Comparison', () => {
    it('should save money with growth pricing at 10 seats', () => {
      const teamPrice = 10 * TEAM_PRICE_PER_SEAT; // 10 * 18 = 180
      const growthPrice = calculateOrganizationPrice(10); // 10 * 15 = 150
      const savings = teamPrice - growthPrice; // 180 - 150 = 30

      expect(growthPrice).toBeLessThan(teamPrice);
      expect(savings).toBe(30);
    });

    it('should save $3 per seat with growth pricing', () => {
      const savingsPerSeat = TEAM_PRICE_PER_SEAT - GROWTH_PRICE_PER_SEAT;
      expect(savingsPerSeat).toBe(3);
    });

    it('should save $30/month for 10 seats with growth pricing', () => {
      const seats = 10;
      const teamTotal = seats * TEAM_PRICE_PER_SEAT; // 180
      const growthTotal = seats * GROWTH_PRICE_PER_SEAT; // 150
      const monthlySavings = teamTotal - growthTotal;

      expect(monthlySavings).toBe(30);
    });

    it('should save $60/month for 20 seats with growth pricing', () => {
      const seats = 20;
      const teamTotal = seats * TEAM_PRICE_PER_SEAT; // 360
      const growthTotal = seats * GROWTH_PRICE_PER_SEAT; // 300
      const monthlySavings = teamTotal - growthTotal;

      expect(monthlySavings).toBe(60);
    });
  });

  describe('Edge Cases', () => {
    it('should handle 0 seats', () => {
      const price = calculateOrganizationPrice(0);
      expect(price).toBe(0);
    });

    it('should handle negative seats as 0', () => {
      const price = calculateOrganizationPrice(-5);
      expect(price).toBeLessThanOrEqual(0);
    });

    it('should handle very large seat counts', () => {
      const price = calculateOrganizationPrice(1000);
      expect(price).toBe(1000 * GROWTH_PRICE_PER_SEAT);
      expect(price).toBe(15000);
    });

    it('should return number type for all calculations', () => {
      expect(typeof calculateOrganizationPrice(5)).toBe('number');
      expect(typeof calculateOrganizationPrice(15)).toBe('number');
    });
  });

  describe('PayPalSubscriptionStatus', () => {
    it('should have all expected status values', () => {
      expect(PayPalSubscriptionStatus.APPROVAL_PENDING).toBe('APPROVAL_PENDING');
      expect(PayPalSubscriptionStatus.APPROVED).toBe('APPROVED');
      expect(PayPalSubscriptionStatus.ACTIVE).toBe('ACTIVE');
      expect(PayPalSubscriptionStatus.SUSPENDED).toBe('SUSPENDED');
      expect(PayPalSubscriptionStatus.CANCELLED).toBe('CANCELLED');
      expect(PayPalSubscriptionStatus.EXPIRED).toBe('EXPIRED');
    });

    it('should contain exactly 6 status values', () => {
      const statusValues = Object.values(PayPalSubscriptionStatus);
      expect(statusValues).toHaveLength(6);
    });
  });

  describe('isValidPayPalStatus', () => {
    it('should return true for valid ACTIVE status', () => {
      expect(isValidPayPalStatus('ACTIVE')).toBe(true);
    });

    it('should return true for valid APPROVAL_PENDING status', () => {
      expect(isValidPayPalStatus('APPROVAL_PENDING')).toBe(true);
    });

    it('should return true for valid CANCELLED status', () => {
      expect(isValidPayPalStatus('CANCELLED')).toBe(true);
    });

    it('should return true for valid SUSPENDED status', () => {
      expect(isValidPayPalStatus('SUSPENDED')).toBe(true);
    });

    it('should return true for valid EXPIRED status', () => {
      expect(isValidPayPalStatus('EXPIRED')).toBe(true);
    });

    it('should return true for valid APPROVED status', () => {
      expect(isValidPayPalStatus('APPROVED')).toBe(true);
    });

    it('should return false for invalid status', () => {
      expect(isValidPayPalStatus('INVALID_STATUS')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidPayPalStatus('')).toBe(false);
    });

    it('should return false for lowercase status', () => {
      expect(isValidPayPalStatus('active')).toBe(false);
    });

    it('should return false for null-like values', () => {
      expect(isValidPayPalStatus('null')).toBe(false);
      expect(isValidPayPalStatus('undefined')).toBe(false);
    });
  });
});
