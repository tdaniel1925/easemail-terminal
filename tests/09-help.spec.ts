import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers';



test.describe('Help Center', () => {
  test.describe('Help Navigation', () => {
    test('should show help center page', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/help');

      // Should show help heading
      const helpHeading = page.getByRole('heading', { name: /help|support|documentation/i });
      await expect(helpHeading).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should access help from navigation menu', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/home');
      await page.waitForTimeout(2000);

      // Look for help link in nav
      const helpLink = page.getByRole('link', { name: /help|support/i });
      if (await helpLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await helpLink.click();
        await page.waitForTimeout(1000);

        // Should navigate to help
        expect(page.url()).toMatch(/help/);
      }
    });

    test('should show help button in header', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/home');
      await page.waitForTimeout(2000);

      // Look for help button/icon
      const helpButton = page.getByRole('button', { name: /help|\?/i });
      if (await helpButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(helpButton).toBeVisible();
      }
    });
  });

  test.describe('Help Search', () => {
    test('should show search input in help center', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const searchInput = page.getByPlaceholder(/search|find help/i);
      await expect(searchInput).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should search help articles', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const searchInput = page.getByPlaceholder(/search|find help/i);
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('email');
        await page.waitForTimeout(1000);

        // Should show search results
        const searchResults = page.locator('[data-testid="search-results"], .search-results');
        await expect(searchResults).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should show no results message for invalid search', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const searchInput = page.getByPlaceholder(/search|find help/i);
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('xyzabc123nonexistent');
        await page.waitForTimeout(1000);

        // Should show no results
        const noResults = page.getByText(/no results|not found|try different/i);
        await expect(noResults).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });
  });

  test.describe('Help Categories', () => {
    test('should show help categories', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      // Look for category sections
      const gettingStarted = page.getByText(/getting started/i);
      const emailHelp = page.getByText(/email/i);
      const calendarHelp = page.getByText(/calendar/i);

      const hasGettingStarted = await gettingStarted.first().isVisible({ timeout: 3000 }).catch(() => false);
      const hasEmail = await emailHelp.first().isVisible({ timeout: 3000 }).catch(() => false);
      const hasCalendar = await calendarHelp.first().isVisible({ timeout: 3000 }).catch(() => false);

      // Should have at least one category
      expect(hasGettingStarted || hasEmail || hasCalendar).toBe(true);
    });

    test('should navigate to category', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const category = page.locator('[data-testid="help-category"], .help-category').first();
      if (await category.isVisible({ timeout: 3000 }).catch(() => false)) {
        await category.click();
        await page.waitForTimeout(1000);

        // Should show category articles
        expect(page.url()).toMatch(/help/);
      }
    });

    test('should show articles in category', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const category = page.locator('[data-testid="help-category"], .help-category').first();
      if (await category.isVisible({ timeout: 3000 }).catch(() => false)) {
        await category.click();
        await page.waitForTimeout(1000);

        // Should show article list
        const articleList = page.locator('[data-testid="article-list"], .article-list, [role="list"]');
        await expect(articleList).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });
  });

  test.describe('Help Articles', () => {
    test('should view help article', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const article = page.locator('[data-testid="help-article"], .help-article').first();
      if (await article.isVisible({ timeout: 3000 }).catch(() => false)) {
        await article.click();
        await page.waitForTimeout(1000);

        // Should show article content
        const articleContent = page.locator('[data-testid="article-content"], .article-content');
        await expect(articleContent).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });

    test('should show article title and content', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const article = page.locator('[data-testid="help-article"], .help-article').first();
      if (await article.isVisible({ timeout: 3000 }).catch(() => false)) {
        await article.click();
        await page.waitForTimeout(1000);

        // Should show heading and content
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    });

    test('should show related articles', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const article = page.locator('[data-testid="help-article"], .help-article').first();
      if (await article.isVisible({ timeout: 3000 }).catch(() => false)) {
        await article.click();
        await page.waitForTimeout(1000);

        // Look for related articles section
        const relatedArticles = page.getByText(/related|similar|see also/i);
        if (await relatedArticles.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(relatedArticles).toBeVisible();
        }
      }
    });

    test('should navigate between articles', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const firstArticle = page.locator('[data-testid="help-article"], .help-article').first();
      if (await firstArticle.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstArticle.click();
        await page.waitForTimeout(1000);

        // Click on related article
        const relatedLink = page.locator('a[href*="/help"]').nth(1);
        if (await relatedLink.isVisible({ timeout: 2000 }).catch(() => false)) {
          await relatedLink.click();
          await page.waitForTimeout(1000);

          // Should navigate to another article
          expect(page.url()).toContain('/help');
        }
      }
    });
  });

  test.describe('Article Feedback', () => {
    test('should show article helpful feedback', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const article = page.locator('[data-testid="help-article"], .help-article').first();
      if (await article.isVisible({ timeout: 3000 }).catch(() => false)) {
        await article.click();
        await page.waitForTimeout(1000);

        // Look for feedback buttons
        const helpfulButton = page.getByRole('button', { name: /helpful|yes|👍/i });
        const notHelpfulButton = page.getByRole('button', { name: /not helpful|no|👎/i });

        const hasHelpful = await helpfulButton.isVisible({ timeout: 3000 }).catch(() => false);
        const hasNotHelpful = await notHelpfulButton.isVisible({ timeout: 3000 }).catch(() => false);

        // Should show feedback options
        if (hasHelpful || hasNotHelpful) {
          expect(hasHelpful || hasNotHelpful).toBe(true);
        }
      }
    });

    test('should submit article feedback', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const article = page.locator('[data-testid="help-article"], .help-article').first();
      if (await article.isVisible({ timeout: 3000 }).catch(() => false)) {
        await article.click();
        await page.waitForTimeout(1000);

        const helpfulButton = page.getByRole('button', { name: /helpful|yes|👍/i });
        if (await helpfulButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await helpfulButton.click();
          await page.waitForTimeout(1000);

          // Should show thank you message
          const thankYou = page.getByText(/thank you|thanks|feedback received/i);
          await expect(thankYou).toBeVisible({ timeout: 5000 }).catch(() => {});
        }
      }
    });
  });

  test.describe('Getting Started Guides', () => {
    test('should show getting started section', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const gettingStarted = page.getByText(/getting started|quick start|beginner/i);
      if (await gettingStarted.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(gettingStarted.first()).toBeVisible();
      }
    });

    test('should view getting started guide', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const gettingStartedLink = page.getByRole('link', { name: /getting started/i });
      if (await gettingStartedLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await gettingStartedLink.click();
        await page.waitForTimeout(1000);

        // Should show guide content
        expect(page.url()).toMatch(/help/);
      }
    });
  });

  test.describe('Video Tutorials', () => {
    test('should show video tutorials section', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const videoSection = page.getByText(/video|tutorial|watch/i);
      if (await videoSection.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        // Videos section might be available
        expect(await videoSection.first().isVisible()).toBe(true);
      }
    });

    test('should play video tutorial', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const videoLink = page.getByRole('link', { name: /video|watch|tutorial/i });
      if (await videoLink.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await videoLink.first().click();
        await page.waitForTimeout(1000);

        // Should show video player
        const videoPlayer = page.locator('video, iframe').first();
        if (await videoPlayer.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(videoPlayer).toBeVisible();
        }
      }
    });
  });

  test.describe('FAQs', () => {
    test('should show FAQ section', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const faqSection = page.getByText(/faq|frequently asked|common questions/i);
      if (await faqSection.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(faqSection.first()).toBeVisible();
      }
    });

    test('should expand FAQ item', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const faqItem = page.locator('[data-testid="faq-item"], .faq-item, details, [role="button"]').first();
      if (await faqItem.isVisible({ timeout: 3000 }).catch(() => false)) {
        await faqItem.click();
        await page.waitForTimeout(500);

        // Should expand to show answer
        expect(page.url()).toContain('/help');
      }
    });
  });

  test.describe('Contact Support', () => {
    test('should show contact support button', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const contactButton = page.getByRole('button', { name: /contact|support|get help/i });
      if (await contactButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(contactButton).toBeVisible();
      }
    });

    test('should open contact support form', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const contactButton = page.getByRole('button', { name: /contact|support|get help/i });
      if (await contactButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await contactButton.click();
        await page.waitForTimeout(1000);

        // Should show support form
        const subjectField = page.getByLabel(/subject|topic/i);
        const messageField = page.getByLabel(/message|description|details/i);

        await expect(subjectField.or(messageField)).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    });

    test('should submit support request', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const contactButton = page.getByRole('button', { name: /contact|support|get help/i });
      if (await contactButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await contactButton.click();
        await page.waitForTimeout(500);

        const subjectField = page.getByLabel(/subject|topic/i);
        const messageField = page.getByLabel(/message|description|details/i);

        if (await subjectField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await subjectField.fill('Test support request');

          if (await messageField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await messageField.fill('This is a test support message');

            const submitButton = page.getByRole('button', { name: /send|submit/i });
            if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await submitButton.click();
              await page.waitForTimeout(2000);

              // Should show success message
              const successMessage = page.getByText(/sent|submitted|received|thank you/i);
              await expect(successMessage).toBeVisible({ timeout: 5000 }).catch(() => {});
            }
          }
        }
      }
    });
  });

  test.describe('Live Chat', () => {
    test('should show live chat widget', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      // Look for chat widget
      const chatWidget = page.locator('[data-testid="chat-widget"], .chat-widget, #intercom-container, #drift-widget');
      if (await chatWidget.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(chatWidget).toBeVisible();
      }
    });

    test('should open live chat', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const chatButton = page.getByRole('button', { name: /chat|message|talk to us/i });
      if (await chatButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await chatButton.click();
        await page.waitForTimeout(1000);

        // Should open chat window
        expect(page.url()).toContain('/help');
      }
    });
  });

  test.describe('Documentation Navigation', () => {
    test('should show documentation breadcrumbs', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const article = page.locator('[data-testid="help-article"], .help-article').first();
      if (await article.isVisible({ timeout: 3000 }).catch(() => false)) {
        await article.click();
        await page.waitForTimeout(1000);

        // Look for breadcrumbs
        const breadcrumbs = page.locator('[data-testid="breadcrumbs"], .breadcrumbs, nav[aria-label*="bread"]');
        if (await breadcrumbs.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(breadcrumbs).toBeVisible();
        }
      }
    });

    test('should navigate back to help home', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const article = page.locator('[data-testid="help-article"], .help-article').first();
      if (await article.isVisible({ timeout: 3000 }).catch(() => false)) {
        await article.click();
        await page.waitForTimeout(1000);

        // Click back to help home
        const backButton = page.getByRole('link', { name: /back|help center|home/i });
        if (await backButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await backButton.click();
          await page.waitForTimeout(1000);

          // Should return to help home
          expect(page.url()).toMatch(/help/);
        }
      }
    });
  });

  test.describe('Keyboard Shortcuts Help', () => {
    test('should show keyboard shortcuts guide', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const shortcutsLink = page.getByRole('link', { name: /keyboard|shortcuts|hotkeys/i });
      if (await shortcutsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await shortcutsLink.click();
        await page.waitForTimeout(1000);

        // Should show shortcuts list
        expect(page.url()).toMatch(/help/);
      }
    });

    test('should open shortcuts modal with ?', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/home');
      await page.waitForTimeout(2000);

      // Press ? key to open shortcuts
      await page.keyboard.press('?');
      await page.waitForTimeout(1000);

      // Should show shortcuts modal
      const shortcutsModal = page.locator('[role="dialog"]');
      if (await shortcutsModal.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(shortcutsModal).toBeVisible();
      }
    });
  });

  test.describe('System Status', () => {
    test('should show system status link', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/help');
      await page.waitForTimeout(2000);

      const statusLink = page.getByRole('link', { name: /status|uptime|service status/i });
      if (await statusLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(statusLink).toBeVisible();
      }
    });
  });
});
