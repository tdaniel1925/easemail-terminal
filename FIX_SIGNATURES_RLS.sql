-- Fix signatures table RLS policies
-- The issue: 403 errors when inserting signatures because RLS policies may have been dropped or are missing

-- First, check if policies exist and drop them to recreate
DROP POLICY IF EXISTS "Users can view their own signatures" ON public.signatures;
DROP POLICY IF EXISTS "Users can create their own signatures" ON public.signatures;
DROP POLICY IF EXISTS "Users can update their own signatures" ON public.signatures;
DROP POLICY IF EXISTS "Users can delete their own signatures" ON public.signatures;

-- Recreate policies
CREATE POLICY "Users can view their own signatures"
  ON public.signatures
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own signatures"
  ON public.signatures
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signatures"
  ON public.signatures
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signatures"
  ON public.signatures
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

-- Check the result
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'signatures';
