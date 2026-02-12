-- Restore All Essential RLS Policies for Login and Onboarding
-- Run this comprehensive script to fix all common RLS issues

-- ============================================
-- 1. USERS TABLE
-- ============================================
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

-- ============================================
-- 2. USER_PREFERENCES TABLE
-- ============================================
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

-- ============================================
-- 3. ONBOARDING_STATUS TABLE (if exists)
-- ============================================
DROP POLICY IF EXISTS "Users can view own onboarding status" ON onboarding_status;
CREATE POLICY "Users can view own onboarding status"
ON onboarding_status FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own onboarding status" ON onboarding_status;
CREATE POLICY "Users can insert own onboarding status"
ON onboarding_status FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own onboarding status" ON onboarding_status;
CREATE POLICY "Users can update own onboarding status"
ON onboarding_status FOR UPDATE
USING (user_id = auth.uid());

-- SUCCESS
SELECT 'RLS policies restored for users, user_preferences, and onboarding_status' AS status;
