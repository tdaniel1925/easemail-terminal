-- Verify RLS Policies are in Place
-- Run this in Supabase SQL Editor to check if the migration was applied correctly

-- 1. Check if RLS is enabled on organizations table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'organization_members');

-- 2. List all policies on organizations table
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

-- 3. List all policies on organization_members table
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'organization_members'
ORDER BY policyname;

-- 4. Check if the super admin user exists and has correct permissions
SELECT id, email, is_super_admin
FROM users
WHERE email = 'tdaniel@botmakers.ai';

-- 5. Test organization creation manually (will show actual error)
-- Replace USER_ID with the id from query #4
/*
INSERT INTO organizations (name, slug, plan, seats, seats_used, billing_email, settings)
VALUES ('Test Org Manual', 'test-org-manual', 'PRO', 10, 0, 'tdaniel@botmakers.ai', '{}')
RETURNING *;
*/
