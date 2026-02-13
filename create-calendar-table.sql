-- Create calendar_metadata table
CREATE TABLE IF NOT EXISTS calendar_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nylas_calendar_id TEXT NOT NULL,
  nylas_grant_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  calendar_name TEXT NOT NULL,
  description TEXT,
  timezone TEXT DEFAULT 'UTC',
  is_primary BOOLEAN DEFAULT false,
  read_only BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nylas_calendar_id, email_account_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_metadata_user_id ON calendar_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_metadata_account_id ON calendar_metadata(email_account_id);
CREATE INDEX IF NOT EXISTS idx_calendar_metadata_grant_id ON calendar_metadata(nylas_grant_id);
CREATE INDEX IF NOT EXISTS idx_calendar_metadata_is_primary ON calendar_metadata(is_primary) WHERE is_primary = true;

-- Enable RLS
ALTER TABLE calendar_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own calendar metadata" ON calendar_metadata;
CREATE POLICY "Users can view their own calendar metadata"
  ON calendar_metadata FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own calendar metadata" ON calendar_metadata;
CREATE POLICY "Users can insert their own calendar metadata"
  ON calendar_metadata FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own calendar metadata" ON calendar_metadata;
CREATE POLICY "Users can update their own calendar metadata"
  ON calendar_metadata FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own calendar metadata" ON calendar_metadata;
CREATE POLICY "Users can delete their own calendar metadata"
  ON calendar_metadata FOR DELETE
  USING (user_id = auth.uid());
