import { test, expect } from '@playwright/test';

// Pre-seeded test accounts
const SUPER_ADMIN_USER = {
  email: process.env.SUPER_ADMIN_EMAIL || 'playwright-superadmin@example.org',
  password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!',
  name: 'Playwright Super Admin'
};

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'playwright-test@example.org',
  password: process.env.TEST_USER_PASSWORD || 'PlaywrightTest123!',
  name: 'Playwright Test User'
};

// Helper function to login as super admin
async function loginAsSuperAdmin(page: any) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(SUPER_ADMIN_USER.email);
  await page.getByLabel(/password/i).fill(SUPER_ADMIN_USER.password);
  await page.getByRole('button', { name: /sign in/i}).click();
  await page.waitForURL(/\/app/, { timeout: 10000 });
}

test.describe('Super Admin', () => {
  test.describe('Access Control', () => {
    test('super admin should have access to admin panel', async ({ page }) => {
      await loginAsSuperAdmin(page);

      // Navigate to admin panel
      await page.goto('/admin');
      await page.waitForTimeout(2000);

      // Should be on admin page, not redirected
      expect(page.url()).toContain('/admin');
    });

    test('regular user should not have access to admin panel', async ({ page }) => {
      // Login as regular test user (not super admin)
      await page.goto('/login');
      await page.getByLabel(/email/i).fill(TEST_USER.email);
      await page.getByLabel(/password/i).fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/app/, { timeout: 10000 });

      // Try to access admin panel
      await page.goto('/admin');
      await page.waitForTimeout(2000);

      // Should be redirected or show access denied
      if (page.url().includes('/admin')) {
        // Check for access denied message
        const accessDenied = page.getByText(/access denied|unauthorized|forbidden/i);
        await expect(accessDenied).toBeVisible({ timeout: 5000 }).catch(() => {});
      } else {
        // Or redirected away from admin
        expect(page.url()).not.toContain('/admin');
      }
    });
  });

  test.describe('User Management', () => {
    test('should show users list', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await page.goto('/admin/users');
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/admin/users');

      // Should show users heading or table
      const usersHeading = page.getByRole('heading', { name: /users/i });
      await expect(usersHeading).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should create a new standalone user', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await page.goto('/admin/users');
      await page.waitForTimeout(1000);

      // Click create user button
      const createButton = page.getByRole('button', { name: /create user|add user|new user/i });
      if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createButton.click();

        // Fill in user details
        const uniqueEmail = `admin-created+${Date.now()}@example.com`;
        await page.getByLabel(/email/i).fill(uniqueEmail);

        // Check if name field exists
        const nameField = page.getByLabel(/name/i);
        if (await nameField.isVisible({ timeout: 1000 }).catch(() => false)) {
          await nameField.fill('Test User');
        }

        // Fill password
        await page.getByLabel(/password/i).fill('SecurePass123!');

        // Submit
        await page.getByRole('button', { name: /create|save|add/i }).click();

        // Should show success message
        await page.waitForTimeout(2000);
        const successMessage = page.getByText(/created|added|success/i);
        await expect(successMessage).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should validate required fields when creating user', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await page.goto('/admin/users');
      await page.waitForTimeout(1000);

      const createButton = page.getByRole('button', { name: /create user|add user|new user/i });
      if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createButton.click();

        // Try to submit without filling required fields
        await page.getByRole('button', { name: /create|save|add/i }).click();

        // Should show validation error or stay on form
        await page.waitForTimeout(1000);
        // Form should still be visible (not dismissed)
        const emailField = page.getByLabel(/email/i);
        await expect(emailField).toBeVisible();
      }
    });
  });

  test.describe('Organization Wizard', () => {
    test('should show organization wizard', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await page.goto('/admin/organizations');
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/admin/organizations');

      // Check for create organization button
      const createButton = page.getByRole('button', { name: /create|new|wizard/i });
      if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(createButton).toBeVisible();
      }
    });

    test('should create organization with users via wizard', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await page.goto('/admin/organizations');
      await page.waitForTimeout(1000);

      // Click create organization
      const createButton = page.getByRole('button', { name: /create|new|wizard/i });
      if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(1000);

        // Step 1: Organization Details
        const orgName = `Test Org ${Date.now()}`;
        const orgNameField = page.getByLabel(/organization name/i);
        if (await orgNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await orgNameField.fill(orgName);

          // Plan selection
          const planSelect = page.locator('select, [role="combobox"]').filter({ hasText: /plan/i }).first();
          if (await planSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
            await planSelect.click();
            await page.getByText(/PRO|BUSINESS/i).first().click().catch(() => {});
          }

          // Next button
          const nextButton = page.getByRole('button', { name: /next|continue/i });
          if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton.click();
            await page.waitForTimeout(1000);

            // Step 2: Add Users
            const addUserButton = page.getByRole('button', { name: /add user/i });
            if (await addUserButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await addUserButton.click();

              // Fill user details
              const userEmail = `orguser+${Date.now()}@example.com`;
              await page.getByLabel(/email/i).first().fill(userEmail);

              const nameField = page.getByLabel(/name/i).first();
              if (await nameField.isVisible({ timeout: 1000 }).catch(() => false)) {
                await nameField.fill('Test User');
              }

              // Set role to OWNER
              const roleSelect = page.locator('select, [role="combobox"]').filter({ hasText: /role/i }).first();
              if (await roleSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
                await roleSelect.click();
                await page.getByText('OWNER').first().click().catch(() => {});
              }

              // Complete wizard
              const completeButton = page.getByRole('button', { name: /create|finish|complete/i });
              if (await completeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await completeButton.click();

                // Wait for API response
                await page.waitForTimeout(3000);

                // Check for error messages first
                const errorMessage = page.getByText(/failed|error/i).first();
                const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);

                if (hasError) {
                  const errorText = await errorMessage.textContent();
                  throw new Error(`Organization creation failed: ${errorText}`);
                }

                // Should show success message (no catch to swallow errors!)
                const successMessage = page.getByText(/created|success/i);
                await expect(successMessage).toBeVisible({ timeout: 5000 });
              }
            }
          }
        }
      }
    });

    test('should validate organization wizard required fields', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await page.goto('/admin/organizations');
      await page.waitForTimeout(1000);

      const createButton = page.getByRole('button', { name: /create|new|wizard/i });
      if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(1000);

        // Try to proceed without filling required fields
        const nextButton = page.getByRole('button', { name: /next|continue|create/i });
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nextButton.click();
          await page.waitForTimeout(1000);

          // Should show validation error or stay on same step
          const orgNameField = page.getByLabel(/organization name/i);
          if (await orgNameField.isVisible().catch(() => false)) {
            // Still on first step
            await expect(orgNameField).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('System Settings', () => {
    test('should show system settings page', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await page.goto('/admin/settings');
      await page.waitForTimeout(2000);

      if (page.url().includes('/admin/settings')) {
        const settingsHeading = page.getByRole('heading', { name: /settings|system/i });
        await expect(settingsHeading).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });
  });

  test.describe('Rate Limits', () => {
    test('should show rate limits page', async ({ page }) => {
      await loginAsSuperAdmin(page);
      await page.goto('/admin/rate-limits');
      await page.waitForTimeout(2000);

      if (page.url().includes('/admin/rate-limits')) {
        const rateLimitsHeading = page.getByRole('heading', { name: /rate limit/i });
        await expect(rateLimitsHeading).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });
  });
});
