import { test, expect } from '@playwright/test';

test.describe('Debug Login', () => {
  test('manual login test', async ({ page }) => {
    console.log('Going to login page...');
    await page.goto('/login');

    console.log('Filling email...');
    await page.fill('input[type="email"]', 'superadmin@test.com');

    console.log('Filling password...');
    await page.fill('input[type="password"]', 'SuperAdmin123!');

    console.log('Clicking submit...');
    await page.click('button[type="submit"]');

    // Wait a bit
    await page.waitForTimeout(5000);

    console.log('Current URL:', page.url());

    // Take screenshot
    await page.screenshot({ path: 'debug-login.png' });
  });
});
