-- Remove VIEWER role from role_type enum
-- This migration removes the VIEWER role option from the system

-- Step 1: Update any existing VIEWER members to MEMBER role
UPDATE organization_members
SET role = 'MEMBER'
WHERE role = 'VIEWER';

-- Step 2: Create new enum without VIEWER
CREATE TYPE role_type_new AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- Step 3: Update the column to use the new enum
ALTER TABLE organization_members
  ALTER COLUMN role TYPE role_type_new
  USING role::text::role_type_new;

-- Step 4: Drop old enum and rename new one
DROP TYPE role_type;
ALTER TYPE role_type_new RENAME TO role_type;

-- Add comment explaining the change
COMMENT ON TYPE role_type IS 'Organization member roles: OWNER (full control), ADMIN (manage org and users), MEMBER (regular user with email access)';
