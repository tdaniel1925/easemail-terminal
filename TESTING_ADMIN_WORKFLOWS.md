# Admin User Management Testing Guide

This document explains how to run E2E tests for the admin user management and onboarding workflows.

## Prerequisites

1. **Migration Applied**: Run the SQL migration first:
   ```sql
   -- Run this in Supabase SQL Editor:
   -- File: supabase/migrations/20260211_comprehensive_rls_and_user_prefs_fix.sql
   ```

2. **Super Admin Account**: You need a super admin account with credentials
   - Default: `tdaniel@botmakers.ai`
   - Password stored in environment variable

3. **Playwright Installed**:
   ```bash
   npx playwright install
   ```

## Setup Test Environment

1. **Create `.env.test` file** (copy from `.env.test.example`):
   ```env
   # Super Admin Credentials for Testing
   SUPER_ADMIN_EMAIL=tdaniel@botmakers.ai
   SUPER_ADMIN_PASSWORD=your-actual-password-here

   # Optional: Test User for Onboarding Flow
   TEST_USER_EMAIL=
   TEST_USER_PASSWORD=

   # App URL
   BASE_URL=https://easemail.app
   ```

2. **Set environment variables** (or use .env.test):
   ```bash
   # Windows PowerShell
   $env:SUPER_ADMIN_PASSWORD="your-password"

   # Windows CMD
   set SUPER_ADMIN_PASSWORD=your-password

   # Linux/Mac
   export SUPER_ADMIN_PASSWORD="your-password"
   ```

## Running Tests

### Run All Admin Tests
```bash
npm run test:e2e:admin
```

### Run Tests with Browser Visible (Headed Mode)
```bash
npm run test:e2e:admin:headed
```

### Run Tests in UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### Run Specific Test
```bash
npx playwright test -g "Super admin should create organization"
```

## Test Coverage

The test suite covers:

### 1. Super Admin Access
- ✅ Login as super admin
- ✅ Access admin dashboard
- ✅ Verify admin action buttons visible

### 2. Organization Creation
- ✅ Create new organization
- ✅ Verify organization appears in list
- ✅ Verify organization with correct plan and seats

### 3. Add User to Organization
- ✅ Select organization from dropdown
- ✅ Create new user with MEMBER role
- ✅ Get temporary password
- ✅ **CRITICAL**: Verify user skips onboarding and goes to dashboard
- ✅ Verify user can access app

### 4. Create Individual User
- ✅ Create individual user (not in organization)
- ✅ Get temporary password
- ✅ **CRITICAL**: Verify user skips onboarding
- ✅ Verify user can access app

### 5. Normal User Signup
- ✅ Regular signup flow
- ✅ Verify email verification required
- ✅ Verify onboarding IS required for signup users

### 6. Database Verification
- ✅ All users have user_preferences records
- ✅ No orphaned users
- ✅ Admin-created users have `onboarding_completed = true`
- ✅ Self-signup users have `onboarding_completed = false` (until they complete it)

### 7. Error Handling
- ✅ No RLS errors in console
- ✅ Graceful handling of missing preferences
- ✅ Proper error messages

## Expected Results

### ✅ PASS Criteria

**Admin-Created Users:**
- User created successfully
- User receives welcome email with temporary password
- User logs in with temporary password
- **User goes DIRECTLY to `/app` (dashboard)**
- **User does NOT see `/onboarding` page**
- Dashboard loads with all features accessible

**Self-Signup Users:**
- User signs up successfully
- User receives verification email
- After verification, user is redirected to `/onboarding`
- User completes onboarding wizard
- After onboarding, user goes to dashboard

**Database State:**
- Query shows 0 users without `user_preferences`
- All admin-created users have `onboarding_completed = true`
- All self-signup users have `onboarding_completed = false` initially

### ❌ FAIL Criteria

**Critical Failures:**
- Admin-created user redirected to `/onboarding` ❌
- RLS errors (406, row-level security) in console ❌
- User without `user_preferences` record ❌
- Cannot login after user creation ❌

