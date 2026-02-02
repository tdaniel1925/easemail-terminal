-- Create user preferences table for onboarding and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  use_case TEXT CHECK (use_case IN ('work', 'personal', 'both')),
  ai_features_enabled BOOLEAN DEFAULT true,
  auto_categorize BOOLEAN DEFAULT true,
  notification_schedule JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- 🔥 CRITICAL: Mark all EXISTING users as onboarding complete (non-breaking)
-- This ensures existing users bypass onboarding and only new users see it
INSERT INTO user_preferences (
  user_id,
  onboarding_completed,
  onboarding_completed_at,
  ai_features_enabled,
  auto_categorize,
  use_case
)
SELECT
  id,
  true, -- Mark as completed
  NOW(), -- Set completion time to now
  true, -- Enable AI features by default
  true, -- Enable auto-categorize by default
  'both' -- Default use case
FROM auth.users
ON CONFLICT (user_id) DO NOTHING; -- Don't override if preferences already exist

-- Add comment explaining the migration
COMMENT ON TABLE user_preferences IS 'Stores user onboarding status and email preferences. Existing users are automatically marked as onboarding complete to ensure non-breaking deployment.';
