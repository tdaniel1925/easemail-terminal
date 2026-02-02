-- Create spam reports table
CREATE TABLE IF NOT EXISTS spam_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL, -- Nylas message ID
  sender_email TEXT NOT NULL,
  subject TEXT,
  is_spam BOOLEAN DEFAULT TRUE,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id) -- Prevent duplicate reports for same message
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_spam_reports_user_id ON spam_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_spam_reports_sender_email ON spam_reports(sender_email);
CREATE INDEX IF NOT EXISTS idx_spam_reports_is_spam ON spam_reports(is_spam);

-- Enable Row Level Security
ALTER TABLE spam_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own spam reports"
  ON spam_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spam reports"
  ON spam_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spam reports"
  ON spam_reports
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spam reports"
  ON spam_reports
  FOR DELETE
  USING (auth.uid() = user_id);
