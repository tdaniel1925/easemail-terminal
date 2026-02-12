-- Add Missing RLS Policies for Organizations and Related Tables
-- This migration adds the RLS policies that were dropped during the VIEWER role migration
-- but not restored in the comprehensive fix

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;
DROP POLICY IF EXISTS "organizations_update" ON organizations;
DROP POLICY IF EXISTS "organizations_delete" ON organizations;

DROP POLICY IF EXISTS "organization_members_select" ON organization_members;
DROP POLICY IF EXISTS "organization_members_insert" ON organization_members;
DROP POLICY IF EXISTS "organization_members_update" ON organization_members;
DROP POLICY IF EXISTS "organization_members_delete" ON organization_members;

-- Organizations table RLS policies
CREATE POLICY "organizations_select"
  ON organizations FOR SELECT
  USING (
    -- Super admins can see all organizations
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
    OR
    -- Organization members can see their organization
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "organizations_insert"
  ON organizations FOR INSERT
  WITH CHECK (
    -- Only super admins can create organizations
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "organizations_update"
  ON organizations FOR UPDATE
  USING (
    -- Super admins can update any organization
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
    OR
    -- Organization OWNER and ADMIN can update their organization
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "organizations_delete"
  ON organizations FOR DELETE
  USING (
    -- Only super admins can delete organizations
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Organization Members table RLS policies
CREATE POLICY "organization_members_select"
  ON organization_members FOR SELECT
  USING (
    -- Super admins can see all members
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
    OR
    -- Members can see other members in their organization
    EXISTS (
      SELECT 1 FROM organization_members om2
      WHERE om2.organization_id = organization_members.organization_id
      AND om2.user_id = auth.uid()
    )
  );

CREATE POLICY "organization_members_insert"
  ON organization_members FOR INSERT
  WITH CHECK (
    -- Super admins can add members to any organization
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
    OR
    -- Organization OWNER and ADMIN can add members to their organization
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_members.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "organization_members_update"
  ON organization_members FOR UPDATE
  USING (
    -- Super admins can update any member
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
    OR
    -- Organization OWNER and ADMIN can update members in their organization
    EXISTS (
      SELECT 1 FROM organization_members om2
      WHERE om2.organization_id = organization_members.organization_id
      AND om2.user_id = auth.uid()
      AND om2.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "organization_members_delete"
  ON organization_members FOR DELETE
  USING (
    -- Super admins can remove any member
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
    OR
    -- Organization OWNER and ADMIN can remove members from their organization
    EXISTS (
      SELECT 1 FROM organization_members om2
      WHERE om2.organization_id = organization_members.organization_id
      AND om2.user_id = auth.uid()
      AND om2.role IN ('OWNER', 'ADMIN')
    )
  );

-- Verification queries
SELECT 'RLS Policies Created for organizations:' as message;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

SELECT 'RLS Policies Created for organization_members:' as message;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'organization_members'
ORDER BY policyname;
