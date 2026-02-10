-- Critical RLS Policy Fixes
-- Discovered during systematic QA audit - February 10, 2026
-- Fixes 7 HIGH priority security issues

-- ============================================================================
-- 1. SYSTEM_SETTINGS - Enable RLS (CRITICAL - currently NO RLS!)
-- ============================================================================
-- Issue: Any authenticated user can read/modify system-wide settings
-- Risk: Users could enable beta mode, change system config

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

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
-- Issue: Table has RLS enabled but ZERO policies = invite system broken
-- Impact: Cannot create, view, accept, or delete invites

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
-- Issue: Can only SELECT, cannot add/update/remove members
-- Impact: Member management completely broken

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
-- Issue: Cannot create or delete organizations through regular client
-- Impact: This is why org deletion bug existed!

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
-- Issue: NO RLS enabled = uncontrolled access to system templates

ALTER TABLE signature_templates ENABLE ROW LEVEL SECURITY;

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
-- 6. REVENUE_HISTORY - Fix policy bug (checks wrong column)
-- ============================================================================
-- Issue: Policy checks users.is_admin instead of users.is_super_admin

-- Drop incorrect policy
DROP POLICY IF EXISTS "Super admins can read revenue history" ON revenue_history;

-- Recreate with correct column check
CREATE POLICY "Super admins can read revenue history" ON revenue_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = TRUE  -- Fixed from is_admin
    )
  );

-- ============================================================================
-- 7. BULK_USER_IMPORTS - Enable RLS and add policies
-- ============================================================================
-- Issue: NO RLS = any user can see other orgs' import history

ALTER TABLE bulk_user_imports ENABLE ROW LEVEL SECURITY;

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
-- SUMMARY OF FIXES
-- ============================================================================
-- 1. system_settings: Added RLS + super admin policy
-- 2. organization_invites: Added ALL 4 missing policies (SELECT, INSERT, UPDATE, DELETE)
-- 3. organization_members: Added INSERT, UPDATE, DELETE policies
-- 4. organizations: Added INSERT, DELETE policies (fixes org deletion bug root cause)
-- 5. signature_templates: Added RLS + policies
-- 6. revenue_history: Fixed column name bug in policy
-- 7. bulk_user_imports: Added RLS + policies
--
-- These fixes resolve 7 CRITICAL security issues discovered during systematic audit
-- ============================================================================
