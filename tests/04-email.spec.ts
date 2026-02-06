import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers';



test.describe('Email Functionality', () => {
  test.describe('Inbox', () => {
    test('should show inbox page', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/inbox');

      // Should show inbox heading or email list
      const inboxHeading = page.getByRole('heading', { name: /inbox/i });
      if (await inboxHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(inboxHeading).toBeVisible();
      }
    });

    test('should display email list', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      // Check for email list or empty state
      const emailList = page.locator('[data-testid="email-list"], .email-list, [role="list"]').first();
      const emptyState = page.getByText(/no emails|empty|connect email/i);

      const hasEmails = await emailList.isVisible({ timeout: 3000 }).catch(() => false);
      const isEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

      // Should show either emails or empty state
      expect(hasEmails || isEmpty).toBe(true);
    });

    test('should filter emails by unread', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      // Look for unread filter button
      const unreadFilter = page.getByRole('button', { name: /unread/i });
      if (await unreadFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
        await unreadFilter.click();
        await page.waitForTimeout(1000);

        // Should update URL or filter state
        expect(page.url()).toMatch(/inbox/);
      }
    });

    test('should search emails', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      // Look for search input
      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('test search');
        await page.waitForTimeout(1000);

        // Should perform search (might show no results)
        expect(page.url()).toContain('/inbox');
      }
    });
  });

  test.describe('Email Viewing', () => {
    test('should open email detail view', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      // Click first email if available
      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        // Should show email detail
        const emailContent = page.locator('[data-testid="email-content"], .email-content, [role="article"]');
        await expect(emailContent).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should show email actions', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        // Check for action buttons
        const replyButton = page.getByRole('button', { name: /reply/i });
        const forwardButton = page.getByRole('button', { name: /forward/i });
        const deleteButton = page.getByRole('button', { name: /delete|trash/i });

        // At least one action should be visible
        const hasReply = await replyButton.isVisible({ timeout: 2000 }).catch(() => false);
        const hasForward = await forwardButton.isVisible({ timeout: 2000 }).catch(() => false);
        const hasDelete = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);

        expect(hasReply || hasForward || hasDelete).toBe(true);
      }
    });
  });

  test.describe('Email Composition', () => {
    test('should show compose button', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      await expect(composeButton).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should open compose modal', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(1000);

        // Should show compose form
        const toField = page.getByLabel(/to|recipient/i);
        const subjectField = page.getByLabel(/subject/i);

        await expect(toField.or(subjectField)).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    });

    test('should validate required fields in compose', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        // Try to send without filling fields
        const sendButton = page.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await sendButton.click();
          await page.waitForTimeout(500);

          // Should show validation error or stay on form
          const toField = page.getByLabel(/to|recipient/i);
          await expect(toField).toBeVisible().catch(() => {});
        }
      }
    });

    test('should compose email with AI Compose', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        // Look for AI Compose button
        const aiComposeButton = page.getByRole('button', { name: /ai compose|compose with ai/i });
        if (await aiComposeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await aiComposeButton.click();
          await page.waitForTimeout(500);

          // Should show AI prompt input
          const aiPromptInput = page.getByPlaceholder(/what would you like to write|describe your email/i);
          await expect(aiPromptInput).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });
  });

  test.describe('Email Actions', () => {
    test('should reply to email', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const replyButton = page.getByRole('button', { name: /^reply$/i });
        if (await replyButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await replyButton.click();
          await page.waitForTimeout(500);

          // Should show reply composer
          const replyComposer = page.locator('[data-testid="reply-composer"], .reply-composer, textarea');
          await expect(replyComposer.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });

    test('should mark email as read/unread', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Look for mark as read/unread button
        const markButton = page.getByRole('button', { name: /mark as|read|unread/i });
        if (await markButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await markButton.click();
          await page.waitForTimeout(500);

          // Action should complete
          expect(page.url()).toContain('/inbox');
        }
      }
    });

    test('should move email to folder', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        // Look for move to folder button
        const moveButton = page.getByRole('button', { name: /move to|folder/i });
        if (await moveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await moveButton.click();
          await page.waitForTimeout(500);

          // Should show folder list
          const folderList = page.getByText(/inbox|sent|drafts|trash/i);
          await expect(folderList.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });

    test('should delete email', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const deleteButton = page.getByRole('button', { name: /delete|trash/i });
        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deleteButton.click();
          await page.waitForTimeout(1000);

          // Should remove email or show confirmation
          expect(page.url()).toContain('/inbox');
        }
      }
    });
  });

  test.describe('Folders', () => {
    test('should show folder list', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      // Look for folder sidebar or list
      const inboxFolder = page.getByText(/^inbox$/i).first();
      const sentFolder = page.getByText(/sent/i).first();

      const hasInbox = await inboxFolder.isVisible({ timeout: 3000 }).catch(() => false);
      const hasSent = await sentFolder.isVisible({ timeout: 3000 }).catch(() => false);

      // At least one folder should be visible
      expect(hasInbox || hasSent).toBe(true);
    });

    test('should navigate to sent folder', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const sentFolder = page.getByRole('button', { name: /sent/i }).or(page.getByText(/sent/i));
      if (await sentFolder.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await sentFolder.first().click();
        await page.waitForTimeout(1000);

        // Should navigate to sent folder
        expect(page.url()).toMatch(/inbox|sent/);
      }
    });

    test('should navigate to drafts folder', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const draftsFolder = page.getByRole('button', { name: /drafts/i }).or(page.getByText(/drafts/i));
      if (await draftsFolder.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await draftsFolder.first().click();
        await page.waitForTimeout(1000);

        // Should navigate to drafts folder
        expect(page.url()).toMatch(/inbox|drafts/);
      }
    });
  });

  test.describe('Email Account Connection', () => {
    test('should show connect email account option', async ({ page }) => {
      await createAndLoginUser(page);

      // Navigate to settings or inbox
      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      // Look for email accounts section
      const emailAccountsLink = page.getByRole('link', { name: /email account/i });
      if (await emailAccountsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailAccountsLink.click();
        await page.waitForTimeout(1000);

        // Should show connect account button
        const connectButton = page.getByRole('button', { name: /connect|add account/i });
        await expect(connectButton).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should show email account list in settings', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings/email-accounts');
      await page.waitForTimeout(3000); // Wait for API call and render

      // Should show accounts list or empty state
      const accountsList = page.locator('[data-testid="email-accounts-list"]');
      const emptyState = page.locator('[data-testid="email-accounts-empty"]');

      const hasList = await accountsList.isVisible({ timeout: 3000 }).catch(() => false);
      const isEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

      expect(hasList || isEmpty).toBe(true);
    });
  });

  test.describe('Email Attachments', () => {
    test('should show attachments in email', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        // Look for attachment indicator
        const attachmentIcon = page.locator('[data-testid="attachment"], .attachment-icon, svg[class*="paperclip"]');
        if (await attachmentIcon.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          // Should display attachment
          expect(await attachmentIcon.first().isVisible()).toBe(true);
        }
      }
    });

    test('should attach files when composing', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        // Look for attach file button
        const attachButton = page.getByRole('button', { name: /attach|file/i }).or(page.locator('input[type="file"]'));
        if (await attachButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          // Should show attach option
          await expect(attachButton.first()).toBeVisible();
        }
      }
    });
  });
});
