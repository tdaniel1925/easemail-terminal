-- Create custom labels table
CREATE TABLE IF NOT EXISTS custom_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6', -- Hex color code
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name) -- Prevent duplicate label names per user
);

-- Create message labels junction table (many-to-many)
CREATE TABLE IF NOT EXISTS message_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL, -- Nylas message ID
  label_id UUID NOT NULL REFERENCES custom_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id, label_id) -- Prevent duplicate labels on same message
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_labels_user_id ON custom_labels(user_id);
CREATE INDEX IF NOT EXISTS idx_message_labels_user_id ON message_labels(user_id);
CREATE INDEX IF NOT EXISTS idx_message_labels_message_id ON message_labels(message_id);
CREATE INDEX IF NOT EXISTS idx_message_labels_label_id ON message_labels(label_id);

-- Enable Row Level Security
ALTER TABLE custom_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_labels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_labels
CREATE POLICY "Users can view their own labels"
  ON custom_labels
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own labels"
  ON custom_labels
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own labels"
  ON custom_labels
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own labels"
  ON custom_labels
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for message_labels
CREATE POLICY "Users can view their own message labels"
  ON message_labels
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message labels"
  ON message_labels
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message labels"
  ON message_labels
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_labels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_custom_labels_updated_at
  BEFORE UPDATE ON custom_labels
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_labels_updated_at();
