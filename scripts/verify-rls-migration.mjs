import pg from 'pg';

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    console.log('🔍 RLS Migration Verification Report');
    console.log('='.repeat(70));
    console.log('');

    // Check 1: system_settings RLS
    const systemSettingsRLS = await client.query(`
      SELECT relrowsecurity FROM pg_class WHERE relname = 'system_settings'
    `);
    const hasSystemRLS = systemSettingsRLS.rows[0]?.relrowsecurity;
    console.log(`1. system_settings RLS: ${hasSystemRLS ? '✅ ENABLED' : '❌ NOT ENABLED'}`);

    const systemPolicies = await client.query(`
      SELECT COUNT(*) FROM pg_policies WHERE tablename = 'system_settings'
    `);
    console.log(`   Policies: ${systemPolicies.rows[0].count}`);

    // Check 2: organization_invites
    const invitePolicies = await client.query(`
      SELECT policyname FROM pg_policies WHERE tablename = 'organization_invites' ORDER BY policyname
    `);
    console.log(`\n2. organization_invites: ${invitePolicies.rows.length} policies`);
    invitePolicies.rows.forEach(r => console.log(`   - ${r.policyname}`));
    if (invitePolicies.rows.length === 0) {
      console.log('   ❌ NO POLICIES - Invite system is BROKEN!');
    } else if (invitePolicies.rows.length < 4) {
      console.log('   ⚠️  Missing policies - Should have 4 total');
    } else {
      console.log('   ✅ Complete');
    }

    // Check 3: organization_members
    const memberPolicies = await client.query(`
      SELECT cmd, policyname FROM pg_policies WHERE tablename = 'organization_members' ORDER BY cmd, policyname
    `);
    console.log(`\n3. organization_members: ${memberPolicies.rows.length} policies`);
    memberPolicies.rows.forEach(r => console.log(`   [${r.cmd}] ${r.policyname}`));
    const memberCmds = new Set(memberPolicies.rows.map(r => r.cmd));
    console.log(`   Operations: ${Array.from(memberCmds).join(', ')}`);
    if (!memberCmds.has('INSERT')) console.log('   ❌ Missing INSERT policy');
    if (!memberCmds.has('UPDATE')) console.log('   ❌ Missing UPDATE policy');
    if (!memberCmds.has('DELETE')) console.log('   ❌ Missing DELETE policy');
    if (memberCmds.has('INSERT') && memberCmds.has('UPDATE') && memberCmds.has('DELETE')) {
      console.log('   ✅ Complete CRUD');
    }

    // Check 4: organizations
    const orgPolicies = await client.query(`
      SELECT cmd, policyname FROM pg_policies WHERE tablename = 'organizations' ORDER BY cmd, policyname
    `);
    console.log(`\n4. organizations: ${orgPolicies.rows.length} policies`);
    orgPolicies.rows.forEach(r => console.log(`   [${r.cmd}] ${r.policyname}`));
    const orgCmds = new Set(orgPolicies.rows.map(r => r.cmd));
    if (!orgCmds.has('INSERT')) console.log('   ❌ Missing INSERT policy');
    if (!orgCmds.has('DELETE')) console.log('   ❌ Missing DELETE policy (root cause of deletion bug!)');
    if (orgCmds.has('INSERT') && orgCmds.has('DELETE')) {
      console.log('   ✅ INSERT & DELETE added');
    }

    // Check 5: signature_templates RLS
    const templatesRLS = await client.query(`
      SELECT relrowsecurity FROM pg_class WHERE relname = 'signature_templates'
    `);
    const hasTemplatesRLS = templatesRLS.rows[0]?.relrowsecurity;
    console.log(`\n5. signature_templates RLS: ${hasTemplatesRLS ? '✅ ENABLED' : '❌ NOT ENABLED'}`);

    const templatePolicies = await client.query(`
      SELECT COUNT(*) FROM pg_policies WHERE tablename = 'signature_templates'
    `);
    console.log(`   Policies: ${templatePolicies.rows[0].count}`);

    // Check 6: bulk_user_imports RLS
    const importsRLS = await client.query(`
      SELECT relrowsecurity FROM pg_class WHERE relname = 'bulk_user_imports'
    `);
    const hasImportsRLS = importsRLS.rows[0]?.relrowsecurity;
    console.log(`\n6. bulk_user_imports RLS: ${hasImportsRLS ? '✅ ENABLED' : '❌ NOT ENABLED'}`);

    const importPolicies = await client.query(`
      SELECT COUNT(*) FROM pg_policies WHERE tablename = 'bulk_user_imports'
    `);
    console.log(`   Policies: ${importPolicies.rows[0].count}`);

    // Check 7: revenue_history
    const revenueExists = await client.query(`
      SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'revenue_history')
    `);
    console.log(`\n7. revenue_history table: ${revenueExists.rows[0].exists ? '✅ EXISTS' : '❌ DOES NOT EXIST'}`);

    if (revenueExists.rows[0].exists) {
      const revenuePolicies = await client.query(`
        SELECT policyname FROM pg_policies WHERE tablename = 'revenue_history'
      `);
      console.log(`   Policies: ${revenuePolicies.rows.length}`);
    } else {
      console.log('   ⚠️  Table needs to be created first');
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));

    const issuesFixed = [];
    const issuesRemaining = [];

    if (hasSystemRLS) issuesFixed.push('system_settings RLS');
    else issuesRemaining.push('system_settings RLS');

    if (invitePolicies.rows.length >= 4) issuesFixed.push('organization_invites policies');
    else issuesRemaining.push('organization_invites policies');

    if (memberCmds.has('INSERT') && memberCmds.has('UPDATE') && memberCmds.has('DELETE')) {
      issuesFixed.push('organization_members CRUD');
    } else {
      issuesRemaining.push('organization_members CRUD');
    }

    if (orgCmds.has('INSERT') && orgCmds.has('DELETE')) {
      issuesFixed.push('organizations INSERT/DELETE');
    } else {
      issuesRemaining.push('organizations INSERT/DELETE');
    }

    if (hasTemplatesRLS) issuesFixed.push('signature_templates RLS');
    else issuesRemaining.push('signature_templates RLS');

    if (hasImportsRLS) issuesFixed.push('bulk_user_imports RLS');
    else issuesRemaining.push('bulk_user_imports RLS');

    console.log(`\n✅ Fixed (${issuesFixed.length}/7):`);
    issuesFixed.forEach(issue => console.log(`   - ${issue}`));

    if (issuesRemaining.length > 0) {
      console.log(`\n❌ Still needs fixing (${issuesRemaining.length}/7):`);
      issuesRemaining.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log(`\n⚠️  revenue_history: Table doesn't exist yet (separate issue)`);

    console.log('\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
