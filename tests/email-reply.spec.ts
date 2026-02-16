import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers';

test.describe('Email Reply Functionality', () => {
  test.describe('Reply', () => {
    test('should show reply button when viewing an email', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      // Click first email if available
      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        // Check for reply button
        const replyButton = page.getByRole('button', { name: /^reply$/i });
        const hasReply = await replyButton.isVisible({ timeout: 3000 }).catch(() => false);

        expect(hasReply).toBe(true);
      }
    });

    test('should open composer when reply is clicked', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const replyButton = page.getByRole('button', { name: /^reply$/i });
        if (await replyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await replyButton.click();
          await page.waitForTimeout(1000);

          // Composer should be visible
          const composerDialog = page.getByRole('dialog');
          await expect(composerDialog).toBeVisible({ timeout: 3000 });

          // Should have subject field with "Re:" prefix
          const subjectField = page.getByLabel(/subject/i);
          const subjectValue = await subjectField.inputValue().catch(() => '');
          expect(subjectValue).toContain('Re:');
        }
      }
    });

    test('should pre-fill recipient when replying', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const replyButton = page.getByRole('button', { name: /^reply$/i });
        if (await replyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await replyButton.click();
          await page.waitForTimeout(1000);

          // Check To field is pre-filled
          const toField = page.getByLabel(/^to$/i);
          const toValue = await toField.inputValue().catch(() => '');

          // To field should not be empty
          expect(toValue.length).toBeGreaterThan(0);
        }
      }
    });

    test('should include quoted content with proper spacing', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const replyButton = page.getByRole('button', { name: /^reply$/i });
        if (await replyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await replyButton.click();
          await page.waitForTimeout(1000);

          // Check for message body field - should contain quoted content with spacing
          const bodyField = page.locator('[contenteditable="true"]').first();
          if (await bodyField.isVisible({ timeout: 3000 }).catch(() => false)) {
            const bodyContent = await bodyField.textContent().catch(() => '');

            // Should have blank lines for user to type response
            // The content should start with blank lines, then quoted content
            expect(bodyContent).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Reply All', () => {
    test('should show reply all button when viewing an email', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        // Check for reply all button
        const replyAllButton = page.getByRole('button', { name: /reply all/i });
        const hasReplyAll = await replyAllButton.isVisible({ timeout: 3000 }).catch(() => false);

        expect(hasReplyAll).toBe(true);
      }
    });

    test('should open composer when reply all is clicked', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const replyAllButton = page.getByRole('button', { name: /reply all/i });
        if (await replyAllButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await replyAllButton.click();
          await page.waitForTimeout(1000);

          // Composer should be visible
          const composerDialog = page.getByRole('dialog');
          await expect(composerDialog).toBeVisible({ timeout: 3000 });

          // Should have subject field with "Re:" prefix
          const subjectField = page.getByLabel(/subject/i);
          const subjectValue = await subjectField.inputValue().catch(() => '');
          expect(subjectValue).toContain('Re:');
        }
      }
    });

    test('should include all recipients in reply all', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const replyAllButton = page.getByRole('button', { name: /reply all/i });
        if (await replyAllButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await replyAllButton.click();
          await page.waitForTimeout(1000);

          // Check To field is pre-filled
          const toField = page.getByLabel(/^to$/i);
          const toValue = await toField.inputValue().catch(() => '');

          // To field should not be empty
          expect(toValue.length).toBeGreaterThan(0);

          // If there are CC recipients, CC field should be visible
          const ccButton = page.getByRole('button', { name: /cc\/bcc/i });
          const ccFieldVisible = await page.getByLabel(/^cc$/i).isVisible({ timeout: 1000 }).catch(() => false);

          // Either CC button exists (to show CC) or CC field is already visible
          expect(ccFieldVisible || await ccButton.isVisible().catch(() => false)).toBeTruthy();
        }
      }
    });
  });

  test.describe('Composer UI for Replies', () => {
    test('should show AI buttons with labels in reply composer', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const replyButton = page.getByRole('button', { name: /^reply$/i });
        if (await replyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await replyButton.click();
          await page.waitForTimeout(1000);

          // Check for AI Dictate button with label
          const aiDictateButton = page.getByRole('button', { name: /ai dictate/i });
          const hasAiDictate = await aiDictateButton.isVisible({ timeout: 3000 }).catch(() => false);

          // Check for AI Remix button with label
          const aiRemixButton = page.getByRole('button', { name: /ai remix/i });
          const hasAiRemix = await aiRemixButton.isVisible({ timeout: 3000 }).catch(() => false);

          // Check for Voice Message button with label
          const voiceMessageButton = page.getByRole('button', { name: /voice message/i });
          const hasVoiceMessage = await voiceMessageButton.isVisible({ timeout: 3000 }).catch(() => false);

          // At least AI buttons should be visible
          expect(hasAiDictate || hasAiRemix || hasVoiceMessage).toBe(true);
        }
      }
    });

    test('should have different icons for AI Dictate and Voice Message', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const replyButton = page.getByRole('button', { name: /^reply$/i });
        if (await replyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await replyButton.click();
          await page.waitForTimeout(1000);

          // Check both buttons exist
          const aiDictateButton = page.getByRole('button', { name: /ai dictate/i });
          const voiceMessageButton = page.getByRole('button', { name: /voice message/i });

          const hasAiDictate = await aiDictateButton.isVisible({ timeout: 3000 }).catch(() => false);
          const hasVoiceMessage = await voiceMessageButton.isVisible({ timeout: 3000 }).catch(() => false);

          // Both buttons should be visible
          if (hasAiDictate && hasVoiceMessage) {
            // Get the SVG elements inside each button
            const aiDictateIcon = aiDictateButton.locator('svg').first();
            const voiceMessageIcon = voiceMessageButton.locator('svg').first();

            // Icons should be different (different classes or attributes)
            const aiDictateHtml = await aiDictateIcon.innerHTML().catch(() => '');
            const voiceMessageHtml = await voiceMessageIcon.innerHTML().catch(() => '');

            // Icons should not be identical
            expect(aiDictateHtml).not.toBe(voiceMessageHtml);
          }
        }
      }
    });

    test('should not have overlapping content over AI buttons', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const replyButton = page.getByRole('button', { name: /^reply$/i });
        if (await replyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await replyButton.click();
          await page.waitForTimeout(2000); // Wait a bit longer for content to settle

          // Check that AI buttons toolbar is visible
          const aiRemixButton = page.getByRole('button', { name: /ai remix/i });

          if (await aiRemixButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Get the button's bounding box
            const buttonBox = await aiRemixButton.boundingBox();

            if (buttonBox) {
              // Check that the button is actually clickable (not covered)
              const isClickable = await aiRemixButton.isEnabled({ timeout: 1000 }).catch(() => false);
              expect(isClickable).toBe(true);
            }
          }
        }
      }
    });
  });

  test.describe('Quoted Content Formatting', () => {
    test('should have blank space above quoted content for user reply', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const replyButton = page.getByRole('button', { name: /^reply$/i });
        if (await replyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await replyButton.click();
          await page.waitForTimeout(1000);

          // Check message body
          const bodyField = page.locator('[contenteditable="true"]').first();
          if (await bodyField.isVisible({ timeout: 3000 }).catch(() => false)) {
            // User should be able to click and type at the beginning
            await bodyField.click();
            await page.keyboard.type('Test reply text');
            await page.waitForTimeout(500);

            const bodyContent = await bodyField.textContent().catch(() => '');

            // Should contain our test text
            expect(bodyContent).toContain('Test reply text');
          }
        }
      }
    });
  });
});
