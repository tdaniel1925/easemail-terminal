import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Helper to get Supabase client
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

test.describe('Admin Notifications and Impersonation Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test.describe('Admin Notifications', () => {
    test('should display notification bell in admin header', async ({ page }) => {
      // Log in as super admin
      const supabase = getSupabaseClient();

      // Get or create super admin user
      const { data: superAdmin } = await supabase
        .from('users')
        .select('*')
        .eq('is_super_admin', true)
        .limit(1)
        .single();

      if (!superAdmin) {
        test.skip('No super admin user found');
        return;
      }

      // Login
      await page.fill('input[type="email"]', superAdmin.email);
      await page.fill('input[type="password"]', 'SuperAdmin123!');
      await page.click('button[type="submit"]');

      // Wait for navigation to dashboard
      await page.waitForURL('**/app/**');

      // Navigate to admin section
      await page.goto('/app/admin/analytics');

      // Wait for admin layout to load
      await page.waitForSelector('text=Super Admin', { timeout: 10000 });

      // Check for notification bell
      const notificationBell = page.locator('button:has(svg)').filter({ has: page.locator('svg') });
      await expect(notificationBell.first()).toBeVisible({ timeout: 5000 });
    });

    test('should show unread count badge when notifications exist', async ({ page }) => {
      const supabase = getSupabaseClient();

      // Create a test notification
      const { data: superAdmin } = await supabase
        .from('users')
        .select('id, email')
        .eq('is_super_admin', true)
        .limit(1)
        .single();

      if (!superAdmin) {
        test.skip('No super admin user found');
        return;
      }

      // Create a test notification
      await supabase.from('admin_notifications').insert({
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification',
        read: false,
      });

      // Login as super admin
      await page.fill('input[type="email"]', superAdmin.email);
      await page.fill('input[type="password"]', 'SuperAdmin123!');
      await page.click('button[type="submit"]');

      await page.waitForURL('**/app/**');
      await page.goto('/app/admin/analytics');

      // Check for badge with number
      const badge = page.locator('[class*="badge"]').filter({ hasText: /\d+/ });
      await expect(badge.first()).toBeVisible({ timeout: 10000 });

      // Clean up test notification
      await supabase
        .from('admin_notifications')
        .delete()
        .eq('type', 'test');
    });

    test('should open notification dropdown when bell clicked', async ({ page }) => {
      const supabase = getSupabaseClient();

      const { data: superAdmin } = await supabase
        .from('users')
        .select('id, email')
        .eq('is_super_admin', true)
        .limit(1)
        .single();

      if (!superAdmin) {
        test.skip('No super admin user found');
        return;
      }

      // Login
      await page.fill('input[type="email"]', superAdmin.email);
      await page.fill('input[type="password"]', 'SuperAdmin123!');
      await page.click('button[type="submit"]');

      await page.waitForURL('**/app/**');
      await page.goto('/app/admin/analytics');

      // Wait for notification bell
      await page.waitForSelector('text=Super Admin');

      // Click the notification bell - find button with Bell icon
      const bellButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      await bellButton.click();

      // Check for dropdown with "Notifications" header
      await expect(page.locator('text=Notifications')).toBeVisible({ timeout: 5000 });
    });

    test('should create notification when org admin logs in for first time', async ({ page }) => {
      const supabase = getSupabaseClient();

      // Create a test org admin user
      const testEmail = `orgadmin-${Date.now()}@test.com`;

      // Create user in auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'test-password-123',
        email_confirm: true,
      });

      if (authError || !authUser.user) {
        console.error('Failed to create test user:', authError);
        test.skip('Could not create test user');
        return;
      }

      // Create user in users table
      await supabase.from('users').insert({
        id: authUser.user.id,
        email: testEmail,
        name: 'Test Org Admin',
      });

      // Create an organization
      const { data: org } = await supabase
        .from('organizations')
        .insert({
          name: 'Test Organization',
        })
        .select()
        .single();

      if (!org) {
        // Cleanup
        await supabase.auth.admin.deleteUser(authUser.user.id);
        test.skip('Could not create test organization');
        return;
      }

      // Make the user an org admin
      await supabase.from('organization_members').insert({
        organization_id: org.id,
        user_id: authUser.user.id,
        role: 'ADMIN',
      });

      // Log in as the new org admin to trigger first login tracking
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'test-password-123');
      await page.click('button[type="submit"]');

      // Wait for login
      await page.waitForURL('**/app/**', { timeout: 10000 });

      // Wait a moment for login tracking to process
      await page.waitForTimeout(2000);

      // Check if notification was created
      const { data: notifications } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('type', 'org_admin_first_login')
        .eq('user_id', authUser.user.id);

      expect(notifications).toBeTruthy();
      expect(notifications?.length).toBeGreaterThan(0);

      // Cleanup
      await supabase.from('organization_members').delete().eq('user_id', authUser.user.id);
      await supabase.from('organizations').delete().eq('id', org.id);
      await supabase.from('admin_notifications').delete().eq('user_id', authUser.user.id);
      await supabase.from('user_login_tracking').delete().eq('user_id', authUser.user.id);
      await supabase.from('users').delete().eq('id', authUser.user.id);
      await supabase.auth.admin.deleteUser(authUser.user.id);
    });
  });

  test.describe('Impersonation Feature', () => {
    test('should display impersonate button in admin users page', async ({ page }) => {
      const supabase = getSupabaseClient();

      const { data: superAdmin } = await supabase
        .from('users')
        .select('id, email')
        .eq('is_super_admin', true)
        .limit(1)
        .single();

      if (!superAdmin) {
        test.skip('No super admin user found');
        return;
      }

      // Login as super admin
      await page.fill('input[type="email"]', superAdmin.email);
      await page.fill('input[type="password"]', 'SuperAdmin123!');
      await page.click('button[type="submit"]');

      await page.waitForURL('**/app/**');

      // Navigate to admin users page
      await page.goto('/app/admin/users');

      // Wait for users list to load
      await page.waitForSelector('text=Users', { timeout: 10000 });

      // Look for impersonate button (UserCog icon)
      const impersonateButtons = page.locator('button[title="Impersonate user"]');
      const count = await impersonateButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should open impersonate dialog when button clicked', async ({ page }) => {
      const supabase = getSupabaseClient();

      const { data: superAdmin } = await supabase
        .from('users')
        .select('id, email')
        .eq('is_super_admin', true)
        .limit(1)
        .single();

      if (!superAdmin) {
        test.skip('No super admin user found');
        return;
      }

      // Login
      await page.fill('input[type="email"]', superAdmin.email);
      await page.fill('input[type="password"]', 'SuperAdmin123!');
      await page.click('button[type="submit"]');

      await page.waitForURL('**/app/**');
      await page.goto('/app/admin/users');

      // Wait for users list
      await page.waitForSelector('text=Users');

      // Click first impersonate button
      const impersonateButton = page.locator('button[title="Impersonate user"]').first();
      await impersonateButton.click();

      // Check for dialog
      await expect(page.locator('text=Impersonate User')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Warning')).toBeVisible();
      await expect(page.locator('textarea[placeholder*="reason"]')).toBeVisible();
    });

    test('should require reason for impersonation', async ({ page }) => {
      const supabase = getSupabaseClient();

      const { data: superAdmin } = await supabase
        .from('users')
        .select('id, email')
        .eq('is_super_admin', true)
        .limit(1)
        .single();

      if (!superAdmin) {
        test.skip('No super admin user found');
        return;
      }

      // Login
      await page.fill('input[type="email"]', superAdmin.email);
      await page.fill('input[type="password"]', 'SuperAdmin123!');
      await page.click('button[type="submit"]');

      await page.waitForURL('**/app/**');
      await page.goto('/app/admin/users');

      await page.waitForSelector('text=Users');

      // Click impersonate button
      const impersonateButton = page.locator('button[title="Impersonate user"]').first();
      await impersonateButton.click();

      // Try to submit without reason
      const submitButton = page.locator('button:has-text("Impersonate User")').last();

      // Button should be disabled when reason is empty
      await expect(submitButton).toBeDisabled();

      // Fill in reason
      await page.fill('textarea[placeholder*="reason"]', 'Testing impersonation feature');

      // Button should now be enabled
      await expect(submitButton).toBeEnabled();
    });

    test('should create audit log entry when impersonating', async ({ page, context }) => {
      const supabase = getSupabaseClient();

      const { data: superAdmin } = await supabase
        .from('users')
        .select('id, email')
        .eq('is_super_admin', true)
        .limit(1)
        .single();

      if (!superAdmin) {
        test.skip('No super admin user found');
        return;
      }

      // Get a regular user to impersonate
      const { data: targetUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('is_super_admin', false)
        .limit(1)
        .single();

      if (!targetUser) {
        test.skip('No regular user found to impersonate');
        return;
      }

      // Login as super admin
      await page.fill('input[type="email"]', superAdmin.email);
      await page.fill('input[type="password"]', 'SuperAdmin123!');
      await page.click('button[type="submit"]');

      await page.waitForURL('**/app/**');
      await page.goto('/app/admin/users');

      await page.waitForSelector('text=Users');

      // Click impersonate button for target user
      const impersonateButton = page.locator('button[title="Impersonate user"]').first();
      await impersonateButton.click();

      // Fill in reason
      await page.fill('textarea[placeholder*="reason"]', 'Automated test impersonation');

      // Submit
      const submitButton = page.locator('button:has-text("Impersonate User")').last();
      await submitButton.click();

      // Wait for impersonation to complete
      await page.waitForTimeout(3000);

      // Check audit log
      const { data: sessions } = await supabase
        .from('impersonate_sessions')
        .select('*')
        .eq('super_admin_id', superAdmin.id)
        .eq('reason', 'Automated test impersonation')
        .order('started_at', { ascending: false })
        .limit(1);

      expect(sessions).toBeTruthy();
      expect(sessions?.length).toBe(1);
      expect(sessions?.[0].impersonated_user_id).toBeTruthy();
      expect(sessions?.[0].reason).toBe('Automated test impersonation');
      expect(sessions?.[0].ip_address).toBeTruthy();

      // Cleanup audit log
      if (sessions && sessions[0]) {
        await supabase
          .from('impersonate_sessions')
          .delete()
          .eq('id', sessions[0].id);
      }
    });

    test('should track login count in user_login_tracking table', async ({ page }) => {
      const supabase = getSupabaseClient();

      // Create a test user
      const testEmail = `tracktest-${Date.now()}@test.com`;

      const { data: authUser } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'test-password-123',
        email_confirm: true,
      });

      if (!authUser.user) {
        test.skip('Could not create test user');
        return;
      }

      await supabase.from('users').insert({
        id: authUser.user.id,
        email: testEmail,
        name: 'Track Test User',
      });

      // First login
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'test-password-123');
      await page.click('button[type="submit"]');

      await page.waitForURL('**/app/**', { timeout: 10000 });
      await page.waitForTimeout(2000); // Wait for tracking to complete

      // Check login tracking
      const { data: tracking } = await supabase
        .from('user_login_tracking')
        .select('*')
        .eq('user_id', authUser.user.id)
        .single();

      expect(tracking).toBeTruthy();
      expect(tracking?.login_count).toBe(1);
      expect(tracking?.first_login_at).toBeTruthy();

      // Logout and login again
      await page.goto('/logout');
      await page.waitForURL('**/login');

      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'test-password-123');
      await page.click('button[type="submit"]');

      await page.waitForURL('**/app/**');
      await page.waitForTimeout(2000);

      // Check updated tracking
      const { data: updatedTracking } = await supabase
        .from('user_login_tracking')
        .select('*')
        .eq('user_id', authUser.user.id)
        .single();

      expect(updatedTracking?.login_count).toBe(2);

      // Cleanup
      await supabase.from('user_login_tracking').delete().eq('user_id', authUser.user.id);
      await supabase.from('users').delete().eq('id', authUser.user.id);
      await supabase.auth.admin.deleteUser(authUser.user.id);
    });
  });

  test.describe('API Endpoints', () => {
    test('should protect admin endpoints from non-super-admin access', async ({ request }) => {
      // Try to access admin endpoints without proper authentication
      const notificationsResponse = await request.get('/api/admin/notifications');
      expect(notificationsResponse.status()).toBe(401);

      const impersonateResponse = await request.post('/api/admin/impersonate', {
        data: { targetUserId: 'test-id', reason: 'test' },
      });
      expect(impersonateResponse.status()).toBe(401);
    });
  });
});
