import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.PAYPAL_CLIENT_ID = 'test_client_id';
process.env.PAYPAL_CLIENT_SECRET = 'test_client_secret';
process.env.PAYPAL_MODE = 'sandbox';
process.env.PAYPAL_PLAN_INDIVIDUAL = 'P-TEST-INDIVIDUAL';
process.env.PAYPAL_PLAN_TEAM = 'P-TEST-TEAM';
process.env.PAYPAL_PLAN_GROWTH = 'P-TEST-GROWTH';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test_client_id';
