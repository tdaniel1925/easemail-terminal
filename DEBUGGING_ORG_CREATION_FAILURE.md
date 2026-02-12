# Debugging Organization Creation Failure

## Current Status

### ✅ Confirmed Working:
1. E2E tests successfully run
2. Super admin can login and access dashboard
3. User onboarding bypass works (admin-created users skip onboarding)
4. Tests properly detect and report API errors

### ❌ Currently Failing:
**Organization Creation** - API returns 500 error with message "Failed to create organization"

## Test Results

The E2E test captured the exact error from the API:

```
API Response Status: 500
API Response Body: {
  "error": "Failed to create organization"
}
```

This generic error message comes from the catch block in the API route. The **actual database error** is being logged server-side but we need to check Vercel logs to see it.

## Migrations Applied

You confirmed you ran:
- ✅ `20260211_comprehensive_rls_and_user_prefs_fix.sql`
- ✅ `20260211_add_missing_organization_rls_policies.sql`

## Possible Root Causes

### 1. RLS Policies Not Applied Correctly (Most Likely)
The migration may not have applied correctly, or there's a syntax issue with the policies.

**Verification**: Run `VERIFY_RLS_POLICIES.sql` in Supabase SQL Editor to check:
- Is RLS enabled on organizations table?
- Do all 4 policies exist (select, insert, update, delete)?
- Is tdaniel@botmakers.ai marked as `is_super_admin = true`?

### 2. User Not Marked as Super Admin
The user might not have `is_super_admin = true` in the database.

**Fix**: Run this in Supabase:
```sql
UPDATE users
SET is_super_admin = true
WHERE email = 'tdaniel@botmakers.ai';
```

### 3. Missing or Invalid Columns
The organizations table might be missing columns or have constraints that are failing.

**Check**: The API tries to insert:
- name (TEXT)
- slug (TEXT)
- plan (plan_type ENUM)
- seats (INTEGER)
- seats_used (INTEGER)
- billing_email (TEXT)
- settings (JSONB)

All these columns exist in the schema, so this is unlikely.

### 4. Database Connection Issue
The Supabase client might not be authenticating correctly from the server-side API.

**Check**: Verify `.env.local` has correct Supabase credentials.

## Next Debugging Steps

### Step 1: Check Supabase Dashboard
1. Go to Supabase Dashboard > Authentication > Users
2. Find `tdaniel@botmakers.ai`
3. Check if `is_super_admin = true` in the user metadata

### Step 2: Check RLS Policies
Run `VERIFY_RLS_POLICIES.sql` in Supabase SQL Editor and check output.

### Step 3: Check Supabase Logs
1. Go to Supabase Dashboard > Logs > Postgres Logs
2. Filter for "organizations" or "INSERT"
3. Look for the actual database error message

### Step 4: Manual Test
Run `TEST_RLS_MANUALLY.sql` to test if you can insert directly (this will show the exact error).

### Step 5: Check Vercel Logs
The actual database error is logged in the API route at line 90:
```typescript
console.error('Failed to create organization:', orgError);
```

Check Vercel logs to see this error message.

## Debug Scripts Created

1. **`VERIFY_RLS_POLICIES.sql`** - Verifies RLS policies are in place
2. **`TEST_RLS_MANUALLY.sql`** - Tests manual insertion to see actual error
3. **`debug-org-creation.mjs`** - Node script to test API directly with auth cookies

## Most Likely Fix

Based on similar issues, the most common cause is that the RLS policy is checking for `is_super_admin` but the user doesn't have that flag set.

**Quick Fix**:
```sql
-- 1. Check if user has super admin flag
SELECT id, email, is_super_admin
FROM users
WHERE email = 'tdaniel@botmakers.ai';

-- 2. If is_super_admin is NULL or false, set it to true
UPDATE users
SET is_super_admin = true
WHERE email = 'tdaniel@botmakers.ai';

-- 3. Try creating organization again through UI
```

## How to Get the Actual Error

The best way to see the actual database error is to check the Vercel deployment logs:

```bash
# Get the production deployment URL
npx vercel ls --prod

# View logs for the latest ready deployment
npx vercel logs https://easemail-terminal-xxxxx-bot-makers.vercel.app

# Or check Supabase Postgres logs directly in the dashboard
```

## Test Files Updated

- `tests/admin-user-management.spec.ts` - Now captures and logs API responses
- Successfully detects 500 errors and shows API response body
- Network monitoring shows exact error returned by API

## Summary

The organization creation is failing at the database level, but we need to see the **actual error message** from Supabase to know why. The most likely causes are:

1. User not marked as super admin (60% probability)
2. RLS policies not applied/incorrect syntax (30% probability)
3. Other database constraint (10% probability)

**Next Action**: Please run `VERIFY_RLS_POLICIES.sql` in Supabase and share the output, or check Supabase Postgres logs for the INSERT error.
