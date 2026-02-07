const TEST_EMAIL = 'tdaniel@botmakers.ai'; // Change this to your email for testing
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'; // Use local dev server first

async function testSuperAdminWelcomeEmail() {
  console.log('\n🧪 Test 1: Super Admin Welcome Email');
  console.log('=====================================');

  try {
    const response = await fetch(`${BASE_URL}/api/emails/super-admin-welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: 'Test Super Admin',
        userEmail: TEST_EMAIL,
      }),
    });

    console.log('   Status:', response.status, response.statusText);

    const text = await response.text();
    console.log('   Response:', text.substring(0, 200));

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ Super Admin welcome email sent successfully!');
      console.log('   Email ID:', data.emailId);
    } else {
      console.error('❌ Failed to send super admin email');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testOrgOwnerWelcomeEmail() {
  console.log('\n🧪 Test 2: Org Owner Welcome Email');
  console.log('===================================');

  try {
    const response = await fetch(`${BASE_URL}/api/emails/org-owner-welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: 'Test Owner',
        userEmail: TEST_EMAIL,
        organizationName: 'Test Organization Inc',
        organizationId: 'test-org-123',
        plan: 'PRO',
        seats: 10,
      }),
    });

    console.log('   Status:', response.status, response.statusText);

    const text = await response.text();
    console.log('   Response:', text.substring(0, 200));

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ Org Owner welcome email sent successfully!');
      console.log('   Email ID:', data.emailId);
    } else {
      console.error('❌ Failed to send org owner email');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testOrgAdminWelcomeEmail() {
  console.log('\n🧪 Test 3: Org Admin Welcome Email');
  console.log('===================================');

  try {
    const response = await fetch(`${BASE_URL}/api/emails/org-role-welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: 'Test Admin',
        userEmail: TEST_EMAIL,
        organizationName: 'Test Organization Inc',
        organizationId: 'test-org-123',
        inviterName: 'John Smith',
        role: 'ADMIN',
      }),
    });

    console.log('   Status:', response.status, response.statusText);

    const text = await response.text();
    console.log('   Response:', text.substring(0, 200));

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ Org Admin welcome email sent successfully!');
      console.log('   Email ID:', data.emailId);
    } else {
      console.error('❌ Failed to send org admin email');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testOrgMemberWelcomeEmail() {
  console.log('\n🧪 Test 4: Org Member Welcome Email');
  console.log('====================================');

  try {
    const response = await fetch(`${BASE_URL}/api/emails/org-role-welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: 'Test Member',
        userEmail: TEST_EMAIL,
        organizationName: 'Test Organization Inc',
        organizationId: 'test-org-123',
        inviterName: 'John Smith',
        role: 'MEMBER',
      }),
    });

    console.log('   Status:', response.status, response.statusText);

    const text = await response.text();
    console.log('   Response:', text.substring(0, 200));

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ Org Member welcome email sent successfully!');
      console.log('   Email ID:', data.emailId);
    } else {
      console.error('❌ Failed to send org member email');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function runAllTests() {
  console.log('\n🚀 Testing All Welcome Emails');
  console.log('==============================');
  console.log(`Sending all test emails to: ${TEST_EMAIL}`);
  console.log(`Using base URL: ${BASE_URL}`);
  console.log('\nPlease check your inbox after the tests complete.\n');

  await testSuperAdminWelcomeEmail();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between emails

  await testOrgOwnerWelcomeEmail();
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testOrgAdminWelcomeEmail();
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testOrgMemberWelcomeEmail();

  console.log('\n✨ All tests completed!');
  console.log('====================================');
  console.log(`📧 Check ${TEST_EMAIL} for 4 welcome emails:`);
  console.log('   1. Super Admin Welcome Email');
  console.log('   2. Org Owner Welcome Email');
  console.log('   3. Org Admin Welcome Email');
  console.log('   4. Org Member Welcome Email');
  console.log('\n📝 Verify:');
  console.log('   - All emails arrived');
  console.log('   - HTML renders correctly');
  console.log('   - Links work properly');
  console.log('   - Content is appropriate for each role');
}

// Run all tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