**Non-Critical Failures:**
- Temporary password not displayed (test skipped, manual verification needed)
- Email not sent (logged warning, not test failure)

## Debugging Failed Tests

### Test Fails: "User redirected to onboarding"

**Problem:** Admin-created user is being forced through onboarding

**Checks:**
1. Verify SQL migration was run:
   ```sql
   SELECT * FROM user_preferences WHERE user_id = 'USER_ID_HERE';
   ```
   Should show `onboarding_completed = true`

2. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_preferences';
   ```
   Should have INSERT, SELECT, UPDATE, DELETE policies

3. Check app code:
   - `app/api/admin/organizations/add-user/route.ts` line 165-176
   - `app/api/admin/users/create-individual/route.ts` line 104-115
   - `app/api/admin/organizations/wizard/route.ts` line 124-137

   All should have code creating `user_preferences` record

### Test Fails: "RLS errors in console"

**Problem:** Row-level security policies missing or misconfigured

**Checks:**
1. Run comprehensive RLS fix migration again
2. Check all policies exist:
   ```sql
   SELECT schemaname, tablename, policyname, cmd
   FROM pg_policies
   WHERE tablename IN ('users', 'user_preferences', 'usage_tracking')
   ORDER BY tablename, cmd;
   ```

3. Check policy permissions match expected (see migration file)

### Test Fails: "Cannot find element"

**Problem:** UI structure changed or test selectors outdated

**Fix:**
1. Run test in headed mode to see actual UI:
   ```bash
   npm run test:e2e:admin:headed
   ```
2. Update selectors in `tests/admin-user-management.spec.ts`
3. Use Playwright Inspector for debugging:
   ```bash
   npx playwright test --debug
   ```

## Manual Verification

If automated tests cannot run, verify manually:

### 1. Create User via Admin
1. Login as tdaniel@botmakers.ai
2. Go to Admin → Organizations
3. Click "Add User to Org"
4. Fill form and submit
5. Copy temporary password from success message

### 2. Test New User Login
1. Logout
2. Login with new user email and temporary password
3. **VERIFY**: Redirects to `/app` NOT `/onboarding`
4. **VERIFY**: Dashboard loads normally

### 3. Check Database
```sql
-- Check user_preferences
SELECT
  u.email,
  up.onboarding_completed,
  up.created_at as prefs_created,
  u.created_at as user_created
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
WHERE u.email = 'NEW_USER_EMAIL_HERE';
```

Should show:
- `onboarding_completed`: `true`
- `prefs_created`: Same timestamp as user creation

## Troubleshooting

### "Cannot find super admin credentials"

Set environment variable:
```bash
$env:SUPER_ADMIN_PASSWORD="your-password"
```

Or create `.env.test` file with credentials.

### "Tests timeout waiting for page load"

Increase timeout in test file or check if:
- App is running (`npm run dev` or production deployed)
- BASE_URL is correct
- Network connectivity is good

### "Temporary password not found"

Tests will log warning but continue. This is OK - it means the UI doesn't show the password in a way tests can capture. Verify manually.

## CI/CD Integration

To run tests in CI:

```yaml
# .github/workflows/test.yml
- name: Run E2E Tests
  env:
    SUPER_ADMIN_PASSWORD: ${{ secrets.SUPER_ADMIN_PASSWORD }}
    BASE_URL: https://easemail.app
  run: npm run test:e2e:admin
```

## Reporting Issues

If tests fail, collect:
1. Test output/screenshots
2. Browser console logs
3. Database query results for affected users
4. Server logs from time of test

Then file issue with all information.

## Success Metrics

Tests are passing when:
- ✅ All 8 test scenarios pass
- ✅ 0 users without `user_preferences` in database
- ✅ 0 RLS errors in browser console
- ✅ Admin-created users login directly to dashboard
- ✅ Self-signup users complete onboarding

Last Updated: 2026-02-11
