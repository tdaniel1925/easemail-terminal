import { config } from 'dotenv';
import { ConfidentialClientApplication } from '@azure/msal-node';

config({ path: '.env.local' });

console.log('🔍 Testing MS Teams / Azure AD Configuration\n');

// Check environment variables
const requiredVars = {
  'AZURE_CLIENT_ID': process.env.AZURE_CLIENT_ID,
  'AZURE_TENANT_ID': process.env.AZURE_TENANT_ID,
  'AZURE_CLIENT_SECRET': process.env.AZURE_CLIENT_SECRET,
  'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
};

console.log('1. Environment Variables:');
let allVarsSet = true;
for (const [key, value] of Object.entries(requiredVars)) {
  const status = value ? '✅' : '❌';
  console.log(`   ${status} ${key}: ${value ? '***' + value.slice(-4) : 'NOT SET'}`);
  if (!value) allVarsSet = false;
}

if (!allVarsSet) {
  console.error('\n❌ Missing required environment variables!');
  process.exit(1);
}

console.log('\n2. Expected Redirect URI:');
const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/teams/callback`;
console.log(`   ${redirectUri}`);
console.log('\n   ⚠️  This MUST be configured in Azure AD Portal:');
console.log('   → Go to: https://portal.azure.com/');
console.log('   → Azure Active Directory → App registrations');
console.log(`   → Find your app (Client ID: ${process.env.AZURE_CLIENT_ID})`);
console.log('   → Authentication → Add Platform → Web');
console.log(`   → Add Redirect URI: ${redirectUri}`);

console.log('\n3. Testing MSAL Client Initialization:');
try {
  const msalConfig = {
    auth: {
      clientId: process.env.AZURE_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
    },
  };

  const client = new ConfidentialClientApplication(msalConfig);
  console.log('   ✅ MSAL Client initialized successfully');

  // Generate auth URL
  const authUrl = await client.getAuthCodeUrl({
    scopes: [
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/OnlineMeetings.ReadWrite',
      'https://graph.microsoft.com/User.Read',
      'offline_access',
    ],
    redirectUri,
    state: Buffer.from(JSON.stringify({ userId: 'test-user-id' })).toString('base64'),
  });

  console.log('\n4. Generated Auth URL:');
  console.log(`   ${authUrl.substring(0, 100)}...`);
  console.log('   ✅ Auth URL generated successfully');

  console.log('\n✅ Configuration looks good!');
  console.log('\n5. Next Steps:');
  console.log('   1. Verify redirect URI is configured in Azure AD Portal');
  console.log('   2. Ensure API permissions are granted:');
  console.log('      - Calendars.ReadWrite (Delegated)');
  console.log('      - OnlineMeetings.ReadWrite (Delegated)');
  console.log('      - User.Read (Delegated)');
  console.log('      - offline_access (Delegated)');
  console.log('   3. Click "Grant admin consent" in Azure AD');
  console.log('   4. Try connecting MS Teams in the app');
  console.log('\n📝 If you see errors, check browser console and server logs');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
