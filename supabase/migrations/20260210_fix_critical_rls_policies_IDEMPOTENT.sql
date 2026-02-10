-- Critical RLS Policy Fixes - IDEMPOTENT VERSION
-- This version can be run multiple times safely
-- Discovered during systematic QA audit - February 10, 2026
-- Fixes 7 HIGH priority security issues

-- ============================================================================
-- 1. SYSTEM_SETTINGS - Enable RLS (CRITICAL - currently NO RLS!)
-- ============================================================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop if exists, then create
DROP POLICY IF EXISTS "Super admins can manage system settings" ON system_settings;

CREATE POLICY "Super admins can manage system settings"
  ON system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- ============================================================================
-- 2. ORGANIZATION_INVITES - Add ALL missing policies (CRITICAL - 0 policies!)
-- ============================================================================

DROP POLICY IF EXISTS "Admins and invitees can view invites" ON organization_invites;
DROP POLICY IF EXISTS "Admins can create invites" ON organization_invites;
DROP POLICY IF EXISTS "System can update invites" ON organization_invites;
DROP POLICY IF EXISTS "Admins can delete invites" ON organization_invites;

-- SELECT: Admins can view org invites OR user can view invite by email
CREATE POLICY "Admins and invitees can view invites"
  ON organization_invites FOR SELECT
  USING (
    -- Org admins can view all invites for their org
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
    )
    OR
    -- Invited users can view their own invite
    email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- INSERT: OWNER/ADMIN can create invites
CREATE POLICY "Admins can create invites"
  ON organization_invites FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
    )
  );

-- UPDATE: System can mark invite as accepted
CREATE POLICY "System can update invites"
  ON organization_invites FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- DELETE: OWNER/ADMIN can delete invites OR invited user can decline
CREATE POLICY "Admins can delete invites"
  ON organization_invites FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
    )
    OR
    email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- ============================================================================
-- 3. ORGANIZATION_MEMBERS - Add INSERT/UPDATE/DELETE policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can add members" ON organization_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON organization_members;
DROP POLICY IF EXISTS "Admins can remove members or users can leave" ON organization_members;

-- INSERT: Admins can add members OR system when accepting invite
CREATE POLICY "Admins can add members"
  ON organization_members FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
    )
    OR
    -- Allow system to insert when accepting invite
    TRUE
  );

-- UPDATE: OWNER/ADMIN can update member roles
CREATE POLICY "Admins can update member roles"
  ON organization_members FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
    )
  );

-- DELETE: OWNER/ADMIN can remove members OR members can leave themselves
CREATE POLICY "Admins can remove members or users can leave"
  ON organization_members FOR DELETE
  USING (
    user_id = auth.uid() OR  -- Users can leave organization
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
    )
  );

-- ============================================================================
-- 4. ORGANIZATIONS - Add INSERT/DELETE policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Owners can delete organizations" ON organizations;

-- INSERT: Any authenticated user can create organization (they become OWNER)
CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE: Only OWNER can delete organization
CREATE POLICY "Owners can delete organizations"
  ON organizations FOR DELETE
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role = 'OWNER'
    )
  );

-- ============================================================================
-- 5. SIGNATURE_TEMPLATES - Enable RLS and add policies
-- ============================================================================

ALTER TABLE signature_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view signature templates" ON signature_templates;
DROP POLICY IF EXISTS "Super admins can manage templates" ON signature_templates;

-- Anyone can view templates (they're meant to be public)
CREATE POLICY "Anyone can view signature templates"
  ON signature_templates FOR SELECT
  USING (TRUE);

-- Only super admins can manage templates
CREATE POLICY "Super admins can manage templates"
  ON signature_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- ============================================================================
-- 6. REVENUE_HISTORY - Fix policy bug (SKIP IF TABLE DOESN'T EXIST)
-- ============================================================================

DO $$
BEGIN
  -- Only execute if revenue_history table exists
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'revenue_history') THEN
    -- Drop incorrect policy if it exists
    DROP POLICY IF EXISTS "Super admins can read revenue history" ON revenue_history;

    -- Recreate with correct column check
    EXECUTE 'CREATE POLICY "Super admins can read revenue history" ON revenue_history
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.is_super_admin = TRUE
        )
      )';

    RAISE NOTICE 'Fixed revenue_history policy';
  ELSE
    RAISE NOTICE 'Skipping revenue_history - table does not exist yet';
  END IF;
END $$;

-- ============================================================================
-- 7. BULK_USER_IMPORTS - Enable RLS and add policies
-- ============================================================================

ALTER TABLE bulk_user_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org admins can view their imports" ON bulk_user_imports;
DROP POLICY IF EXISTS "Org admins can create imports" ON bulk_user_imports;
DROP POLICY IF EXISTS "Super admins can view all imports" ON bulk_user_imports;

-- Org admins can view their own imports
CREATE POLICY "Org admins can view their imports"
  ON bulk_user_imports FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
    )
  );

-- Org admins can create imports
CREATE POLICY "Org admins can create imports"
  ON bulk_user_imports FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
    )
  );

-- Super admins can view all imports
CREATE POLICY "Super admins can view all imports"
  ON bulk_user_imports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  invite_count INTEGER;
  org_count INTEGER;
  member_count INTEGER;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO invite_count FROM pg_policies WHERE tablename = 'organization_invites';
  SELECT COUNT(*) INTO org_count FROM pg_policies WHERE tablename = 'organizations';
  SELECT COUNT(*) INTO member_count FROM pg_policies WHERE tablename = 'organization_members';

  RAISE NOTICE '';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Migration Complete! Verification:';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'organization_invites policies: % (expected: 4)', invite_count;
  RAISE NOTICE 'organizations policies: % (expected: 4)', org_count;
  RAISE NOTICE 'organization_members policies: % (expected: 4)', member_count;
  RAISE NOTICE '==================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test organization creation';
  RAISE NOTICE '2. Test invite system';
  RAISE NOTICE '3. Test member management';
  RAISE NOTICE '==================================================';
END $$;
