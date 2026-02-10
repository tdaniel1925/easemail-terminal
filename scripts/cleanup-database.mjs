import pg from 'pg';
const { Client } = pg;

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function cleanupDatabase() {
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Find the super admin user
    const superAdminEmail = 'tdaniel@botmakers.ai';
    const { rows: superAdminRows } = await client.query(
      'SELECT id, email, is_super_admin FROM users WHERE email = $1',
      [superAdminEmail]
    );

    if (superAdminRows.length === 0) {
      console.error(`❌ Super admin user ${superAdminEmail} not found!`);
      process.exit(1);
    }

    const superAdminId = superAdminRows[0].id;
    console.log(`✅ Found super admin: ${superAdminEmail} (ID: ${superAdminId})`);
    console.log(`   Is super admin: ${superAdminRows[0].is_super_admin}\n`);

    // Get counts before deletion
    const { rows: userCount } = await client.query('SELECT COUNT(*) FROM users');
    const { rows: orgCount } = await client.query('SELECT COUNT(*) FROM organizations');
    const { rows: memberCount } = await client.query('SELECT COUNT(*) FROM organization_members');
    const { rows: inviteCount } = await client.query('SELECT COUNT(*) FROM organization_invites');

    console.log('📊 Current database state:');
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Organizations: ${orgCount[0].count}`);
    console.log(`   Organization Members: ${memberCount[0].count}`);
    console.log(`   Organization Invites: ${inviteCount[0].count}\n`);

    // Confirm deletion
    console.log('⚠️  WARNING: This will delete:');
    console.log(`   - ${parseInt(userCount[0].count) - 1} users (keeping ${superAdminEmail})`);
    console.log(`   - ${orgCount[0].count} organizations`);
    console.log(`   - ${memberCount[0].count} organization memberships`);
    console.log(`   - ${inviteCount[0].count} organization invitations\n`);

    console.log('🗑️  Starting cleanup...\n');

    // Delete in order to respect foreign key constraints

    // 1. Delete organization invites
    console.log('1️⃣  Deleting organization invitations...');
    const { rowCount: deletedInvites } = await client.query('DELETE FROM organization_invites');
    console.log(`   ✅ Deleted ${deletedInvites} invitations\n`);

    // 2. Delete organization members
    console.log('2️⃣  Deleting organization members...');
    const { rowCount: deletedMembers } = await client.query('DELETE FROM organization_members');
    console.log(`   ✅ Deleted ${deletedMembers} memberships\n`);

    // 3. Delete all organizations
    console.log('3️⃣  Deleting all organizations...');
    const { rowCount: deletedOrgs } = await client.query('DELETE FROM organizations');
    console.log(`   ✅ Deleted ${deletedOrgs} organizations\n`);

    // 4. Delete related user data (skip tables that might not exist)
    console.log('4️⃣  Deleting related user data...');

    try {
      const { rowCount: deletedTokens } = await client.query(
        'DELETE FROM msgraph_tokens WHERE user_id != $1',
        [superAdminId]
      );
      console.log(`   ✅ Deleted ${deletedTokens} MS Graph tokens`);
    } catch (error) {
      console.log(`   ⚠️  Skipped msgraph_tokens: ${error.message}`);
    }

    try {
      const { rowCount: deletedProfiles } = await client.query(
        'DELETE FROM profiles WHERE id != $1',
        [superAdminId]
      );
      console.log(`   ✅ Deleted ${deletedProfiles} profiles`);
    } catch (error) {
      console.log(`   ⚠️  Skipped profiles: ${error.message}`);
    }

    // Delete from auth.users (Supabase auth table)
    try {
      const { rowCount: deletedAuthUsers } = await client.query(
        'DELETE FROM auth.users WHERE id != $1',
        [superAdminId]
      );
      console.log(`   ✅ Deleted ${deletedAuthUsers} auth users\n`);
    } catch (error) {
      console.log(`   ⚠️  Skipped auth.users: ${error.message}\n`);
    }

    // 5. Delete all users except super admin
    console.log('5️⃣  Deleting all users except super admin...');
    const { rowCount: deletedUsers } = await client.query(
      'DELETE FROM users WHERE id != $1',
      [superAdminId]
    );
    console.log(`   ✅ Deleted ${deletedUsers} users\n`);

    // Verify final state
    const { rows: finalUserCount } = await client.query('SELECT COUNT(*) FROM users');
    const { rows: finalOrgCount } = await client.query('SELECT COUNT(*) FROM organizations');
    const { rows: finalMemberCount } = await client.query('SELECT COUNT(*) FROM organization_members');
    const { rows: finalInviteCount } = await client.query('SELECT COUNT(*) FROM organization_invites');

    console.log('✅ Cleanup complete!\n');
    console.log('📊 Final database state:');
    console.log(`   Users: ${finalUserCount[0].count} (should be 1)`);
    console.log(`   Organizations: ${finalOrgCount[0].count} (should be 0)`);
    console.log(`   Organization Members: ${finalMemberCount[0].count} (should be 0)`);
    console.log(`   Organization Invites: ${finalInviteCount[0].count} (should be 0)\n`);

    // Verify super admin is still there
    const { rows: verifyAdmin } = await client.query(
      'SELECT email, is_super_admin FROM users WHERE id = $1',
      [superAdminId]
    );

    if (verifyAdmin.length > 0) {
      console.log('✅ Super admin verified:');
      console.log(`   Email: ${verifyAdmin[0].email}`);
      console.log(`   Is super admin: ${verifyAdmin[0].is_super_admin}\n`);
    } else {
      console.error('❌ Super admin user was deleted! Something went wrong!');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

cleanupDatabase();
