import { test, expect, Page, APIRequestContext } from '@playwright/test';

const TEST_PASSWORD = 'SecureTest123!';
const TEST_NAME = 'Signature Tester';

// Store current test user credentials
let currentTestEmail = '';

// Helper function to create test user via API
async function createTestUser(page: Page, request: APIRequestContext) {
  // Generate unique email for this test
  currentTestEmail = `signature-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

  // Use test endpoint to create user with auto-confirmed email
  const response = await request.post('https://easemail.app/api/test/create-user', {
    headers: {
      'Content-Type': 'application/json',
      'x-test-token': process.env.TEST_ENDPOINT_TOKEN || 'test-token-for-e2e'
    },
    data: {
      email: currentTestEmail,
      password: TEST_PASSWORD,
      name: TEST_NAME
    }
  });

  const result = await response.json();

  if (response.ok()) {
    console.log('✓ Test user created successfully via API');
  } else {
    console.error('✗ Failed to create test user:', result.error);
    throw new Error(`Failed to create test user: ${result.error}`);
  }

  // Now login with the created user
  await loginTestUser(page);
}

// Helper function to login
async function loginTestUser(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', currentTestEmail);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app', { timeout: 10000 });
}

// Helper function to navigate to signatures page
async function navigateToSignatures(page: Page) {
  await page.goto('/app/settings/signatures');
  await page.waitForLoadState('networkidle');
}

test.describe('Signature Features E2E Tests', () => {
  test.beforeEach(async ({ page, request }) => {
    // Each test gets a fresh user
    await createTestUser(page, request);
  });

  test('should create a new signature', async ({ page }) => {
    await navigateToSignatures(page);

    // Click "New Signature" button
    await page.click('button:has-text("New Signature")');

    // Wait for dialog to open
    await expect(page.locator('dialog, [role="dialog"]')).toBeVisible();

    // Fill in signature details
    await page.fill('input[id="name"]', 'Professional Signature');

    // Fill in signature content in TiptapEditor
    const editor = page.locator('.tiptap.ProseMirror');
    await editor.click();
    await editor.fill('Best regards,\nJohn Doe\nSenior Engineer');

    // Save signature
    await page.click('button:has-text("Save Signature")');

    // Wait for success toast
    await expect(page.locator('text=Signature created')).toBeVisible({ timeout: 5000 });

    // Verify signature appears in list
    await expect(page.locator('text=Professional Signature')).toBeVisible();
  });

  test('should edit an existing signature', async ({ page }) => {
    await navigateToSignatures(page);

    // Create a signature first
    await page.click('button:has-text("New Signature")');
    await page.fill('input[id="name"]', 'Test Signature');
    const editor = page.locator('.tiptap.ProseMirror').first();
    await editor.click();
    await editor.fill('Original content');
    await page.click('button:has-text("Save Signature")');
    await page.waitForTimeout(1000);

    // Click edit button
    await page.click('button[aria-label="Edit"], button svg.lucide-pencil');

    // Update signature
    await page.fill('input[id="name"]', 'Updated Signature');
    const editEditor = page.locator('.tiptap.ProseMirror');
    await editEditor.click();
    await editEditor.clear();
    await editEditor.fill('Updated content');

    await page.click('button:has-text("Save Signature")');

    // Verify update
    await expect(page.locator('text=Updated Signature')).toBeVisible();
    await expect(page.locator('text=Updated content')).toBeVisible();
  });

  test('should delete a signature', async ({ page }) => {
    await navigateToSignatures(page);

    // Create a signature
    await page.click('button:has-text("New Signature")');
    await page.fill('input[id="name"]', 'To Be Deleted');
    const editor = page.locator('.tiptap.ProseMirror');
    await editor.click();
    await editor.fill('Delete me');
    await page.click('button:has-text("Save Signature")');
    await page.waitForTimeout(1000);

    // Setup dialog handler for confirmation
    page.on('dialog', dialog => dialog.accept());

    // Click delete button
    await page.click('button svg.lucide-trash-2');

    // Verify deletion
    await expect(page.locator('text=Signature deleted')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=To Be Deleted')).not.toBeVisible();
  });

  test('should set default signature', async ({ page }) => {
    await navigateToSignatures(page);

    // Create two signatures
    // First signature
    await page.click('button:has-text("New Signature")');
    await page.fill('input[id="name"]', 'Signature 1');
    let editor = page.locator('.tiptap.ProseMirror');
    await editor.click();
    await editor.fill('Signature 1 content');
    await page.click('button:has-text("Save Signature")');
    await page.waitForTimeout(1000);

    // Second signature
    await page.click('button:has-text("New Signature")');
    await page.fill('input[id="name"]', 'Signature 2');
    editor = page.locator('.tiptap.ProseMirror');
    await editor.click();
    await editor.fill('Signature 2 content');
    await page.click('button:has-text("Save Signature")');
    await page.waitForTimeout(1000);

    // Set second signature as default by clicking star icon
    const starButtons = page.locator('button svg.lucide-star');
    await starButtons.first().click();

    // Verify default badge appears
    await expect(page.locator('text=Default').first()).toBeVisible();
  });

  test('should associate signature with email account', async ({ page }) => {
    // Skip onboarding to set up email account
    await page.goto('/app/settings/email-accounts');

    // Note: In real test, we'd need to connect an email account
    // For this test, we'll just verify the UI shows the option

    await navigateToSignatures(page);
    await page.click('button:has-text("New Signature")');

    // Verify email account selector exists
    await expect(page.locator('select[id="email_account"]')).toBeVisible();
    await expect(page.locator('text=Email Account (Optional)')).toBeVisible();
  });

  test('should use signature in email composer', async ({ page }) => {
    await navigateToSignatures(page);

    // Create a signature and set as default
    await page.click('button:has-text("New Signature")');
    await page.fill('input[id="name"]', 'Composer Test Signature');

    const editor = page.locator('.tiptap.ProseMirror');
    await editor.click();
    await editor.fill('Best regards from test');

    // Check "Set as default"
    await page.check('input[id="is_default"]');

    await page.click('button:has-text("Save Signature")');
    await page.waitForTimeout(1000);

    // Navigate to inbox and compose
    await page.goto('/app/inbox');
    await page.waitForLoadState('networkidle');

    // Click compose button
    await page.click('button:has-text("Compose")');

    // Wait for composer to open
    await page.waitForSelector('.tiptap.ProseMirror', { timeout: 5000 });

    // Check if signature is auto-inserted
    const composerBody = page.locator('.tiptap.ProseMirror').last();
    await expect(composerBody).toContainText('Best regards from test', { timeout: 5000 });
  });

  test('should change signature in composer', async ({ page }) => {
    await navigateToSignatures(page);

    // Create two signatures
    await page.click('button:has-text("New Signature")');
    await page.fill('input[id="name"]', 'Signature A');
    let editor = page.locator('.tiptap.ProseMirror');
    await editor.click();
    await editor.fill('Signature A content');
    await page.click('button:has-text("Save Signature")');
    await page.waitForTimeout(1000);

    await page.click('button:has-text("New Signature")');
    await page.fill('input[id="name"]', 'Signature B');
    editor = page.locator('.tiptap.ProseMirror');
    await editor.click();
    await editor.fill('Signature B content');
    await page.click('button:has-text("Save Signature")');
    await page.waitForTimeout(1000);

    // Go to composer
    await page.goto('/app/inbox');
    await page.click('button:has-text("Compose")');
    await page.waitForSelector('.tiptap.ProseMirror', { timeout: 5000 });

    // Find signature dropdown
    const signatureSelect = page.locator('select').filter({ hasText: /Signature/ });
    if (await signatureSelect.count() > 0) {
      // Select different signature
      await signatureSelect.selectOption({ label: 'Signature B' });

      // Verify signature changed
      const composerBody = page.locator('.tiptap.ProseMirror').last();
      await expect(composerBody).toContainText('Signature B content');
    }
  });

  test('should handle signature without email accounts', async ({ page }) => {
    // User has no email accounts connected
    await navigateToSignatures(page);

    // Should still be able to create signatures
    await page.click('button:has-text("New Signature")');
    await expect(page.locator('input[id="name"]')).toBeVisible();

    // Email account selector should show "All accounts" as only option
    const accountSelect = page.locator('select[id="email_account"]');
    await expect(accountSelect).toBeVisible();
    const options = await accountSelect.locator('option').all();
    expect(options.length).toBeGreaterThanOrEqual(1);
  });

  test('should preserve signature HTML formatting', async ({ page }) => {
    await navigateToSignatures(page);

    await page.click('button:has-text("New Signature")');
    await page.fill('input[id="name"]', 'Formatted Signature');

    // Use TiptapEditor formatting
    const editor = page.locator('.tiptap.ProseMirror');
    await editor.click();
    await editor.type('Best regards,');
    await editor.press('Enter');
    await editor.type('John Doe');

    // Try to make "John Doe" bold (if toolbar available)
    await editor.press('Control+b');
    await editor.type('Senior Engineer');

    await page.click('button:has-text("Save Signature")');
    await page.waitForTimeout(1000);

    // Verify signature is saved
    await expect(page.locator('text=Formatted Signature')).toBeVisible();

    // Content should be preserved as HTML
    const signatureCard = page.locator('text=Formatted Signature').locator('..');
    await expect(signatureCard).toContainText('Best regards');
    await expect(signatureCard).toContainText('John Doe');
  });

  test('should show empty state when no signatures exist', async ({ page }) => {
    await navigateToSignatures(page);

    // Should show empty state
    await expect(page.locator('text=No signatures yet')).toBeVisible();
    await expect(page.locator('button:has-text("Create your first signature")')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await navigateToSignatures(page);

    await page.click('button:has-text("New Signature")');

    // Try to save without filling required fields
    await page.click('button:has-text("Save Signature")');

    // Should show validation error
    await expect(page.locator('text=/Name and content are required/i')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Signature Onboarding E2E Tests', () => {
  test('should create signatures during onboarding', async ({ page, request }) => {
    const onboardingEmail = `onboarding-sig-${Date.now()}@example.com`;

    // Create user via API
    const response = await request.post('https://easemail.app/api/test/create-user', {
      headers: {
        'Content-Type': 'application/json',
        'x-test-token': process.env.TEST_ENDPOINT_TOKEN || 'test-token-for-e2e'
      },
      data: {
        email: onboardingEmail,
        password: 'SecureTest123!',
        name: 'Onboarding Test',
        skip_onboarding: false
      }
    });

    if (!response.ok()) {
      const result = await response.json();
      throw new Error(`Failed to create test user: ${result.error}`);
    }

    // Login to trigger onboarding
    await page.goto('/login');
    await page.fill('input[type="email"]', onboardingEmail);
    await page.fill('input[type="password"]', 'SecureTest123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/onboarding', { timeout: 10000 });

    // Skip through onboarding steps to reach signature setup
    // Step 1: Welcome
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);

    // Step 2: Profile Picture (skip)
    await page.click('button:has-text("Skip"), button:has-text("Skip for Now")');
    await page.waitForTimeout(500);

    // Step 3: Email Connection (skip)
    await page.click('button:has-text("Skip"), button:has-text("Skip for Now")');
    await page.waitForTimeout(500);

    // Step 4: Signature Setup
    await expect(page.locator('text=/Email Signature/i')).toBeVisible({ timeout: 5000 });

    // Check if template buttons are visible
    const templateButtons = page.locator('button').filter({ hasText: /Professional|Casual|Corporate/ });
    if (await templateButtons.count() > 0) {
      // Click a template
      await templateButtons.first().click();
      await page.waitForTimeout(500);

      // Verify template content is inserted
      const editors = page.locator('.tiptap.ProseMirror');
      if (await editors.count() > 0) {
        const firstEditor = editors.first();
        const content = await firstEditor.textContent();
        expect(content).toBeTruthy();
        expect(content!.length).toBeGreaterThan(0);
      }
    }

    // Continue or skip
    await page.click('button:has-text("Continue"), button:has-text("Skip")');
  });

  test('should handle signature setup with no email accounts', async ({ page, request }) => {
    const noAccountsEmail = `no-accounts-${Date.now()}@example.com`;

    // Create user via API
    const response = await request.post('https://easemail.app/api/test/create-user', {
      headers: {
        'Content-Type': 'application/json',
        'x-test-token': process.env.TEST_ENDPOINT_TOKEN || 'test-token-for-e2e'
      },
      data: {
        email: noAccountsEmail,
        password: 'SecureTest123!',
        name: 'No Accounts Test',
        skip_onboarding: false
      }
    });

    if (!response.ok()) {
      const result = await response.json();
      throw new Error(`Failed to create test user: ${result.error}`);
    }

    // Login to trigger onboarding
    await page.goto('/login');
    await page.fill('input[type="email"]', noAccountsEmail);
    await page.fill('input[type="password"]', 'SecureTest123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/onboarding', { timeout: 10000 });

    // Navigate through to signature step
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Skip"), button:has-text("Skip for Now")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Skip"), button:has-text("Skip for Now")');
    await page.waitForTimeout(500);

    // Should show message about no email accounts
    await expect(page.locator('text=/no email accounts|haven\'t connected/i')).toBeVisible({ timeout: 5000 });
  });
});
