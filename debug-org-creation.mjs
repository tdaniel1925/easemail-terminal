// Debug Organization Creation
// This script directly calls the production API to see the actual error

const API_URL = 'https://easemail.app/api/admin/organizations/create';

// You'll need to get a real session cookie from your browser
// 1. Login to https://easemail.app as tdaniel@botmakers.ai
// 2. Open DevTools > Application > Cookies > easemail.app
// 3. Copy all cookies and paste them here
const COOKIES = process.env.TEST_COOKIES || 'REPLACE_WITH_YOUR_SESSION_COOKIES';

async function testOrgCreation() {
  console.log('Testing organization creation API...\n');

  const testData = {
    name: `Debug Test Org ${Date.now()}`,
    plan: 'PRO',
    seats: '10',
    billing_email: 'tdaniel@botmakers.ai'
  };

  console.log('Request Data:', JSON.stringify(testData, null, 2));
  console.log('\nCalling API:', API_URL);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': COOKIES
      },
      body: JSON.stringify(testData)
    });

    console.log('\n📊 Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('\n📄 Response Body:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS: Organization created successfully!');
      console.log('Organization ID:', data.organization?.id);
    } else {
      console.log('\n❌ FAILED: Organization creation failed');
      console.log('Error:', data.error);

      if (response.status === 401) {
        console.log('\n💡 Hint: You need to set TEST_COOKIES environment variable');
        console.log('   1. Login to https://easemail.app');
        console.log('   2. Open DevTools > Application > Cookies');
        console.log('   3. Copy all cookie values');
        console.log('   4. Run: $env:TEST_COOKIES="your-cookies-here"');
      } else if (response.status === 403) {
        console.log('\n💡 Hint: User is not a super admin');
        console.log('   Check: is_super_admin = true for tdaniel@botmakers.ai');
      } else if (response.status === 500) {
        console.log('\n💡 Hint: Database error (likely RLS policies or missing columns)');
        console.log('   Check Supabase logs for the actual database error');
      }
    }

  } catch (error) {
    console.error('\n💥 Network Error:', error.message);
    console.error('Full error:', error);
  }
}

testOrgCreation();
