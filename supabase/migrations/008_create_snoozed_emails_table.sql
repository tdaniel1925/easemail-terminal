-- Create snoozed emails table
CREATE TABLE IF NOT EXISTS snoozed_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL, -- Nylas message ID
  thread_id TEXT, -- Nylas thread ID for grouping
  snooze_until TIMESTAMP WITH TIME ZONE NOT NULL,
  original_folder TEXT DEFAULT 'inbox', -- Where to restore the email
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_snoozed_emails_user_id ON snoozed_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_snoozed_emails_message_id ON snoozed_emails(message_id);
CREATE INDEX IF NOT EXISTS idx_snoozed_emails_snooze_until ON snoozed_emails(snooze_until);

-- Enable Row Level Security
ALTER TABLE snoozed_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own snoozed emails"
  ON snoozed_emails
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snoozed emails"
  ON snoozed_emails
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snoozed emails"
  ON snoozed_emails
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snoozed emails"
  ON snoozed_emails
  FOR DELETE
  USING (auth.uid() = user_id);
