-- Migration: Ensure only one primary email account per user
-- Purpose: Prevent duplicate primary account issues that cause 400 errors in API endpoints
-- Created: 2026-02-13

-- Drop index if it exists (idempotent)
DROP INDEX IF EXISTS unique_primary_per_user;

-- Create unique partial index to ensure only one primary account per user
-- This allows multiple accounts per user, but only one can have is_primary = true
CREATE UNIQUE INDEX unique_primary_per_user
ON email_accounts (user_id)
WHERE is_primary = true;

-- Add a comment explaining the constraint
COMMENT ON INDEX unique_primary_per_user IS
'Ensures each user can have only one primary email account. Prevents API errors when querying for primary account with .single()';
