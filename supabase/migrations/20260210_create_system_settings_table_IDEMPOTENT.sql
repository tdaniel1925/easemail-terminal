-- Idempotent migration for system_settings table
-- This adds missing columns and inserts default settings if they don't exist

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add id column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'system_settings' AND column_name = 'id'
  ) THEN
    ALTER TABLE system_settings ADD COLUMN id UUID DEFAULT gen_random_uuid();
  END IF;

  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'system_settings' AND column_name = 'description'
  ) THEN
    ALTER TABLE system_settings ADD COLUMN description TEXT;
  END IF;

  -- Add updated_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'system_settings' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE system_settings ADD COLUMN updated_by UUID REFERENCES auth.users(id);
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'system_settings' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE system_settings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create unique constraint on key if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_constraint
    WHERE conname = 'system_settings_key_key'
  ) THEN
    ALTER TABLE system_settings ADD CONSTRAINT system_settings_key_key UNIQUE(key);
  END IF;
END $$;

-- Create index on key if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Insert default settings if they don't exist
INSERT INTO system_settings (key, value, description)
VALUES
  ('site_name', '"EaseMail"', 'The name of the application'),
  ('support_email', '"support@easemail.app"', 'Support email address'),
  ('maintenance_mode', 'false', 'Whether the site is in maintenance mode'),
  ('allow_signups', 'true', 'Whether new user signups are allowed'),
  ('require_email_verification', 'true', 'Whether email verification is required'),
  ('enable_ai_features', 'true', 'Whether AI features are enabled')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS if not already enabled
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage system settings" ON system_settings;

-- Create RLS policy for service role
CREATE POLICY "Service role can manage system settings"
  ON system_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
