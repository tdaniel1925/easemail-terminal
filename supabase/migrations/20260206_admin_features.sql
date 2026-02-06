-- Admin Notifications Table
-- Stores notifications for super admins about important events

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'org_admin_first_login', 'user_created', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- User who triggered the event
  metadata JSONB DEFAULT '{}', -- Additional event data
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Impersonate Sessions Table
-- Tracks when super admins impersonate users for audit purposes

CREATE TABLE IF NOT EXISTS impersonate_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  super_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  impersonated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT, -- Why they're impersonating
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT
);

-- User Login Tracking
-- Track first login for org admins

CREATE TABLE IF NOT EXISTS user_login_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_login_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  login_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_impersonate_sessions_super_admin ON impersonate_sessions(super_admin_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_impersonate_sessions_impersonated ON impersonate_sessions(impersonated_user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_tracking_user_id ON user_login_tracking(user_id);

-- RLS Policies
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonate_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_tracking ENABLE ROW LEVEL SECURITY;

-- Super admins can read all admin notifications
CREATE POLICY "Super admins can read admin notifications"
  ON admin_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Super admins can update notifications (mark as read)
CREATE POLICY "Super admins can update admin notifications"
  ON admin_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Super admins can view impersonate sessions
CREATE POLICY "Super admins can view impersonate sessions"
  ON impersonate_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Super admins can insert impersonate sessions
CREATE POLICY "Super admins can create impersonate sessions"
  ON impersonate_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Users can read their own login tracking
CREATE POLICY "Users can read own login tracking"
  ON user_login_tracking FOR SELECT
  USING (user_id = auth.uid());

-- System can insert/update login tracking
CREATE POLICY "System can manage login tracking"
  ON user_login_tracking FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Function to create notification when org admin logs in for first time
CREATE OR REPLACE FUNCTION notify_org_admin_first_login()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
  org_name TEXT;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM users WHERE id = NEW.user_id;

  -- Check if this is their first login and they're an org admin
  IF NEW.login_count = 1 AND NEW.first_login_at IS NOT NULL THEN
    -- Check if user is an organization admin
    IF EXISTS (
      SELECT 1 FROM organization_members om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = NEW.user_id
      AND om.role IN ('OWNER', 'ADMIN')
      LIMIT 1
    ) THEN
      -- Get organization name
      SELECT o.name INTO org_name
      FROM organization_members om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = NEW.user_id
      AND om.role IN ('OWNER', 'ADMIN')
      LIMIT 1;

      -- Create notification for super admins
      INSERT INTO admin_notifications (
        type,
        title,
        message,
        user_id,
        metadata
      ) VALUES (
        'org_admin_first_login',
        'New Organization Admin Login',
        format('Organization admin %s (%s) from %s has logged in for the first time.',
          COALESCE(user_profile.name, 'Unknown'),
          user_profile.email,
          COALESCE(org_name, 'Unknown Organization')
        ),
        NEW.user_id,
        jsonb_build_object(
          'organization_name', org_name,
          'user_email', user_profile.email,
          'user_name', user_profile.name
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS trigger_notify_org_admin_first_login ON user_login_tracking;
CREATE TRIGGER trigger_notify_org_admin_first_login
  AFTER INSERT OR UPDATE ON user_login_tracking
  FOR EACH ROW
  EXECUTE FUNCTION notify_org_admin_first_login();
