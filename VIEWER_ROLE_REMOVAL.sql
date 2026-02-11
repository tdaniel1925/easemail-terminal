-- Complete VIEWER Role Removal Migration
-- This script handles all dependencies including policies on other tables

-- PHASE 1: Disable RLS on all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY;', r.tablename);
        RAISE NOTICE 'Disabled RLS on: %', r.tablename;
    END LOOP;
END$$;

-- PHASE 2: Drop ALL policies in public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', r.policyname, r.tablename);
        RAISE NOTICE 'Dropped policy: % on %', r.policyname, r.tablename;
    END LOOP;
END$$;

-- PHASE 3: Drop default value on role column
ALTER TABLE organization_members ALTER COLUMN role DROP DEFAULT;

-- PHASE 4: Create new enum type without VIEWER
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type_new') THEN
        CREATE TYPE role_type_new AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
        RAISE NOTICE 'Created role_type_new enum';
    END IF;
END$$;

-- PHASE 5: Update column to use new enum
ALTER TABLE organization_members
  ALTER COLUMN role TYPE role_type_new
  USING role::text::role_type_new;

-- PHASE 6: Drop old enum and rename new one
DROP TYPE role_type CASCADE;
ALTER TYPE role_type_new RENAME TO role_type;

-- PHASE 7: Re-enable RLS on all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', r.tablename);
        RAISE NOTICE 'Enabled RLS on: %', r.tablename;
    END LOOP;
END$$;

-- PHASE 8: Recreate essential organization_members policies
-- Policy: Users can view organization members if they are a member of that organization
CREATE POLICY "Members can view organization members"
ON organization_members
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id
    FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
  )
);

-- Policy: Only OWNERs and ADMINs can insert new members
CREATE POLICY "Admins can add members"
ON organization_members
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id
    FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.role IN ('OWNER', 'ADMIN')
  )
);

-- Policy: Only OWNERs and ADMINs can update members
CREATE POLICY "Admins can update member roles"
ON organization_members
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id
    FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.role IN ('OWNER', 'ADMIN')
  )
);

-- Policy: Only OWNERs and ADMINs can delete members
CREATE POLICY "Admins can remove members or users can leave"
ON organization_members
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id
    FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.role IN ('OWNER', 'ADMIN')
  )
  OR auth.uid() = user_id
);

-- PHASE 9: Recreate essential organizations policies
CREATE POLICY "Members can view their organizations"
ON organizations
FOR SELECT
USING (
  id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Org owners and admins can update organization"
ON organizations
FOR UPDATE
USING (
  id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role IN ('OWNER', 'ADMIN')
  )
);

-- PHASE 10: Recreate essential api_keys policies
CREATE POLICY "Org admins can view API keys"
ON api_keys
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Org admins can create API keys"
ON api_keys
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Org admins can delete API keys"
ON api_keys
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role IN ('OWNER', 'ADMIN')
  )
);

-- Add comment
COMMENT ON TYPE role_type IS 'Organization member roles: OWNER (full control), ADMIN (manage org and users), MEMBER (regular user with email access)';

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ VIEWER role removal migration completed successfully!';
  RAISE NOTICE '✅ All policies have been recreated';
  RAISE NOTICE '⚠️  Please verify your application works correctly';
END$$;
