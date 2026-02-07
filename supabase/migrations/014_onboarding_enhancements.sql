-- Migration: Onboarding Enhancements
-- Adds fields to support admin-added email accounts and enhanced onboarding

-- ============================================================================
-- 1. Email Accounts Enhancements
-- ============================================================================

-- Add fields to track admin-added email accounts
ALTER TABLE email_accounts
  ADD COLUMN IF NOT EXISTS needs_oauth_connection BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS added_by_admin UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS pre_configured_during_setup BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_provider TEXT; -- 'gmail', 'outlook', 'other'

-- Add comment
COMMENT ON COLUMN email_accounts.needs_oauth_connection IS 'True if user needs to complete OAuth connection';
COMMENT ON COLUMN email_accounts.added_by_admin IS 'Admin who added this email account during user creation';
COMMENT ON COLUMN email_accounts.pre_configured_during_setup IS 'True if added during organization user creation';
COMMENT ON COLUMN email_accounts.email_provider IS 'Email provider: gmail, outlook, or other';

-- Make grant_id nullable for pre-configured accounts that haven't been connected yet
ALTER TABLE email_accounts ALTER COLUMN grant_id DROP NOT NULL;

-- ============================================================================
-- 2. User Preferences Enhancements
-- ============================================================================

-- Add fields to track onboarding progress
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'welcome',
  ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS has_uploaded_profile_picture BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN user_preferences.onboarding_step IS 'Current onboarding step: welcome, use-case, profile, email, signature, complete';
COMMENT ON COLUMN user_preferences.onboarding_progress IS 'Tracks completed onboarding steps and metadata';
COMMENT ON COLUMN user_preferences.has_uploaded_profile_picture IS 'True if user uploaded profile picture during onboarding or settings';

-- ============================================================================
-- 3. Signatures Enhancements
-- ============================================================================

-- Link signatures to specific email accounts
ALTER TABLE signatures
  ADD COLUMN IF NOT EXISTS email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_during_onboarding BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN signatures.email_account_id IS 'Links signature to specific email account. NULL means applies to all accounts.';
COMMENT ON COLUMN signatures.created_during_onboarding IS 'True if created during onboarding wizard';

-- ============================================================================
-- 4. Users Table Enhancements
-- ============================================================================

-- Add profile picture URL
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture_uploaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN users.profile_picture_url IS 'URL to user profile picture (stored in Supabase Storage)';
COMMENT ON COLUMN users.profile_picture_uploaded_at IS 'Timestamp when profile picture was uploaded';
COMMENT ON COLUMN users.timezone IS 'User timezone for scheduling and display';
COMMENT ON COLUMN users.email_verified_at IS 'Timestamp when login email was verified';

-- ============================================================================
-- 5. Create Storage Bucket for Profile Pictures
-- ============================================================================

-- Insert storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. RLS Policies for Profile Pictures
-- ============================================================================

-- Allow users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow everyone to view profile pictures (public bucket)
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

-- ============================================================================
-- 7. Indexes for Performance
-- ============================================================================

-- Index for finding pre-configured email accounts
CREATE INDEX IF NOT EXISTS idx_email_accounts_needs_connection
ON email_accounts(user_id, needs_oauth_connection)
WHERE needs_oauth_connection = true;

-- Index for finding signatures by email account
CREATE INDEX IF NOT EXISTS idx_signatures_email_account
ON signatures(email_account_id)
WHERE email_account_id IS NOT NULL;

-- ============================================================================
-- 8. Signature Templates Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS signature_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT, -- 'professional', 'casual', 'corporate', 'creative'
  is_system_template BOOLEAN DEFAULT true,
  preview_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE signature_templates IS 'Pre-built signature templates for users to choose from during onboarding';

-- Insert default templates
INSERT INTO signature_templates (name, description, content, category) VALUES
('Professional', 'Clean and professional signature', 'Best regards,<br>{{name}}<br>{{title}}<br>{{company}}', 'professional'),
('Casual', 'Friendly and approachable', 'Cheers,<br>{{name}}<br>{{email}}', 'casual'),
('Corporate', 'Formal corporate style', 'Sincerely,<br>{{name}}<br>{{title}} | {{company}}<br>{{phone}} | {{email}}', 'corporate'),
('Creative', 'Modern and creative', '{{name}}<br>{{title}}<br>✉️ {{email}} | 📱 {{phone}}', 'creative'),
('Minimal', 'Simple and minimal', '{{name}}<br>{{email}}', 'professional')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. Product Tour Tracking
-- ============================================================================

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS product_tour_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS product_tour_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS product_tour_skipped BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_preferences.product_tour_completed IS 'True if user completed the interactive product tour';
COMMENT ON COLUMN user_preferences.product_tour_skipped IS 'True if user skipped the product tour';

-- ============================================================================
-- 10. Notification Preferences
-- ============================================================================

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'realtime', -- 'realtime', 'hourly', 'daily', 'weekly'
  ADD COLUMN IF NOT EXISTS quiet_hours_start TIME,
  ADD COLUMN IF NOT EXISTS quiet_hours_end TIME;

COMMENT ON COLUMN user_preferences.email_notifications_enabled IS 'Enable email notifications for new messages';
COMMENT ON COLUMN user_preferences.push_notifications_enabled IS 'Enable push notifications';
COMMENT ON COLUMN user_preferences.notification_frequency IS 'How often to send notification digests';
COMMENT ON COLUMN user_preferences.quiet_hours_start IS 'Start time for quiet hours (no notifications)';
COMMENT ON COLUMN user_preferences.quiet_hours_end IS 'End time for quiet hours';

-- ============================================================================
-- 11. Bulk User Import Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS bulk_user_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  imported_by UUID NOT NULL REFERENCES users(id),
  file_name TEXT,
  total_users INTEGER NOT NULL,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_log JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

COMMENT ON TABLE bulk_user_imports IS 'Tracks bulk user imports via CSV';

CREATE INDEX IF NOT EXISTS idx_bulk_imports_org
ON bulk_user_imports(organization_id, created_at DESC);

-- ============================================================================
-- 12. Team Introduction Tracking
-- ============================================================================

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS team_intro_shown BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS team_intro_shown_at TIMESTAMPTZ;

COMMENT ON COLUMN user_preferences.team_intro_shown IS 'True if user has seen their team introduction';

-- ============================================================================
-- 13. Update Existing Data
-- ============================================================================

-- Set email_provider for existing accounts based on email domain
UPDATE email_accounts
SET email_provider = CASE
  WHEN email ILIKE '%@gmail.com' THEN 'gmail'
  WHEN email ILIKE '%@googlemail.com' THEN 'gmail'
  WHEN email ILIKE '%@outlook.com' THEN 'outlook'
  WHEN email ILIKE '%@hotmail.com' THEN 'outlook'
  WHEN email ILIKE '%@live.com' THEN 'outlook'
  ELSE 'other'
END
WHERE email_provider IS NULL;

-- Mark existing users as having verified emails (grandfathered in)
UPDATE users
SET email_verified_at = created_at
WHERE email_verified_at IS NULL AND created_at IS NOT NULL;
