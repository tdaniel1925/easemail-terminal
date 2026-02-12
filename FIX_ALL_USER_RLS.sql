-- Comprehensive RLS fix for user-facing tables
-- This ensures users can access their own data without breaking existing functionality

-- ============================================================================
-- 1. EMAIL ACCOUNTS - Users must be able to access their own email accounts
-- ============================================================================

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email accounts" ON email_accounts;
DROP POLICY IF EXISTS "Users can insert own email accounts" ON email_accounts;
DROP POLICY IF EXISTS "Users can update own email accounts" ON email_accounts;
DROP POLICY IF EXISTS "Users can delete own email accounts" ON email_accounts;

CREATE POLICY "Users can view own email accounts"
  ON email_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email accounts"
  ON email_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email accounts"
  ON email_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email accounts"
  ON email_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. ORGANIZATION MEMBERS - Users must be able to view their own memberships
-- ============================================================================

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organization_members_select" ON organization_members;
DROP POLICY IF EXISTS "organization_members_insert" ON organization_members;
DROP POLICY IF EXISTS "organization_members_update" ON organization_members;
DROP POLICY IF EXISTS "organization_members_delete" ON organization_members;

-- Users can view their own memberships OR super admins can view all
CREATE POLICY "organization_members_select"
  ON organization_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Only super admins can insert memberships
CREATE POLICY "organization_members_insert"
  ON organization_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Only super admins can update memberships
CREATE POLICY "organization_members_update"
  ON organization_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Super admins OR the user themselves can delete (for leaving org)
CREATE POLICY "organization_members_delete"
  ON organization_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- ============================================================================
-- 3. MESSAGES - Users must be able to view their own messages
-- ============================================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- 4. FOLDER MAPPINGS - Users must be able to view folders for their email accounts
-- ============================================================================

ALTER TABLE folder_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folder_mappings" ON folder_mappings;
DROP POLICY IF EXISTS "Users can insert own folder_mappings" ON folder_mappings;
DROP POLICY IF EXISTS "Users can update own folder_mappings" ON folder_mappings;
DROP POLICY IF EXISTS "Users can delete own folder_mappings" ON folder_mappings;

CREATE POLICY "Users can view own folder_mappings"
  ON folder_mappings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own folder_mappings"
  ON folder_mappings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own folder_mappings"
  ON folder_mappings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own folder_mappings"
  ON folder_mappings FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify email_accounts policies
SELECT 'EMAIL ACCOUNTS POLICIES:' as info;
SELECT policyname, cmd, qual::text as using_clause
FROM pg_policies
WHERE tablename = 'email_accounts'
ORDER BY policyname;

-- Verify organization_members policies
SELECT 'ORGANIZATION MEMBERS POLICIES:' as info;
SELECT policyname, cmd, qual::text as using_clause
FROM pg_policies
WHERE tablename = 'organization_members'
ORDER BY policyname;

-- Verify messages policies
SELECT 'MESSAGES POLICIES:' as info;
SELECT policyname, cmd, qual::text as using_clause
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- Verify folder_mappings policies
SELECT 'FOLDER MAPPINGS POLICIES:' as info;
SELECT policyname, cmd, qual::text as using_clause
FROM pg_policies
WHERE tablename = 'folder_mappings'
ORDER BY policyname;

-- Check RLS is enabled on all tables
SELECT 'RLS STATUS:' as info;
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('email_accounts', 'organization_members', 'messages', 'folder_mappings')
ORDER BY tablename;
