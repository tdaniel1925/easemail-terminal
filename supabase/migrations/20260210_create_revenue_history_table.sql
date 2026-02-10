-- Create revenue_history table for tracking historical revenue snapshots
-- This table allows super admins to track revenue over time

-- Drop table if exists (idempotent)
DROP TABLE IF EXISTS revenue_history CASCADE;

-- Create revenue_history table
CREATE TABLE revenue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  monthly_recurring_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  annual_recurring_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_users INTEGER NOT NULL DEFAULT 0,
  paying_users INTEGER NOT NULL DEFAULT 0,
  trial_users INTEGER NOT NULL DEFAULT 0,
  cancelled_users INTEGER NOT NULL DEFAULT 0,
  total_organizations INTEGER NOT NULL DEFAULT 0,
  paying_organizations INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),

  -- Ensure one snapshot per date
  UNIQUE(snapshot_date)
);

-- Create index for efficient date-based queries
CREATE INDEX idx_revenue_history_snapshot_date ON revenue_history(snapshot_date DESC);
CREATE INDEX idx_revenue_history_created_at ON revenue_history(created_at DESC);

-- Enable RLS
ALTER TABLE revenue_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Super admins can view revenue history" ON revenue_history;
DROP POLICY IF EXISTS "Super admins can create revenue snapshots" ON revenue_history;
DROP POLICY IF EXISTS "Super admins can update revenue snapshots" ON revenue_history;
DROP POLICY IF EXISTS "Super admins can delete revenue snapshots" ON revenue_history;

-- Policy: Super admins can view all revenue history
CREATE POLICY "Super admins can view revenue history"
  ON revenue_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Policy: Super admins can create revenue snapshots
CREATE POLICY "Super admins can create revenue snapshots"
  ON revenue_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Policy: Super admins can update revenue snapshots
CREATE POLICY "Super admins can update revenue snapshots"
  ON revenue_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Policy: Super admins can delete revenue snapshots
CREATE POLICY "Super admins can delete revenue snapshots"
  ON revenue_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- Add helpful comment
COMMENT ON TABLE revenue_history IS 'Stores historical revenue snapshots for super admin analytics and reporting';
COMMENT ON COLUMN revenue_history.snapshot_date IS 'Date of the revenue snapshot (unique)';
COMMENT ON COLUMN revenue_history.metadata IS 'Additional metadata in JSON format for extensibility';
