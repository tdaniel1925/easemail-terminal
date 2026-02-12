-- Fix Super Admin Status
-- Run this in Supabase SQL Editor

-- Step 1: Check current status
SELECT id, email, is_super_admin, created_at
FROM users
WHERE email = 'tdaniel@botmakers.ai';

-- Step 2: Set super admin flag to true
UPDATE users
SET is_super_admin = true
WHERE email = 'tdaniel@botmakers.ai';

-- Step 3: Verify it was set
SELECT id, email, is_super_admin
FROM users
WHERE email = 'tdaniel@botmakers.ai';

-- Step 4: Test if you can now create an organization
-- This simulates what the API does
-- If this works, then the API should work too
INSERT INTO organizations (name, slug, plan, seats, seats_used, billing_email, settings)
VALUES ('Test Org Via SQL', 'test-org-via-sql', 'PRO', 10, 0, 'tdaniel@botmakers.ai', '{}')
RETURNING id, name, slug, plan;

-- If the INSERT above succeeds, you can delete this test org:
-- DELETE FROM organizations WHERE slug = 'test-org-via-sql';
