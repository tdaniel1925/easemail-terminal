-- Add nylas_draft_id column to drafts table for bi-directional syncing
ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS nylas_draft_id TEXT;

-- Create index for looking up drafts by Nylas ID
CREATE INDEX IF NOT EXISTS idx_drafts_nylas_draft_id ON drafts(nylas_draft_id);

-- Add comment
COMMENT ON COLUMN drafts.nylas_draft_id IS 'Nylas draft ID for bi-directional sync';
