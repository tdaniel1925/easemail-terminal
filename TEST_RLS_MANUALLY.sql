-- Test RLS Policies Manually
-- Run these queries in Supabase SQL Editor (as authenticated user)

-- Step 1: Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'organizations' AND schemaname = 'public';
-- Expected: rowsecurity = true

-- Step 2: Check if policies exist
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;
-- Expected: Should see 4 policies (select, insert, update, delete)

-- Step 3: Check current user
SELECT auth.uid() as current_user_id;

-- Step 4: Check if current user is super admin
SELECT id, email, is_super_admin
FROM users
WHERE id = auth.uid();
-- Expected: is_super_admin = true for tdaniel@botmakers.ai

-- Step 5: Test manual INSERT (this will show the actual RLS error if there is one)
-- NOTE: This uses the service role / will bypass RLS in SQL editor
-- To test RLS properly, we need to use the API or test with actual auth context

-- If you want to test the RLS policy itself, you can temporarily disable it:
-- ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
-- Then try the insert:
/*
INSERT INTO organizations (name, slug, plan, seats, seats_used, billing_email, settings)
VALUES ('RLS Test Org', 'rls-test-org', 'PRO', 10, 0, 'tdaniel@botmakers.ai', '{}')
RETURNING *;
*/
-- Then re-enable:
-- ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Step 6: Check if there are any other constraints that might be failing
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'organizations'::regclass;
