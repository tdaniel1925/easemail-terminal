-- Repair migration: Add token and expires_at columns to organization_invites if they don't exist
-- This handles the case where the table exists but is missing columns needed for the invite system

DO $$
BEGIN
    -- Add token column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organization_invites'
        AND column_name = 'token'
    ) THEN
        ALTER TABLE organization_invites
        ADD COLUMN token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text;

        RAISE NOTICE 'Added token column to organization_invites';
    END IF;

    -- Add expires_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organization_invites'
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE organization_invites
        ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days');

        RAISE NOTICE 'Added expires_at column to organization_invites';
    END IF;

    -- Add accepted_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organization_invites'
        AND column_name = 'accepted_at'
    ) THEN
        ALTER TABLE organization_invites
        ADD COLUMN accepted_at TIMESTAMPTZ;

        RAISE NOTICE 'Added accepted_at column to organization_invites';
    END IF;

    -- Add constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'organization_invites'
        AND constraint_name = 'valid_expiry'
    ) THEN
        ALTER TABLE organization_invites
        ADD CONSTRAINT valid_expiry CHECK (expires_at > created_at);

        RAISE NOTICE 'Added valid_expiry constraint to organization_invites';
    END IF;
END $$;
