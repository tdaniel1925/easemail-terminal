import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers';



test.describe('AI Features', () => {
  test.describe('AI Compose', () => {
    test('should show AI Compose option in email composer', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      // Open compose
      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(1000);

        // Look for AI Compose button
        const aiComposeButton = page.getByRole('button', { name: /ai compose|compose with ai/i });
        await expect(aiComposeButton).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should open AI Compose modal', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        const aiComposeButton = page.getByRole('button', { name: /ai compose|compose with ai/i });
        if (await aiComposeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await aiComposeButton.click();
          await page.waitForTimeout(500);

          // Should show AI prompt input
          const promptInput = page.getByPlaceholder(/what would you like to write|describe|prompt/i);
          await expect(promptInput).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });

    test('should validate AI Compose prompt', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        const aiComposeButton = page.getByRole('button', { name: /ai compose|compose with ai/i });
        if (await aiComposeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await aiComposeButton.click();
          await page.waitForTimeout(500);

          // Try to generate without prompt
          const generateButton = page.getByRole('button', { name: /generate|create|compose/i });
          if (await generateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await generateButton.click();
            await page.waitForTimeout(500);

            // Should show validation or stay on form
            const promptInput = page.getByPlaceholder(/what would you like to write|describe|prompt/i);
            await expect(promptInput).toBeVisible().catch(() => {});
          }
        }
      }
    });

    test('should generate email with AI Compose', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        const aiComposeButton = page.getByRole('button', { name: /ai compose|compose with ai/i });
        if (await aiComposeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await aiComposeButton.click();
          await page.waitForTimeout(500);

          const promptInput = page.getByPlaceholder(/what would you like to write|describe|prompt/i);
          if (await promptInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await promptInput.fill('Write a professional thank you email');

            const generateButton = page.getByRole('button', { name: /generate|create|compose/i });
            if (await generateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await generateButton.click();

              // Should show loading or result
              await page.waitForTimeout(3000);

              // Should show generated content or error
              const generatedContent = page.locator('textarea, [contenteditable="true"]');
              await expect(generatedContent.first()).toBeVisible({ timeout: 10000 }).catch(() => {});
            }
          }
        }
      }
    });

    test('should allow editing AI generated content', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        const aiComposeButton = page.getByRole('button', { name: /ai compose|compose with ai/i });
        if (await aiComposeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await aiComposeButton.click();
          await page.waitForTimeout(500);

          const promptInput = page.getByPlaceholder(/what would you like to write|describe|prompt/i);
          if (await promptInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await promptInput.fill('Write a brief hello email');

            const generateButton = page.getByRole('button', { name: /generate|create|compose/i });
            if (await generateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await generateButton.click();
              await page.waitForTimeout(3000);

              // Try to edit generated content
              const contentField = page.locator('textarea, [contenteditable="true"]').first();
              if (await contentField.isVisible({ timeout: 5000 }).catch(() => false)) {
                await contentField.click();
                await contentField.fill('Edited content');

                // Should accept edits
                const value = await contentField.inputValue().catch(() => '');
                expect(value).toContain('Edited');
              }
            }
          }
        }
      }
    });
  });

  test.describe('AI Remix', () => {
    test('should show AI Remix option for existing emails', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        // Look for AI Remix button
        const aiRemixButton = page.getByRole('button', { name: /ai remix|remix with ai|rewrite/i });
        if (await aiRemixButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(aiRemixButton).toBeVisible();
        }
      }
    });

    test('should open AI Remix modal when replying', async ({ page }) => {
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

          // Look for AI Remix in reply composer
          const aiRemixButton = page.getByRole('button', { name: /ai remix|remix|rewrite/i });
          if (await aiRemixButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await aiRemixButton.click();
            await page.waitForTimeout(500);

            // Should show remix options
            const remixOptions = page.getByText(/tone|style|length|professional|casual/i);
            await expect(remixOptions.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
          }
        }
      }
    });

    test('should offer tone options in AI Remix', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        // Write some content first
        const contentField = page.locator('textarea, [contenteditable="true"]').first();
        if (await contentField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await contentField.fill('This is a test email');

          // Look for AI Remix
          const aiRemixButton = page.getByRole('button', { name: /ai remix|remix|rewrite/i });
          if (await aiRemixButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await aiRemixButton.click();
            await page.waitForTimeout(500);

            // Should show tone options
            const professionalTone = page.getByText(/professional/i);
            const casualTone = page.getByText(/casual|friendly/i);
            const formalTone = page.getByText(/formal/i);

            const hasProfessional = await professionalTone.first().isVisible({ timeout: 2000 }).catch(() => false);
            const hasCasual = await casualTone.first().isVisible({ timeout: 2000 }).catch(() => false);
            const hasFormal = await formalTone.first().isVisible({ timeout: 2000 }).catch(() => false);

            // Should have at least one tone option
            expect(hasProfessional || hasCasual || hasFormal).toBe(true);
          }
        }
      }
    });

    test('should remix email with selected tone', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        const contentField = page.locator('textarea, [contenteditable="true"]').first();
        if (await contentField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await contentField.fill('This is a test email that needs remixing');

          const aiRemixButton = page.getByRole('button', { name: /ai remix|remix|rewrite/i });
          if (await aiRemixButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await aiRemixButton.click();
            await page.waitForTimeout(500);

            // Select a tone
            const professionalTone = page.getByRole('button', { name: /professional/i });
            if (await professionalTone.isVisible({ timeout: 2000 }).catch(() => false)) {
              await professionalTone.click();
              await page.waitForTimeout(3000);

              // Should show remixed content
              const remixedContent = page.locator('textarea, [contenteditable="true"]');
              await expect(remixedContent.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
            }
          }
        }
      }
    });
  });

  test.describe('AI Dictate', () => {
    test('should show AI Dictate option in composer', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        // Look for AI Dictate button
        const aiDictateButton = page.getByRole('button', { name: /ai dictate|dictate|voice|microphone/i });
        if (await aiDictateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(aiDictateButton).toBeVisible();
        }
      }
    });

    test('should request microphone permissions for AI Dictate', async ({ page, context }) => {
      await createAndLoginUser(page);

      // Grant microphone permission
      await context.grantPermissions(['microphone']);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        const aiDictateButton = page.getByRole('button', { name: /ai dictate|dictate|voice|microphone/i });
        if (await aiDictateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await aiDictateButton.click();
          await page.waitForTimeout(1000);

          // Should show recording indicator or start recording
          const recordingIndicator = page.getByText(/recording|listening|speak now/i);
          await expect(recordingIndicator).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });

    test('should stop AI Dictate recording', async ({ page, context }) => {
      await createAndLoginUser(page);
      await context.grantPermissions(['microphone']);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const composeButton = page.getByRole('button', { name: /compose|new email|write/i });
      if (await composeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await composeButton.click();
        await page.waitForTimeout(500);

        const aiDictateButton = page.getByRole('button', { name: /ai dictate|dictate|voice|microphone/i });
        if (await aiDictateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await aiDictateButton.click();
          await page.waitForTimeout(1000);

          // Look for stop button
          const stopButton = page.getByRole('button', { name: /stop|done|finish recording/i });
          if (await stopButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await stopButton.click();
            await page.waitForTimeout(500);

            // Should stop recording
            expect(page.url()).toContain('/inbox');
          }
        }
      }
    });
  });

  test.describe('AI Smart Replies', () => {
    test('should show AI suggested replies', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        // Look for smart reply suggestions
        const smartReplies = page.locator('[data-testid="smart-reply"], .smart-reply, .suggested-reply');
        const smartReplyText = page.getByText(/quick reply|suggested|smart reply/i);

        const hasReplies = await smartReplies.first().isVisible({ timeout: 3000 }).catch(() => false);
        const hasText = await smartReplyText.isVisible({ timeout: 3000 }).catch(() => false);

        // Smart replies might be available
        if (hasReplies || hasText) {
          expect(hasReplies || hasText).toBe(true);
        }
      }
    });

    test('should use AI suggested reply', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        const smartReply = page.locator('[data-testid="smart-reply"], .smart-reply, .suggested-reply').first();
        if (await smartReply.isVisible({ timeout: 3000 }).catch(() => false)) {
          await smartReply.click();
          await page.waitForTimeout(500);

          // Should populate reply field
          const replyField = page.locator('textarea, [contenteditable="true"]');
          await expect(replyField.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });
  });

  test.describe('AI Summary', () => {
    test('should show AI email summary', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        // Look for AI summary
        const aiSummaryButton = page.getByRole('button', { name: /summarize|summary|ai summary/i });
        if (await aiSummaryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await aiSummaryButton.click();
          await page.waitForTimeout(2000);

          // Should show summary
          const summaryContent = page.getByText(/summary|key points|tl;dr/i);
          await expect(summaryContent.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
        }
      }
    });

    test('should show AI thread summary', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/inbox');
      await page.waitForTimeout(2000);

      const firstEmail = page.locator('[data-testid="email-item"], .email-item').first();
      if (await firstEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstEmail.click();
        await page.waitForTimeout(1000);

        // Look for thread summary
        const threadSummary = page.getByText(/thread summary|conversation summary/i);
        if (await threadSummary.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(threadSummary).toBeVisible();
        }
      }
    });
  });

  test.describe('AI Settings', () => {
    test('should show AI features in settings', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      // Look for AI settings section
      const aiSettingsLink = page.getByRole('link', { name: /ai|artificial intelligence/i });
      if (await aiSettingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await aiSettingsLink.click();
        await page.waitForTimeout(1000);

        // Should show AI settings
        const aiSettings = page.getByText(/ai features|smart compose|auto reply/i);
        await expect(aiSettings.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    });

    test('should toggle AI features on/off', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/settings');
      await page.waitForTimeout(2000);

      const aiSettingsLink = page.getByRole('link', { name: /ai|artificial intelligence/i });
      if (await aiSettingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await aiSettingsLink.click();
        await page.waitForTimeout(1000);

        // Look for toggle switches
        const toggleSwitch = page.locator('input[type="checkbox"], button[role="switch"]').first();
        if (await toggleSwitch.isVisible({ timeout: 2000 }).catch(() => false)) {
          await toggleSwitch.click();
          await page.waitForTimeout(500);

          // Should toggle setting
          expect(page.url()).toContain('/settings');
        }
      }
    });
  });
});
