-- Step 1: Add the is_super_admin column if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Step 2: Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_super_admin
ON public.users(is_super_admin)
WHERE is_super_admin = TRUE;

-- Step 3: Set tdaniel@botmakers.ai as super admin
UPDATE public.users
SET is_super_admin = true
WHERE email = 'tdaniel@botmakers.ai';

-- Step 4: Verify it worked
SELECT
  email,
  name,
  is_super_admin,
  created_at
FROM public.users
WHERE email = 'tdaniel@botmakers.ai';
