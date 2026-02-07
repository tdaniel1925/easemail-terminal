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
    email: 'tdaniel@botmakers.ai',
    password: '4Xkilla1@',
    name: 'TDaniel BotMakers'
  };

  // Use a unique organization name for each test run to avoid conflicts
  const organizationName = `botmakers-${Date.now()}`;
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
    await expect(page.locator('button[type="submit"]:has-text("Sign In")')).toBeVisible();

    // Fill in login form
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for successful login and redirect (could be /app or /onboarding)
    await page.waitForURL(/\/(app|onboarding)/, { timeout: 15000 });

    console.log('✓ Successfully logged in');
  });

  test('Step 3: Complete onboarding', async ({ page }) => {
    console.log('Completing onboarding flow...');

    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(app|onboarding)/, { timeout: 15000 });

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
    await page.waitForURL(/\/(app|onboarding)/, { timeout: 15000 });

    console.log('Current URL after login:', page.url());

    // Check if we're on onboarding page
    if (page.url().includes('/onboarding')) {
      console.log('On onboarding page, checking for Welcome message...');
      try {
        // Wait for onboarding to load
        await page.waitForSelector('text=Welcome to EaseMail', { timeout: 5000 });
        console.log('Onboarding detected! Completing steps...');

        // Step 1: Select use case - click the Work button
        const workButton = page.locator('button').filter({ hasText: 'Professional communication' });
        console.log('Looking for Work button...');
        await workButton.waitFor({ state: 'visible', timeout: 5000 });
        await workButton.click();
        console.log('  ✓ Selected Work use case');
        await page.waitForTimeout(1500);

        // Click Continue button
        const continueButton = page.locator('button:has-text("Continue")');
        for (let i = 0; i < 5; i++) {
          try {
            await continueButton.waitFor({ state: 'visible', timeout: 3000 });
            const isDisabled = await continueButton.isDisabled();
            if (!isDisabled) {
              await continueButton.click();
              console.log(`  ✓ Clicked continue button (${i + 1})`);
              await page.waitForTimeout(2000);
            } else {
              console.log(`  Continue button is disabled, checking for other buttons...`);
              // Try other button texts
              const otherButtons = page.locator('button:has-text("Next"), button:has-text("Get Started"), button:has-text("Finish")');
              if (await otherButtons.isVisible({ timeout: 1000 }).catch(() => false)) {
                await otherButtons.first().click();
                console.log(`  ✓ Clicked alternative button`);
                await page.waitForTimeout(2000);
              } else {
                break;
              }
            }
          } catch (e) {
            console.log(`  No more continue buttons found`);
            break;
          }
        }

        console.log('✓ Onboarding flow completed');
        await page.waitForTimeout(1000);
      } catch (e) {
        console.log('Error during onboarding:', e.message);
      }
    }

    // Navigate to admin organizations page
    console.log('Navigating to /app/admin/organizations...');
    await page.goto('/app/admin/organizations');
    await page.waitForLoadState('networkidle');

    // Look for "Create Organization" button
    const createOrgButton = page.locator('button:has-text("Create Organization")').first();
    await expect(createOrgButton).toBeVisible({ timeout: 10000 });
    console.log('Found Create Organization button, clicking...');
    await createOrgButton.click();

    // STEP 1: Organization Details
    console.log('Step 1: Filling organization details...');
    await page.waitForTimeout(1000);

    const orgNameInput = page.locator('input#orgName');
    await orgNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await orgNameInput.fill(organizationName);
    console.log('  ✓ Organization name filled');

    // Click Next to go to Step 2
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    console.log('  ✓ Clicked Next');
    await page.waitForTimeout(1000);

    // STEP 2: Add Team Members
    console.log('Step 2: Adding team member...');

    // Fill in the first user (default row)
    // Note: Use a NEW user email since the wizard creates new users (tdaniel@botmakers.ai already exists)
    const firstUserName = page.locator('input[placeholder*="John Doe"]').first();
    const firstUserEmail = page.locator('input[placeholder*="john@acme" i]').first();

    await firstUserName.fill('Bot Maker Owner');
    await firstUserEmail.fill(`owner-${Date.now()}@botmakers.ai`);
    console.log('  ✓ Team member added');

    // Click Next to go to Step 3
    await nextButton.click();
    console.log('  ✓ Clicked Next');
    await page.waitForTimeout(1000);

    // STEP 3: API Configuration (default "Use Master API Key" is already selected)
    console.log('Step 3: API Configuration (using default Master Key)...');

    // Click Next to go to Step 4
    await nextButton.click();
    console.log('  ✓ Clicked Next');
    await page.waitForTimeout(1000);

    // STEP 4: Billing & Review - Submit
    console.log('Step 4: Review and submit...');

    // Set up response listener to capture the API response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/admin/organizations/wizard') && response.request().method() === 'POST'
    );

    const createButton = page.locator('button:has-text("Create Organization")').last();
    await createButton.waitFor({ state: 'visible', timeout: 5000 });
    await createButton.click();
    console.log('  ✓ Clicked Create Organization');

    // Wait for the API response
    try {
      const response = await responsePromise;
      const responseBody = await response.json();
      console.log('API Response Status:', response.status());
      console.log('API Response Body:', JSON.stringify(responseBody, null, 2));

      if (response.ok()) {
        console.log('  ✓ Organization created successfully in database');
        if (responseBody.organization?.id) {
          organizationId = responseBody.organization.id;
          console.log('  ✓ Organization ID:', organizationId);
        }
      } else {
        console.log('  ✗ Organization creation failed:', responseBody.error);
      }
    } catch (error) {
      console.log('  ⚠ Could not capture API response:', error.message);
    }

    // Wait for success and modal to close
    await page.waitForTimeout(3000);

    // Verify organization was created
    console.log('Verifying organization appears in UI...');
    await expect(page.locator(`text=${organizationName}`)).toBeVisible({ timeout: 15000 });

    console.log(`✓ Organization "${organizationName}" created successfully`);
  });

  test('Step 5: Verify organization membership', async ({ page }) => {
    console.log('Verifying organization membership...');

    // Add extra wait time to ensure database commits are complete
    console.log('Waiting 5 seconds for database commits...');
    await page.waitForTimeout(5000);

    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(app|onboarding)/, { timeout: 15000 });

    // Complete onboarding if needed
    const onboardingVisible = await page.locator('text=Welcome to EaseMail').isVisible({ timeout: 2000 }).catch(() => false);
    if (onboardingVisible) {
      console.log('Onboarding detected, completing...');
      const workButton = page.locator('button').filter({ hasText: 'Professional communication' });
      if (await workButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await workButton.click();
        await page.waitForTimeout(1000);
      }
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Get Started"), button:has-text("Finish")');
      for (let i = 0; i < 5; i++) {
        const isVisible = await continueButton.isVisible({ timeout: 2000 }).catch(() => false);
        const isEnabled = isVisible && !await continueButton.first().isDisabled().catch(() => false);
        if (isVisible && isEnabled) {
          await continueButton.first().click();
          await page.waitForTimeout(1500);
        } else {
          break;
        }
      }
      await page.waitForTimeout(1000);
    }

    // Navigate to admin organizations page
    console.log('Navigating to /app/admin/organizations...');
    await page.goto('/app/admin/organizations');
    await page.waitForLoadState('networkidle');

    // Add extra wait for page to fully load
    await page.waitForTimeout(2000);

    // Check what the page shows
    const totalOrgsText = await page.locator('text=/Total Organizations/').textContent().catch(() => 'not found');
    console.log('Page shows:', totalOrgsText);

    // Try to find the organization
    const orgVisible = await page.locator(`text=${organizationName}`).isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Organization "${organizationName}" visible:`, orgVisible);

    if (!orgVisible) {
      // Debug: Take a screenshot
      await page.screenshot({ path: 'debug-step5-no-org.png', fullPage: true });
      console.log('Screenshot saved to debug-step5-no-org.png');

      // Check if there are any organizations at all
      const noOrgsMessage = await page.locator('text=No organizations found').isVisible().catch(() => false);
      console.log('No organizations message visible:', noOrgsMessage);
    }

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
    await page.waitForURL(/\/(app|onboarding)/, { timeout: 15000 });

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
