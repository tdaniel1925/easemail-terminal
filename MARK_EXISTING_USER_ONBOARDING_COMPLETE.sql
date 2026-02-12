-- Mark existing users as having completed onboarding
-- This script updates user_preferences for users who already have accounts

-- Update all existing user_preferences to mark onboarding as completed
UPDATE user_preferences
SET
  onboarding_completed = true,
  onboarding_completed_at = COALESCE(onboarding_completed_at, created_at, NOW()),
  updated_at = NOW()
WHERE onboarding_completed IS NULL OR onboarding_completed = false;

-- If you don't have a user_preferences record at all, create one
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- You can find your user ID in Supabase Auth > Users

-- INSERT INTO user_preferences (user_id, onboarding_completed, onboarding_completed_at, created_at, updated_at)
-- VALUES ('YOUR_USER_ID_HERE', true, NOW(), NOW(), NOW())
-- ON CONFLICT (user_id) DO UPDATE
-- SET onboarding_completed = true, onboarding_completed_at = NOW(), updated_at = NOW();

-- Check the results
SELECT user_id, onboarding_completed, onboarding_completed_at
FROM user_preferences
ORDER BY created_at DESC
LIMIT 10;
