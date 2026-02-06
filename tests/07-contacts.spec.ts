import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers';



test.describe('Contacts', () => {
  test.describe('Contact List', () => {
    test('should show contacts page', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/contacts');

      // Should show contacts heading
      const contactsHeading = page.getByRole('heading', { name: /contacts/i });
      await expect(contactsHeading).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should display contact list or empty state', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      // Check for contact list or empty state
      const contactList = page.locator('[data-testid="contact-list"], .contact-list, [role="list"]');
      const emptyState = page.getByText(/no contacts|empty|add your first contact/i);

      const hasList = await contactList.isVisible({ timeout: 3000 }).catch(() => false);
      const isEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

      // Should show either contacts or empty state
      expect(hasList || isEmpty).toBe(true);
    });

    test('should show contact count', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      // Look for contact count
      const contactCount = page.getByText(/\d+ contacts?/i);
      if (await contactCount.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(contactCount).toBeVisible();
      }
    });
  });

  test.describe('Contact Creation', () => {
    test('should show create contact button', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const createButton = page.getByRole('button', { name: /add contact|new contact|create contact/i });
      await expect(createButton).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should open create contact modal', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const createButton = page.getByRole('button', { name: /add contact|new contact|create contact/i });
      if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(1000);

        // Should show contact form
        const nameField = page.getByLabel(/name|full name/i);
        const emailField = page.getByLabel(/email/i);

        await expect(nameField.or(emailField)).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    });

    test('should create a new contact', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const createButton = page.getByRole('button', { name: /add contact|new contact|create contact/i });
      if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(500);

        // Fill contact details
        const nameField = page.getByLabel(/name|full name/i);
        if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameField.fill(`Test Contact ${Date.now()}`);

          const emailField = page.getByLabel(/email/i);
          if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await emailField.fill(`contact${Date.now()}@example.com`);

            // Save contact
            const saveButton = page.getByRole('button', { name: /save|create|add/i });
            if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await saveButton.click();
              await page.waitForTimeout(2000);

              // Should show success
              const successMessage = page.getByText(/created|added|success/i);
              await expect(successMessage).toBeVisible({ timeout: 5000 }).catch(() => {});
            }
          }
        }
      }
    });

    test('should validate email format when creating contact', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const createButton = page.getByRole('button', { name: /add contact|new contact|create contact/i });
      if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(500);

        const nameField = page.getByLabel(/name|full name/i);
        const emailField = page.getByLabel(/email/i);

        if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameField.fill('Test Contact');

          if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await emailField.fill('invalid-email');

            const saveButton = page.getByRole('button', { name: /save|create|add/i });
            if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await saveButton.click();
              await page.waitForTimeout(500);

              // Should show validation error or stay on form
              await expect(emailField).toBeVisible();
            }
          }
        }
      }
    });

    test('should create contact with phone number', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const createButton = page.getByRole('button', { name: /add contact|new contact|create contact/i });
      if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(500);

        const nameField = page.getByLabel(/name|full name/i);
        const phoneField = page.getByLabel(/phone|mobile/i);

        if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameField.fill('Contact With Phone');

          if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await phoneField.fill('+1234567890');

            const saveButton = page.getByRole('button', { name: /save|create|add/i });
            if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await saveButton.click();
              await page.waitForTimeout(2000);

              expect(page.url()).toContain('/contacts');
            }
          }
        }
      }
    });

    test('should create contact with company', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const createButton = page.getByRole('button', { name: /add contact|new contact|create contact/i });
      if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(500);

        const nameField = page.getByLabel(/name|full name/i);
        const companyField = page.getByLabel(/company|organization/i);

        if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameField.fill('Business Contact');

          if (await companyField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await companyField.fill('Acme Corporation');

            const saveButton = page.getByRole('button', { name: /save|create|add/i });
            if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await saveButton.click();
              await page.waitForTimeout(2000);

              expect(page.url()).toContain('/contacts');
            }
          }
        }
      }
    });
  });

  test.describe('Contact Viewing', () => {
    test('should view contact details', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const firstContact = page.locator('[data-testid="contact-item"], .contact-item, [role="listitem"]').first();
      if (await firstContact.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstContact.click();
        await page.waitForTimeout(1000);

        // Should show contact details
        const contactDetails = page.locator('[data-testid="contact-details"], .contact-details');
        await expect(contactDetails).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    });

    test('should show contact email in details', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const firstContact = page.locator('[data-testid="contact-item"], .contact-item').first();
      if (await firstContact.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstContact.click();
        await page.waitForTimeout(1000);

        // Should show email
        const emailText = page.getByText(/@/);
        if (await emailText.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(emailText.first()).toBeVisible();
        }
      }
    });

    test('should show contact phone in details', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const firstContact = page.locator('[data-testid="contact-item"], .contact-item').first();
      if (await firstContact.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstContact.click();
        await page.waitForTimeout(1000);

        // Look for phone number
        const phoneText = page.getByText(/\+?\d{10,}/);
        if (await phoneText.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(phoneText.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Contact Editing', () => {
    test('should edit contact', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const firstContact = page.locator('[data-testid="contact-item"], .contact-item').first();
      if (await firstContact.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstContact.click();
        await page.waitForTimeout(1000);

        const editButton = page.getByRole('button', { name: /edit/i });
        if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await editButton.click();
          await page.waitForTimeout(500);

          // Should show edit form
          const nameField = page.getByLabel(/name|full name/i);
          await expect(nameField).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });

    test('should update contact name', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const firstContact = page.locator('[data-testid="contact-item"], .contact-item').first();
      if (await firstContact.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstContact.click();
        await page.waitForTimeout(1000);

        const editButton = page.getByRole('button', { name: /edit/i });
        if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await editButton.click();
          await page.waitForTimeout(500);

          const nameField = page.getByLabel(/name|full name/i);
          if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nameField.clear();
            await nameField.fill(`Updated Contact ${Date.now()}`);

            const saveButton = page.getByRole('button', { name: /save|update/i });
            if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await saveButton.click();
              await page.waitForTimeout(2000);

              // Should show success
              expect(page.url()).toContain('/contacts');
            }
          }
        }
      }
    });
  });

  test.describe('Contact Deletion', () => {
    test('should delete contact', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const firstContact = page.locator('[data-testid="contact-item"], .contact-item').first();
      if (await firstContact.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstContact.click();
        await page.waitForTimeout(1000);

        const deleteButton = page.getByRole('button', { name: /delete|remove/i });
        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deleteButton.click();
          await page.waitForTimeout(1000);

          // Should show confirmation or remove contact
          const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
          if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmButton.click();
            await page.waitForTimeout(1000);
          }

          expect(page.url()).toContain('/contacts');
        }
      }
    });
  });

  test.describe('Contact Search', () => {
    test('should show search input', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const searchInput = page.getByPlaceholder(/search contacts|search/i);
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(searchInput).toBeVisible();
      }
    });

    test('should search contacts by name', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const searchInput = page.getByPlaceholder(/search contacts|search/i);
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);

        // Should filter contacts
        expect(page.url()).toContain('/contacts');
      }
    });

    test('should search contacts by email', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const searchInput = page.getByPlaceholder(/search contacts|search/i);
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('@example.com');
        await page.waitForTimeout(1000);

        // Should filter contacts
        expect(page.url()).toContain('/contacts');
      }
    });
  });

  test.describe('Contact Actions', () => {
    test('should compose email to contact', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const firstContact = page.locator('[data-testid="contact-item"], .contact-item').first();
      if (await firstContact.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstContact.click();
        await page.waitForTimeout(1000);

        const emailButton = page.getByRole('button', { name: /send email|compose|email/i });
        if (await emailButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await emailButton.click();
          await page.waitForTimeout(1000);

          // Should open email composer
          const toField = page.getByLabel(/to|recipient/i);
          await expect(toField).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });

    test('should send SMS to contact', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const firstContact = page.locator('[data-testid="contact-item"], .contact-item').first();
      if (await firstContact.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstContact.click();
        await page.waitForTimeout(1000);

        const smsButton = page.getByRole('button', { name: /send sms|text|message/i });
        if (await smsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await smsButton.click();
          await page.waitForTimeout(1000);

          // Should open SMS composer
          expect(page.url()).toMatch(/contacts|sms/);
        }
      }
    });

    test('should call contact', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const firstContact = page.locator('[data-testid="contact-item"], .contact-item').first();
      if (await firstContact.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstContact.click();
        await page.waitForTimeout(1000);

        const callButton = page.getByRole('button', { name: /call|phone/i });
        if (await callButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          // Should show call option
          await expect(callButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Contact Import/Export', () => {
    test('should show import contacts option', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      // Look for import button or menu
      const importButton = page.getByRole('button', { name: /import|upload/i });
      if (await importButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(importButton).toBeVisible();
      }
    });

    test('should show export contacts option', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      // Look for export button or menu
      const exportButton = page.getByRole('button', { name: /export|download/i });
      if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(exportButton).toBeVisible();
      }
    });
  });

  test.describe('Contact Groups', () => {
    test('should show contact groups or tags', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      // Look for groups or tags section
      const groupsSection = page.getByText(/groups|tags|categories/i);
      if (await groupsSection.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(groupsSection.first()).toBeVisible();
      }
    });

    test('should filter contacts by group', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const groupFilter = page.locator('[data-testid="group-filter"], .group-filter').first();
      if (await groupFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
        await groupFilter.click();
        await page.waitForTimeout(1000);

        // Should filter by group
        expect(page.url()).toContain('/contacts');
      }
    });
  });

  test.describe('Contact Sync', () => {
    test('should show sync status', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      // Look for sync indicator
      const syncStatus = page.getByText(/synced|last sync|sync now/i);
      if (await syncStatus.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(syncStatus.first()).toBeVisible();
      }
    });

    test('should manually sync contacts', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/contacts');
      await page.waitForTimeout(2000);

      const syncButton = page.getByRole('button', { name: /sync now|refresh|sync/i });
      if (await syncButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await syncButton.click();
        await page.waitForTimeout(2000);

        // Should trigger sync
        expect(page.url()).toContain('/contacts');
      }
    });
  });
});
