-- Create system_settings table for storing application-wide settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on key for faster lookups
CREATE INDEX idx_system_settings_key ON system_settings(key);

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
  ('site_name', '"EaseMail"', 'The name of the application'),
  ('support_email', '"support@easemail.app"', 'Support email address'),
  ('maintenance_mode', 'false', 'Whether the site is in maintenance mode'),
  ('allow_signups', 'true', 'Whether new user signups are allowed'),
  ('require_email_verification', 'true', 'Whether email verification is required'),
  ('enable_ai_features', 'true', 'Whether AI features are enabled')
ON CONFLICT (key) DO NOTHING;

-- RLS policies - only super admins can access
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Super admins can view all settings (service role)
CREATE POLICY "Service role can manage system settings"
  ON system_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
