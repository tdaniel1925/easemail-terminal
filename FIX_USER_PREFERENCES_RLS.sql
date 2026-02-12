-- Fix Missing user_preferences Table RLS Policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON user_preferences
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON user_preferences
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON user_preferences
FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
ON user_preferences
FOR DELETE
USING (user_id = auth.uid());

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ user_preferences table RLS policies restored!';
  RAISE NOTICE '✅ Onboarding should now work';
END$$;
