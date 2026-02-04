-- Create audit_logs table for security and compliance tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_org_timestamp ON audit_logs(organization_id, timestamp DESC);

-- Add RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Organization owners and admins can view audit logs
CREATE POLICY "Organization admins can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = audit_logs.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('OWNER', 'ADMIN')
    )
  );

-- Policy: Members can create audit logs for their organization
CREATE POLICY "Members can create audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = audit_logs.organization_id
        AND organization_members.user_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON TABLE audit_logs IS 'Security and compliance audit log tracking all organization activities';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (e.g., member_added, plan_changed)';
COMMENT ON COLUMN audit_logs.details IS 'Additional context about the action in JSON format';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the user performing the action';
COMMENT ON COLUMN audit_logs.user_agent IS 'Browser/client user agent string';
