-- COMPLETE AUTH AND ONBOARDING FIX
-- This script fixes all RLS policies and marks super admin as onboarded

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
-- PART 2: FIX SUPER ADMIN ONBOARDING STATUS
-- ============================================

-- Find the super admin user
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the super admin user ID
    SELECT id INTO admin_user_id
    FROM users
    WHERE is_super_admin = true
    LIMIT 1;

    IF admin_user_id IS NOT NULL THEN
        -- Insert or update user_preferences for super admin
        INSERT INTO user_preferences (
            user_id,
            onboarding_completed,
            onboarding_completed_at,
            ai_features_enabled,
            auto_categorize,
            created_at,
            updated_at
        )
        VALUES (
            admin_user_id,
            true,
            NOW(),
            true,
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE
        SET
            onboarding_completed = true,
            onboarding_completed_at = COALESCE(user_preferences.onboarding_completed_at, NOW()),
            updated_at = NOW();

        RAISE NOTICE 'Super admin onboarding marked as completed for user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'No super admin user found';
    END IF;
END $$;

-- ============================================
-- PART 3: VERIFY AND SHOW RESULTS
-- ============================================

-- Show super admin user preferences
SELECT
    u.id as user_id,
    u.email,
    u.name,
    u.is_super_admin,
    up.onboarding_completed,
    up.onboarding_completed_at
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
WHERE u.is_super_admin = true;

-- Show message
SELECT '✅ Auth and onboarding fix completed! Try logging in now.' AS status;
