-- ============================================================================
-- COMPREHENSIVE AUTH FIX - RLS Policies + Missing user_preferences
-- This migration fixes all authentication and onboarding issues
-- ============================================================================

-- ============================================
-- PART 1: RESTORE ALL CRITICAL RLS POLICIES
-- ============================================

-- 1. USERS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- 2. USER_PREFERENCES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences"
ON user_preferences FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences"
ON user_preferences FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;
CREATE POLICY "Users can delete own preferences"
ON user_preferences FOR DELETE
USING (user_id = auth.uid());

-- 3. USAGE_TRACKING TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own usage tracking" ON usage_tracking;
CREATE POLICY "Users can view own usage tracking"
ON usage_tracking FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own usage tracking" ON usage_tracking;
CREATE POLICY "Users can insert own usage tracking"
ON usage_tracking FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================
-- PART 2: FIX USER SYNC TRIGGER
-- ============================================

-- Enhanced trigger that creates both users and user_preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user record
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);

  -- Create user_preferences record with onboarding NOT completed
  -- (User will go through onboarding flow)
  INSERT INTO public.user_preferences (
    user_id,
    onboarding_completed,
    ai_features_enabled,
    auto_categorize,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    false, -- New users must complete onboarding
    true,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 3: CREATE MISSING user_preferences FOR EXISTING USERS
-- ============================================

-- Create user_preferences for any users that don't have them
-- Mark them as onboarding completed (they're existing users)
INSERT INTO user_preferences (
  user_id,
  onboarding_completed,
  onboarding_completed_at,
  ai_features_enabled,
  auto_categorize,
  created_at,
  updated_at
)
SELECT
  u.id,
  true, -- Existing users bypass onboarding
  NOW(),
  true,
  true,
  NOW(),
  NOW()
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
WHERE up.user_id IS NULL; -- Only for users without preferences

-- ============================================
-- PART 4: VERIFICATION
-- ============================================

-- Show all users and their onboarding status
DO $$
DECLARE
  missing_prefs_count INTEGER;
  total_users_count INTEGER;
BEGIN
  -- Count users without preferences
  SELECT COUNT(*) INTO missing_prefs_count
  FROM users u
  LEFT JOIN user_preferences up ON u.id = up.user_id
  WHERE up.user_id IS NULL;

  -- Count total users
  SELECT COUNT(*) INTO total_users_count FROM users;

  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total users: %', total_users_count;
  RAISE NOTICE 'Users without preferences (should be 0): %', missing_prefs_count;
  RAISE NOTICE '============================================';
  RAISE NOTICE 'RLS Policies restored:';
  RAISE NOTICE '  - users (SELECT, UPDATE, INSERT)';
  RAISE NOTICE '  - user_preferences (SELECT, INSERT, UPDATE, DELETE)';
  RAISE NOTICE '  - usage_tracking (SELECT, INSERT)';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'User sync trigger updated to create user_preferences';
  RAISE NOTICE '============================================';
END$$;

-- Display users and their status
SELECT
  u.id,
  u.email,
  u.name,
  u.is_super_admin,
  up.onboarding_completed,
  up.onboarding_completed_at,
  u.created_at as user_created_at
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
ORDER BY u.created_at DESC;
