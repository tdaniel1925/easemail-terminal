import { test, expect } from '@playwright/test';

/**
 * TDaniel BundleFly Workflow Test
 *
 * Tests the complete workflow for tdaniel@bundlefly.com:
 * 1. Create account for tdaniel@bundlefly.com
 * 2. Complete onboarding
 * 3. Create "botmakers" organization
 * 4. Add tdaniel@bundlefly.com as member to organization
 * 5. Verify organization dashboard access
 */

test.describe('TDaniel BundleFly Workflow', () => {
  const testUser = {
    email: 'tdaniel@bundlefly.com',
    password: 'SecurePass123!',
    name: 'TDaniel BundleFly'
  };

  const organizationName = 'botmakers';
  let organizationId: string;

  test('Step 1: Create account for tdaniel@bundlefly.com', async ({ page, request }) => {
    console.log('Creating account for tdaniel@bundlefly.com...');

    // Use test endpoint to create user with auto-confirmed email
    const response = await request.post('https://easemail.app/api/test/create-user', {
      headers: {
        'Content-Type': 'application/json',
        'x-test-token': process.env.TEST_ENDPOINT_TOKEN || 'test-token-for-e2e'
      },
      data: {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name
      }
    });

    const result = await response.json();

    if (response.ok()) {
      console.log('✓ Account created successfully with auto-confirmed email');
      console.log('✓ User ID:', result.user.id);
    } else {
      console.log('⚠ Could not create via test endpoint:', result.error);
      console.log('Falling back to normal signup flow...');

      // Fallback: Navigate to signup
      await page.goto('/signup');
      await expect(page.locator('text=Create an account')).toBeVisible();

      // Fill in signup form
      await page.fill('input[name="name"]', testUser.name);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');

      // Wait for redirect after signup
      await page.waitForURL('**/auth/verify', { timeout: 10000 });

      console.log('✓ Account created successfully');
      console.log('⚠ Email verification required - check tdaniel@bundlefly.com inbox');
    }
  });

  test('Step 2: Login after email verification', async ({ page }) => {
    console.log('Attempting to login...');
    console.log('⚠ Make sure you verified the email before running this test!');

    // Navigate to login
    await page.goto('/login');
    await expect(page.locator('text=Sign in').or(page.locator('text=Log in'))).toBeVisible();

    // Fill in login form
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for successful login and redirect
    await page.waitForURL('**/app/**', { timeout: 15000 });

    console.log('✓ Successfully logged in');
  });

  test('Step 3: Complete onboarding', async ({ page }) => {
    console.log('Completing onboarding flow...');

    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/**', { timeout: 15000 });

    // Check if onboarding is needed
    const onboardingVisible = await page.locator('text=Welcome to EaseMail').isVisible({ timeout: 5000 }).catch(() => false);

    if (onboardingVisible) {
      console.log('Onboarding detected, completing steps...');

      // Click through onboarding steps
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Get Started")');

      // Complete onboarding steps (up to 5 steps)
      for (let i = 0; i < 5; i++) {
        const isVisible = await nextButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          await nextButton.first().click();
          await page.waitForTimeout(1000);
        } else {
          break;
        }
      }

      console.log('✓ Onboarding completed');
    } else {
      console.log('✓ No onboarding required or already completed');
    }

    // Verify we're on the dashboard
    await expect(page.locator('text=Dashboard').or(page.locator('text=Inbox'))).toBeVisible({ timeout: 5000 });
  });

  test('Step 4: Create "botmakers" organization', async ({ page }) => {
    console.log('Creating "botmakers" organization...');

    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/**', { timeout: 15000 });

    // Navigate to organizations
    await page.goto('/app/organization');
    await page.waitForLoadState('networkidle');

    // Look for "Create Organization" button
    const createOrgButton = page.locator('button:has-text("Create Organization"), a:has-text("Create Organization")');
    await expect(createOrgButton.first()).toBeVisible({ timeout: 10000 });
    await createOrgButton.first().click();

    // Fill in organization details
    await page.fill('input[name="name"]', organizationName);

    // Submit the form
    const submitButton = page.locator('button[type="submit"]:has-text("Create"), button:has-text("Create Organization")');
    await submitButton.click();

    // Wait for organization to be created
    await page.waitForTimeout(2000);

    // Verify organization was created
    await expect(page.locator(`text=${organizationName}`)).toBeVisible({ timeout: 10000 });

    console.log(`✓ Organization "${organizationName}" created successfully`);
  });

  test('Step 5: Verify organization membership', async ({ page }) => {
    console.log('Verifying organization membership...');

    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/**', { timeout: 15000 });

    // Navigate to organizations
    await page.goto('/app/organization');
    await page.waitForLoadState('networkidle');

    // Verify user sees the organization
    await expect(page.locator(`text=${organizationName}`)).toBeVisible({ timeout: 10000 });

    // Click on the organization to view details
    await page.locator(`text=${organizationName}`).click();
    await page.waitForTimeout(2000);

    // Verify we're on the organization page
    await expect(page.locator('text=Members').or(page.locator('text=Team'))).toBeVisible({ timeout: 5000 });

    // Verify tdaniel@bundlefly.com is listed as a member
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible({ timeout: 5000 });

    console.log(`✓ User ${testUser.email} is a member of "${organizationName}"`);
  });

  test('Step 6: Verify dashboard access', async ({ page }) => {
    console.log('Verifying full dashboard access...');

    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/**', { timeout: 15000 });

    // Test navigation to key sections
    const sections = [
      { name: 'Dashboard', url: '/app/dashboard' },
      { name: 'Inbox', url: '/app/inbox' },
      { name: 'Organization', url: '/app/organization' },
    ];

    for (const section of sections) {
      console.log(`Checking ${section.name}...`);
      await page.goto(section.url);
      await page.waitForLoadState('networkidle');

      // Verify page loaded without errors
      const hasError = await page.locator('text=Error').isVisible({ timeout: 2000 }).catch(() => false);
      expect(hasError).toBe(false);

      console.log(`✓ ${section.name} accessible`);
    }

    console.log('✓ All dashboard sections accessible');
  });
});
