-- Create folder_mappings table to map Nylas folders to standardized folder types
-- This enables consistent folder filtering across different email providers

CREATE TYPE folder_type AS ENUM (
  'inbox',
  'sent',
  'drafts',
  'trash',
  'spam',
  'archive',
  'starred',
  'important',
  'custom'
);

CREATE TABLE IF NOT EXISTS folder_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Nylas folder information
  nylas_folder_id TEXT NOT NULL,
  nylas_grant_id TEXT NOT NULL,

  -- User and account relationships
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,

  -- Folder details from Nylas
  folder_name TEXT NOT NULL,
  folder_type folder_type NOT NULL,
  parent_id TEXT,

  -- Folder attributes (IMAP attributes like \Sent, \Drafts, etc.)
  attributes TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Folder metadata
  unread_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  child_count INTEGER DEFAULT 0,

  -- Sync information
  is_system_folder BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one mapping per Nylas folder per account
  UNIQUE(nylas_folder_id, email_account_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_folder_mappings_user_id ON folder_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_folder_mappings_email_account_id ON folder_mappings(email_account_id);
CREATE INDEX IF NOT EXISTS idx_folder_mappings_nylas_folder_id ON folder_mappings(nylas_folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_mappings_folder_type ON folder_mappings(folder_type);
CREATE INDEX IF NOT EXISTS idx_folder_mappings_grant_id ON folder_mappings(nylas_grant_id);
CREATE INDEX IF NOT EXISTS idx_folder_mappings_is_system ON folder_mappings(is_system_folder) WHERE is_system_folder = true;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_folder_mappings_user_type ON folder_mappings(user_id, folder_type);
CREATE INDEX IF NOT EXISTS idx_folder_mappings_account_type ON folder_mappings(email_account_id, folder_type);

-- Enable Row Level Security
ALTER TABLE folder_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own folder mappings
CREATE POLICY folder_mappings_user_policy ON folder_mappings
  FOR ALL
  USING (user_id = auth.uid());

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_folder_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER folder_mappings_updated_at_trigger
  BEFORE UPDATE ON folder_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_folder_mappings_updated_at();

-- Helper function to get folder ID by type for an account
CREATE OR REPLACE FUNCTION get_folder_id_by_type(
  p_email_account_id UUID,
  p_folder_type folder_type
)
RETURNS TEXT AS $$
DECLARE
  v_folder_id TEXT;
BEGIN
  SELECT nylas_folder_id INTO v_folder_id
  FROM folder_mappings
  WHERE email_account_id = p_email_account_id
    AND folder_type = p_folder_type
    AND is_active = true
  LIMIT 1;

  RETURN v_folder_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function to get all folder IDs by type for a user
CREATE OR REPLACE FUNCTION get_folder_ids_by_type_for_user(
  p_user_id UUID,
  p_folder_type folder_type
)
RETURNS TEXT[] AS $$
DECLARE
  v_folder_ids TEXT[];
BEGIN
  SELECT array_agg(nylas_folder_id) INTO v_folder_ids
  FROM folder_mappings
  WHERE user_id = p_user_id
    AND folder_type = p_folder_type
    AND is_active = true;

  RETURN COALESCE(v_folder_ids, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql STABLE;

-- Comments
COMMENT ON TABLE folder_mappings IS 'Maps Nylas folder IDs to standardized folder types for consistent filtering';
COMMENT ON COLUMN folder_mappings.nylas_folder_id IS 'Unique folder ID from Nylas API';
COMMENT ON COLUMN folder_mappings.folder_type IS 'Standardized folder type (inbox, sent, drafts, etc.)';
COMMENT ON COLUMN folder_mappings.attributes IS 'IMAP attributes like \Sent, \Drafts used to identify system folders';
COMMENT ON COLUMN folder_mappings.is_system_folder IS 'True for standard folders (inbox, sent, etc.), false for custom user folders';
