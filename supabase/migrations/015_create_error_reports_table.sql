-- Create error_reports table for tracking application errors
CREATE TABLE IF NOT EXISTS error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_digest TEXT,
  error_type TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_error_reports_user_id ON error_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_created_at ON error_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_reports_error_type ON error_reports(error_type);
CREATE INDEX IF NOT EXISTS idx_error_reports_resolved ON error_reports(resolved) WHERE resolved = FALSE;

-- Enable RLS
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own error reports"
  ON error_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create error reports"
  ON error_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Super admins can view all error reports"
  ON error_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

CREATE POLICY "Super admins can update error reports"
  ON error_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Comments
COMMENT ON TABLE error_reports IS 'Stores user-reported application errors for debugging and analysis';
COMMENT ON COLUMN error_reports.context IS 'JSON object containing error context (URL, user agent, recent actions, etc.)';
COMMENT ON COLUMN error_reports.error_type IS 'Categorized error type (authentication, network, server, etc.)';
COMMENT ON COLUMN error_reports.resolved IS 'Whether this error has been investigated and resolved';
