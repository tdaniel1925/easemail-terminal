-- Create messages table for storing emails from Nylas
-- This enables local storage, folder filtering, and offline access

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Nylas identifiers
  nylas_message_id TEXT NOT NULL UNIQUE,
  nylas_thread_id TEXT,
  nylas_grant_id TEXT NOT NULL,

  -- User and account relationships
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,

  -- Email headers
  subject TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_recipients JSONB DEFAULT '[]'::jsonb,
  cc_recipients JSONB DEFAULT '[]'::jsonb,
  bcc_recipients JSONB DEFAULT '[]'::jsonb,
  reply_to JSONB DEFAULT '[]'::jsonb,

  -- Email content
  body TEXT,
  snippet TEXT,

  -- Folder and label information
  folder_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  labels TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Email metadata
  is_unread BOOLEAN DEFAULT true,
  is_starred BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT false,

  -- Timestamps
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),

  -- Attachments
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Full message data from Nylas (for reference)
  raw_message JSONB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_email_account_id ON messages(email_account_id);
CREATE INDEX IF NOT EXISTS idx_messages_nylas_message_id ON messages(nylas_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_nylas_thread_id ON messages(nylas_thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_date ON messages(date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_unread ON messages(is_unread) WHERE is_unread = true;
CREATE INDEX IF NOT EXISTS idx_messages_is_starred ON messages(is_starred) WHERE is_starred = true;
CREATE INDEX IF NOT EXISTS idx_messages_is_draft ON messages(is_draft) WHERE is_draft = true;

-- GIN index for folder_ids array for efficient folder filtering
CREATE INDEX IF NOT EXISTS idx_messages_folder_ids ON messages USING GIN(folder_ids);

-- GIN index for labels array
CREATE INDEX IF NOT EXISTS idx_messages_labels ON messages USING GIN(labels);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_messages_user_unread_date ON messages(user_id, is_unread, date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_account_date ON messages(email_account_id, date DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own messages
CREATE POLICY messages_user_policy ON messages
  FOR ALL
  USING (user_id = auth.uid());

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_updated_at_trigger
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Comment on table
COMMENT ON TABLE messages IS 'Stores email messages synced from Nylas for local filtering and offline access';
COMMENT ON COLUMN messages.nylas_message_id IS 'Unique message ID from Nylas API';
COMMENT ON COLUMN messages.nylas_grant_id IS 'Nylas grant ID for the email account';
COMMENT ON COLUMN messages.folder_ids IS 'Array of Nylas folder IDs this message belongs to';
COMMENT ON COLUMN messages.labels IS 'Array of label names/IDs applied to this message';
COMMENT ON COLUMN messages.raw_message IS 'Complete message data from Nylas for reference';
