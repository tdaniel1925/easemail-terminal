-- Fix RLS for email_accounts table
-- This ensures users can access their own email accounts

-- Enable RLS on email_accounts
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own email accounts" ON email_accounts;
DROP POLICY IF EXISTS "Users can insert own email accounts" ON email_accounts;
DROP POLICY IF EXISTS "Users can update own email accounts" ON email_accounts;
DROP POLICY IF EXISTS "Users can delete own email accounts" ON email_accounts;

-- Create SELECT policy - Users can view their own email accounts
CREATE POLICY "Users can view own email accounts"
  ON email_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Create INSERT policy - Users can insert their own email accounts
CREATE POLICY "Users can insert own email accounts"
  ON email_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy - Users can update their own email accounts
CREATE POLICY "Users can update own email accounts"
  ON email_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Create DELETE policy - Users can delete their own email accounts
CREATE POLICY "Users can delete own email accounts"
  ON email_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'email_accounts'
ORDER BY policyname;

-- Check RLS status
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'email_accounts';
