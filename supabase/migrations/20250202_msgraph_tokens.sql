-- Create table for MS Graph OAuth tokens
CREATE TABLE IF NOT EXISTS ms_graph_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one token per user
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_msgraph_tokens_user_id ON ms_graph_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_msgraph_tokens_expires_at ON ms_graph_tokens(expires_at);

-- Enable RLS
ALTER TABLE ms_graph_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own tokens
CREATE POLICY "Users can view their own MS Graph tokens"
  ON ms_graph_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MS Graph tokens"
  ON ms_graph_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MS Graph tokens"
  ON ms_graph_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MS Graph tokens"
  ON ms_graph_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_msgraph_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER msgraph_tokens_updated_at
  BEFORE UPDATE ON ms_graph_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_msgraph_tokens_updated_at();
