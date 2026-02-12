-- Drop OLD policies by their actual names
DROP POLICY IF EXISTS "Admins can add members" ON organization_members;
DROP POLICY IF EXISTS "Admins can remove members or users can leave" ON organization_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON organization_members;
DROP POLICY IF EXISTS "Members can view organization members" ON organization_members;

-- Also drop any other old organization policies
DROP POLICY IF EXISTS "Super admins can create organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins and members can view organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins and admins can update organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins can delete organizations" ON organizations;

-- Verify only the new policies remain
SELECT 'Organization policies (should be 4):' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'organizations' ORDER BY policyname;

SELECT 'Organization Members policies (should be 4):' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'organization_members' ORDER BY policyname;
