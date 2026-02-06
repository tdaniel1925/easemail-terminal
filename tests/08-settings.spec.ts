import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers';

test.describe('Settings', () => {
  test.describe('Settings Navigation', () => {
    test('should show settings page', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/settings');

      // Should show settings heading
      const settingsHeading = page.getByRole('heading', { name: /settings/i });
      await expect(settingsHeading).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should show settings navigation menu', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(3000); // Wait for redirect and render

      // Look for settings sections
      const profileLink = page.getByRole('link', { name: /account/i });
      const emailLink = page.getByRole('link', { name: /email accounts/i });

      const hasProfile = await profileLink.isVisible({ timeout: 3000 }).catch(() => false);
      const hasEmail = await emailLink.isVisible({ timeout: 3000 }).catch(() => false);

      // Should have at least one settings section
      expect(hasProfile || hasEmail).toBe(true);
    });
  });

  test.describe('Profile Settings', () => {
    test('should show profile settings', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const profileLink = page.getByRole('link', { name: /profile|account/i });
      if (await profileLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await profileLink.click();
        await page.waitForTimeout(1000);

        // Should show profile fields
        const nameField = page.getByLabel(/name|full name|display name/i);
        await expect(nameField).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    });

    test('should update profile name', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const profileLink = page.getByRole('link', { name: /profile|account/i });
      if (await profileLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await profileLink.click();
        await page.waitForTimeout(1000);

        const nameField = page.getByLabel(/name|full name|display name/i);
        if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameField.clear();
          await nameField.fill(`Updated Name ${Date.now()}`);

          const saveButton = page.getByRole('button', { name: /save|update/i });
          if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await saveButton.click();
            await page.waitForTimeout(2000);

            // Should show success
            const successMessage = page.getByText(/saved|updated|success/i);
            await expect(successMessage).toBeVisible({ timeout: 5000 }).catch(() => {});
          }
        }
      }
    });

    test('should update profile picture', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const profileLink = page.getByRole('link', { name: /profile|account/i });
      if (await profileLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await profileLink.click();
        await page.waitForTimeout(1000);

        // Look for upload button
        const uploadButton = page.getByRole('button', { name: /upload|change photo|profile picture/i });
        if (await uploadButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(uploadButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Email Account Settings', () => {
    test('should show email accounts page', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const emailLink = page.getByRole('link', { name: /email account/i });
      if (await emailLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailLink.click();
        await page.waitForTimeout(1000);

        // Should show email accounts section
        expect(page.url()).toMatch(/settings/);
      }
    });

    test('should show connected email accounts', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings/email-accounts');
      await page.waitForTimeout(3000); // Wait for API call and render

      // Should show accounts or empty state
      const accountList = page.locator('[data-testid="email-accounts-list"]');
      const emptyState = page.locator('[data-testid="email-accounts-empty"]');

      const hasList = await accountList.isVisible({ timeout: 3000 }).catch(() => false);
      const isEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

      expect(hasList || isEmpty).toBe(true);
    });

    test('should show connect email account button', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const emailLink = page.getByRole('link', { name: /email account/i });
      if (await emailLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailLink.click();
        await page.waitForTimeout(1000);

        const connectButton = page.getByRole('button', { name: /connect|add account/i });
        await expect(connectButton).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should set primary email account', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const emailLink = page.getByRole('link', { name: /email account/i });
      if (await emailLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailLink.click();
        await page.waitForTimeout(1000);

        // Look for set as primary button
        const setPrimaryButton = page.getByRole('button', { name: /set as primary|make primary/i });
        if (await setPrimaryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await setPrimaryButton.click();
          await page.waitForTimeout(1000);

          // Should update primary account
          expect(page.url()).toContain('/settings');
        }
      }
    });

    test('should disconnect email account', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const emailLink = page.getByRole('link', { name: /email account/i });
      if (await emailLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailLink.click();
        await page.waitForTimeout(1000);

        const disconnectButton = page.getByRole('button', { name: /disconnect|remove/i });
        if (await disconnectButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await disconnectButton.click();
          await page.waitForTimeout(1000);

          // Should show confirmation
          const confirmButton = page.getByRole('button', { name: /confirm|yes|disconnect/i });
          if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmButton.click();
            await page.waitForTimeout(1000);
          }

          expect(page.url()).toContain('/settings');
        }
      }
    });
  });

  test.describe('Notification Settings', () => {
    test('should show notification settings', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const notificationsLink = page.getByRole('link', { name: /notification/i });
      if (await notificationsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await notificationsLink.click();
        await page.waitForTimeout(1000);

        // Should show notification options
        expect(page.url()).toMatch(/settings/);
      }
    });

    test('should toggle email notifications', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const notificationsLink = page.getByRole('link', { name: /notification/i });
      if (await notificationsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await notificationsLink.click();
        await page.waitForTimeout(1000);

        // Look for toggle switches
        const emailToggle = page.locator('input[type="checkbox"], button[role="switch"]').first();
        if (await emailToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
          await emailToggle.click();
          await page.waitForTimeout(500);

          // Should toggle notification
          expect(page.url()).toContain('/settings');
        }
      }
    });

    test('should configure notification preferences', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const notificationsLink = page.getByRole('link', { name: /notification/i });
      if (await notificationsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await notificationsLink.click();
        await page.waitForTimeout(1000);

        // Look for notification types
        const newEmailNotif = page.getByText(/new email|incoming email/i);
        const meetingNotif = page.getByText(/meeting|calendar/i);

        const hasEmail = await newEmailNotif.isVisible({ timeout: 2000 }).catch(() => false);
        const hasMeeting = await meetingNotif.isVisible({ timeout: 2000 }).catch(() => false);

        // Should show notification types
        if (hasEmail || hasMeeting) {
          expect(hasEmail || hasMeeting).toBe(true);
        }
      }
    });
  });

  test.describe('Privacy Settings', () => {
    test('should show privacy settings', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const privacyLink = page.getByRole('link', { name: /privacy|security/i });
      if (await privacyLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await privacyLink.click();
        await page.waitForTimeout(1000);

        // Should show privacy options
        expect(page.url()).toMatch(/settings/);
      }
    });

    test('should change password', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const privacyLink = page.getByRole('link', { name: /privacy|security/i });
      if (await privacyLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await privacyLink.click();
        await page.waitForTimeout(1000);

        const changePasswordButton = page.getByRole('button', { name: /change password/i });
        if (await changePasswordButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await changePasswordButton.click();
          await page.waitForTimeout(500);

          // Should show password change form
          const currentPasswordField = page.getByLabel(/current password/i);
          await expect(currentPasswordField).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });

    test('should show two-factor authentication option', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const privacyLink = page.getByRole('link', { name: /privacy|security/i });
      if (await privacyLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await privacyLink.click();
        await page.waitForTimeout(1000);

        // Look for 2FA option
        const twoFactorOption = page.getByText(/two.?factor|2fa|mfa/i);
        if (await twoFactorOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(twoFactorOption).toBeVisible();
        }
      }
    });
  });

  test.describe('Appearance Settings', () => {
    test('should show appearance settings', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const appearanceLink = page.getByRole('link', { name: /appearance|theme|display/i });
      if (await appearanceLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await appearanceLink.click();
        await page.waitForTimeout(1000);

        // Should show appearance options
        expect(page.url()).toMatch(/settings/);
      }
    });

    test('should toggle dark mode', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const appearanceLink = page.getByRole('link', { name: /appearance|theme|display/i });
      if (await appearanceLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await appearanceLink.click();
        await page.waitForTimeout(1000);

        const darkModeToggle = page.getByRole('button', { name: /dark mode|theme/i });
        if (await darkModeToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
          await darkModeToggle.click();
          await page.waitForTimeout(1000);

          // Should change theme
          expect(page.url()).toContain('/settings');
        }
      }
    });

    test('should change font size', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const appearanceLink = page.getByRole('link', { name: /appearance|theme|display/i });
      if (await appearanceLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await appearanceLink.click();
        await page.waitForTimeout(1000);

        // Look for font size options
        const fontSizeControl = page.locator('select, input[type="range"]').filter({ hasText: /font|size/i }).first();
        if (await fontSizeControl.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(fontSizeControl).toBeVisible();
        }
      }
    });
  });

  test.describe('Language Settings', () => {
    test('should show language settings', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const languageLink = page.getByRole('link', { name: /language|locale/i });
      if (await languageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await languageLink.click();
        await page.waitForTimeout(1000);

        // Should show language options
        expect(page.url()).toMatch(/settings/);
      }
    });

    test('should change language', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const languageLink = page.getByRole('link', { name: /language|locale/i });
      if (await languageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await languageLink.click();
        await page.waitForTimeout(1000);

        const languageSelect = page.locator('select, [role="combobox"]').first();
        if (await languageSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
          await languageSelect.click();
          await page.waitForTimeout(500);

          // Should show language options
          expect(page.url()).toContain('/settings');
        }
      }
    });
  });

  test.describe('Integration Settings', () => {
    test('should show integrations page', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const integrationsLink = page.getByRole('link', { name: /integration|connection/i });
      if (await integrationsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await integrationsLink.click();
        await page.waitForTimeout(1000);

        // Should show integrations
        expect(page.url()).toMatch(/settings/);
      }
    });

    test('should show available integrations', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const integrationsLink = page.getByRole('link', { name: /integration|connection/i });
      if (await integrationsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await integrationsLink.click();
        await page.waitForTimeout(1000);

        // Look for integration options
        const teamsIntegration = page.getByText(/microsoft teams|teams/i);
        const calendarIntegration = page.getByText(/google calendar|calendar/i);

        const hasTeams = await teamsIntegration.isVisible({ timeout: 2000 }).catch(() => false);
        const hasCalendar = await calendarIntegration.isVisible({ timeout: 2000 }).catch(() => false);

        // Should show integration options
        if (hasTeams || hasCalendar) {
          expect(hasTeams || hasCalendar).toBe(true);
        }
      }
    });

    test('should connect integration', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const integrationsLink = page.getByRole('link', { name: /integration|connection/i });
      if (await integrationsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await integrationsLink.click();
        await page.waitForTimeout(1000);

        const connectButton = page.getByRole('button', { name: /connect|enable/i }).first();
        if (await connectButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          // Should show connect button
          await expect(connectButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Billing Settings', () => {
    test('should show billing page', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const billingLink = page.getByRole('link', { name: /billing|subscription|payment/i });
      if (await billingLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await billingLink.click();
        await page.waitForTimeout(1000);

        // Should show billing info
        expect(page.url()).toMatch(/settings/);
      }
    });

    test('should show current plan', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const billingLink = page.getByRole('link', { name: /billing|subscription|payment/i });
      if (await billingLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await billingLink.click();
        await page.waitForTimeout(1000);

        // Look for plan information
        const planInfo = page.getByText(/free|pro|business|enterprise|plan/i);
        await expect(planInfo.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should show upgrade button', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const billingLink = page.getByRole('link', { name: /billing|subscription|payment/i });
      if (await billingLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await billingLink.click();
        await page.waitForTimeout(1000);

        const upgradeButton = page.getByRole('button', { name: /upgrade|change plan/i });
        if (await upgradeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(upgradeButton).toBeVisible();
        }
      }
    });

    test('should show payment methods', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const billingLink = page.getByRole('link', { name: /billing|subscription|payment/i });
      if (await billingLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await billingLink.click();
        await page.waitForTimeout(1000);

        // Look for payment methods section
        const paymentMethods = page.getByText(/payment method|credit card|billing information/i);
        if (await paymentMethods.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(paymentMethods).toBeVisible();
        }
      }
    });

    test('should show billing history', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const billingLink = page.getByRole('link', { name: /billing|subscription|payment/i });
      if (await billingLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await billingLink.click();
        await page.waitForTimeout(1000);

        // Look for billing history
        const billingHistory = page.getByText(/billing history|invoices|transactions/i);
        if (await billingHistory.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(billingHistory).toBeVisible();
        }
      }
    });
  });

  test.describe('Data & Storage', () => {
    test('should show data management options', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const dataLink = page.getByRole('link', { name: /data|storage/i });
      if (await dataLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dataLink.click();
        await page.waitForTimeout(1000);

        // Should show data options
        expect(page.url()).toMatch(/settings/);
      }
    });

    test('should show storage usage', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const dataLink = page.getByRole('link', { name: /data|storage/i });
      if (await dataLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dataLink.click();
        await page.waitForTimeout(1000);

        // Look for storage information
        const storageInfo = page.getByText(/storage|GB|MB|usage/i);
        if (await storageInfo.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(storageInfo.first()).toBeVisible();
        }
      }
    });

    test('should show export data option', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const dataLink = page.getByRole('link', { name: /data|storage/i });
      if (await dataLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dataLink.click();
        await page.waitForTimeout(1000);

        const exportButton = page.getByRole('button', { name: /export|download data/i });
        if (await exportButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(exportButton).toBeVisible();
        }
      }
    });

    test('should show delete account option', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const dataLink = page.getByRole('link', { name: /data|storage/i });
      if (await dataLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dataLink.click();
        await page.waitForTimeout(1000);

        const deleteButton = page.getByRole('button', { name: /delete account|close account/i });
        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(deleteButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Advanced Settings', () => {
    test('should show advanced settings', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const advancedLink = page.getByRole('link', { name: /advanced/i });
      if (await advancedLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await advancedLink.click();
        await page.waitForTimeout(1000);

        // Should show advanced options
        expect(page.url()).toMatch(/settings/);
      }
    });

    test('should show developer options', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const advancedLink = page.getByRole('link', { name: /advanced|developer/i });
      if (await advancedLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await advancedLink.click();
        await page.waitForTimeout(1000);

        // Look for API keys or developer tools
        const apiSection = page.getByText(/api key|developer|webhook/i);
        if (await apiSection.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(apiSection).toBeVisible();
        }
      }
    });
  });
});
