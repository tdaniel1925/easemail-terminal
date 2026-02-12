import { Page } from '@playwright/test';

/**
 * Create a test user via API (bypasses Supabase rate limits)
 */
export async function createTestUserViaAPI() {
  const testEmail = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  // Use BASE_URL from environment or fallback to localhost
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/test/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-token': process.env.TEST_ENDPOINT_TOKEN || 'test-token-for-e2e'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create test user: ${error.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return { email: testEmail, password: testPassword, userId: data.user.id };
  } catch (error) {
    console.error('Failed to create test user via API:', error);
    throw error;
  }
}

/**
 * Login with credentials
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForTimeout(500);

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/app/, { timeout: 10000 });
}

/**
 * Create a test user and login (improved version using API)
 */
export async function createAndLoginUser(page: Page) {
  // Create user via API to bypass rate limits
  const credentials = await createTestUserViaAPI();

  // Login via UI
  await loginUser(page, credentials.email, credentials.password);

  return credentials;
}

/**
 * Legacy version for backwards compatibility
 * Creates user via UI (may hit rate limits)
 */
export async function createAndLoginUserLegacy(page: Page) {
  const testEmail = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  const testPassword = 'TestPassword123!';

  await page.goto('/signup');
  await page.getByLabel(/email/i).fill(testEmail);
  await page.getByLabel(/password/i).fill(testPassword);
  await page.getByRole('button', { name: /create account/i }).click();
  await page.waitForURL(/\/app/, { timeout: 10000 });

  return { email: testEmail, password: testPassword };
}
