-- Backup codes table for 2FA recovery
CREATE TABLE backup_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE NOT NULL,
  used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for faster lookups
CREATE INDEX idx_backup_codes_user ON backup_codes(user_id, used);

-- RLS policies
ALTER TABLE backup_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own backup codes" ON backup_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own backup codes" ON backup_codes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own backup codes" ON backup_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backup codes" ON backup_codes
  FOR DELETE USING (auth.uid() = user_id);
