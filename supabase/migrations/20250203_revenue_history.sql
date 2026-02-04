-- Create revenue_history table to track monthly revenue snapshots
CREATE TABLE IF NOT EXISTS revenue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL, -- First day of the month
  total_mrr DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_arr DECIMAL(10, 2) NOT NULL DEFAULT 0,
  active_subscriptions INTEGER NOT NULL DEFAULT 0,
  new_subscriptions INTEGER NOT NULL DEFAULT 0,
  churned_subscriptions INTEGER NOT NULL DEFAULT 0,
  plan_distribution JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month)
);

-- Create index on month for fast lookups
CREATE INDEX IF NOT EXISTS idx_revenue_history_month ON revenue_history(month DESC);

-- Enable RLS
ALTER TABLE revenue_history ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can read revenue history
CREATE POLICY "Super admins can read revenue history" ON revenue_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Policy: System can insert/update revenue history
CREATE POLICY "System can write revenue history" ON revenue_history
  FOR ALL
  USING (true)
  WITH CHECK (true);
