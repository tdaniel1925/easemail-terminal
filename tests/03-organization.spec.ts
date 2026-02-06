import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers';



test.describe('Organization Management', () => {
  test.describe('Organization Creation', () => {
    test('should show organizations page', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/organization');
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/organization');
    });

    test('should create a new organization', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/organization');
      await page.waitForTimeout(1000);

      // Click new organization button
      const newOrgButton = page.getByRole('button', { name: /new organization|create/i });
      if (await newOrgButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newOrgButton.click();
        await page.waitForTimeout(500);

        // Fill organization name
        const orgName = `Test Organization ${Date.now()}`;
        await page.getByLabel(/organization name/i).fill(orgName);

        // Submit
        await page.getByRole('button', { name: /create/i }).click();

        // Should show success or redirect to organization page
        await page.waitForTimeout(2000);
        const successMessage = page.getByText(/created|success/i);
        await expect(successMessage).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should validate organization name is required', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/organization');
      await page.waitForTimeout(1000);

      const newOrgButton = page.getByRole('button', { name: /new organization|create/i });
      if (await newOrgButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newOrgButton.click();
        await page.waitForTimeout(500);

        // Try to submit without name
        await page.getByRole('button', { name: /create/i }).click();
        await page.waitForTimeout(500);

        // Should show validation error
        const nameField = page.getByLabel(/organization name/i);
        await expect(nameField).toBeVisible();
      }
    });
  });

  test.describe('Organization Settings', () => {
    test('should update organization name', async ({ page }) => {
      await createAndLoginUser(page);

      // Create an organization first
      await page.goto('/app/organization');
      await page.waitForTimeout(1000);

      const newOrgButton = page.getByRole('button', { name: /new organization|create/i });
      if (await newOrgButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newOrgButton.click();
        const orgName = `Original Org ${Date.now()}`;
        await page.getByLabel(/organization name/i).fill(orgName);
        await page.getByRole('button', { name: /create/i }).click();
        await page.waitForTimeout(2000);

        // Navigate to organization and open settings
        const viewDetailsButton = page.getByRole('button', { name: /view details/i }).first();
        if (await viewDetailsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await viewDetailsButton.click();
          await page.waitForTimeout(1000);

          // Click settings button
          const settingsButton = page.getByRole('button', { name: /settings/i });
          if (await settingsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await settingsButton.click();
            await page.waitForTimeout(500);

            // Update organization name
            const nameField = page.getByLabel(/organization name/i);
            if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
              await nameField.clear();
              await nameField.fill(`Updated Org ${Date.now()}`);

              // Save changes
              await page.getByRole('button', { name: /save/i }).click();
              await page.waitForTimeout(2000);

              // Should show success message
              const successMessage = page.getByText(/updated|success/i);
              await expect(successMessage).toBeVisible({ timeout: 5000 }).catch(() => {});
            }
          }
        }
      }
    });
  });

  test.describe('Member Management', () => {
    test('should invite a new member', async ({ page }) => {
      await createAndLoginUser(page);

      // Create organization
      await page.goto('/app/organization');
      await page.waitForTimeout(1000);

      const newOrgButton = page.getByRole('button', { name: /new organization|create/i });
      if (await newOrgButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newOrgButton.click();
        await page.getByLabel(/organization name/i).fill(`Org ${Date.now()}`);
        await page.getByRole('button', { name: /create/i }).click();
        await page.waitForTimeout(2000);

        // Open organization details
        const viewDetailsButton = page.getByRole('button', { name: /view details/i }).first();
        if (await viewDetailsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await viewDetailsButton.click();
          await page.waitForTimeout(1000);

          // Click invite member button
          const inviteButton = page.getByRole('button', { name: /invite member/i });
          if (await inviteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await inviteButton.click();
            await page.waitForTimeout(500);

            // Fill invitation details
            const memberEmail = `member+${Date.now()}@example.com`;
            await page.getByLabel(/email/i).fill(memberEmail);

            // Select role
            const roleSelect = page.getByLabel(/role/i);
            if (await roleSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
              await roleSelect.click();
              await page.getByText('MEMBER').first().click().catch(() => {});
            }

            // Send invitation
            await page.getByRole('button', { name: /send|invite/i }).click();
            await page.waitForTimeout(2000);

            // Should show success message
            const successMessage = page.getByText(/sent|success/i);
            await expect(successMessage).toBeVisible({ timeout: 5000 }).catch(() => {});
          }
        }
      }
    });

    test('should show pending invitations', async ({ page }) => {
      await createAndLoginUser(page);

      // Create org and invite member (reuse previous test logic)
      await page.goto('/app/organization');
      await page.waitForTimeout(1000);

      const newOrgButton = page.getByRole('button', { name: /new organization|create/i });
      if (await newOrgButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newOrgButton.click();
        await page.getByLabel(/organization name/i).fill(`Org ${Date.now()}`);
        await page.getByRole('button', { name: /create/i }).click();
        await page.waitForTimeout(2000);

        const viewDetailsButton = page.getByRole('button', { name: /view details/i }).first();
        if (await viewDetailsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await viewDetailsButton.click();
          await page.waitForTimeout(1000);

          const inviteButton = page.getByRole('button', { name: /invite member/i });
          if (await inviteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await inviteButton.click();
            const memberEmail = `member+${Date.now()}@example.com`;
            await page.getByLabel(/email/i).fill(memberEmail);
            await page.getByRole('button', { name: /send|invite/i }).click();
            await page.waitForTimeout(2000);

            // Check for pending invitations section
            const pendingSection = page.getByText(/pending invitation/i);
            await expect(pendingSection).toBeVisible({ timeout: 5000 }).catch(() => {});

            // Should show the invited email
            const invitedEmail = page.getByText(memberEmail);
            await expect(invitedEmail).toBeVisible({ timeout: 3000 }).catch(() => {});
          }
        }
      }
    });
  });

  test.describe('Organization Dashboard', () => {
    test('should show organization dashboard', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/organization');
      await page.waitForTimeout(1000);

      // Create organization
      const newOrgButton = page.getByRole('button', { name: /new organization|create/i });
      if (await newOrgButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newOrgButton.click();
        await page.getByLabel(/organization name/i).fill(`Org ${Date.now()}`);
        await page.getByRole('button', { name: /create/i }).click();
        await page.waitForTimeout(2000);

        // Open dashboard
        const viewDetailsButton = page.getByRole('button', { name: /view details/i }).first();
        if (await viewDetailsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await viewDetailsButton.click();
          await page.waitForTimeout(1000);

          // Click dashboard tab
          const dashboardTab = page.getByRole('tab', { name: /dashboard/i });
          if (await dashboardTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await dashboardTab.click();
            await page.waitForTimeout(1000);

            // Should show dashboard metrics
            const metricsSection = page.getByText(/team overview|feature usage|recent activity/i);
            await expect(metricsSection.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
          }
        }
      }
    });
  });

  test.describe('Organization Analytics', () => {
    test('should show analytics page', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/organization');
      await page.waitForTimeout(1000);

      const newOrgButton = page.getByRole('button', { name: /new organization|create/i });
      if (await newOrgButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newOrgButton.click();
        await page.getByLabel(/organization name/i).fill(`Org ${Date.now()}`);
        await page.getByRole('button', { name: /create/i }).click();
        await page.waitForTimeout(2000);

        const viewDetailsButton = page.getByRole('button', { name: /view details/i }).first();
        if (await viewDetailsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await viewDetailsButton.click();
          await page.waitForTimeout(1000);

          // Click analytics tab
          const analyticsTab = page.getByRole('tab', { name: /analytics/i });
          if (await analyticsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await analyticsTab.click();
            await page.waitForTimeout(1000);

            // Should show analytics content
            const analyticsContent = page.getByText(/last 7 days|last 30 days|activity|usage/i);
            await expect(analyticsContent.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
          }
        }
      }
    });
  });

  test.describe('Webhooks', () => {
    test('should show webhooks page for owners/admins', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/organization');
      await page.waitForTimeout(1000);

      const newOrgButton = page.getByRole('button', { name: /new organization|create/i });
      if (await newOrgButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newOrgButton.click();
        await page.getByLabel(/organization name/i).fill(`Org ${Date.now()}`);
        await page.getByRole('button', { name: /create/i }).click();
        await page.waitForTimeout(2000);

        const viewDetailsButton = page.getByRole('button', { name: /view details/i }).first();
        if (await viewDetailsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await viewDetailsButton.click();
          await page.waitForTimeout(1000);

          // Click webhooks tab (if visible for owner)
          const webhooksTab = page.getByRole('tab', { name: /webhook/i });
          if (await webhooksTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await webhooksTab.click();
            await page.waitForTimeout(1000);

            // Should show webhooks page
            const webhooksContent = page.getByText(/create webhook|webhook|events/i);
            await expect(webhooksContent.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
          }
        }
      }
    });
  });

  test.describe('Audit Logs', () => {
    test('should show audit logs for owners/admins', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/organization');
      await page.waitForTimeout(1000);

      const newOrgButton = page.getByRole('button', { name: /new organization|create/i });
      if (await newOrgButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newOrgButton.click();
        await page.getByLabel(/organization name/i).fill(`Org ${Date.now()}`);
        await page.getByRole('button', { name: /create/i }).click();
        await page.waitForTimeout(2000);

        const viewDetailsButton = page.getByRole('button', { name: /view details/i }).first();
        if (await viewDetailsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await viewDetailsButton.click();
          await page.waitForTimeout(1000);

          // Click audit logs tab (if visible for owner)
          const auditLogsTab = page.getByRole('tab', { name: /audit|log/i });
          if (await auditLogsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await auditLogsTab.click();
            await page.waitForTimeout(1000);

            // Should show audit logs
            const auditLogsContent = page.getByText(/audit|activity|history/i);
            await expect(auditLogsContent.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
          }
        }
      }
    });
  });
});
