-- Create drafts table for auto-saving email drafts
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL,

  -- Recipients
  to_recipients TEXT[], -- Array of email addresses
  cc_recipients TEXT[],
  bcc_recipients TEXT[],

  -- Content
  subject TEXT,
  body TEXT,

  -- Reply context
  reply_to_message_id TEXT, -- If this is a reply
  is_forward BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Index for quick lookups
  CONSTRAINT drafts_user_id_idx UNIQUE (user_id, id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON drafts(updated_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_drafts_updated_at ON drafts;
CREATE TRIGGER trigger_drafts_updated_at
  BEFORE UPDATE ON drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_drafts_updated_at();

-- Enable Row Level Security
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own drafts" ON drafts;
CREATE POLICY "Users can view their own drafts"
  ON drafts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own drafts" ON drafts;
CREATE POLICY "Users can insert their own drafts"
  ON drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own drafts" ON drafts;
CREATE POLICY "Users can update their own drafts"
  ON drafts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own drafts" ON drafts;
CREATE POLICY "Users can delete their own drafts"
  ON drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON drafts TO authenticated;
GRANT ALL ON drafts TO service_role;
