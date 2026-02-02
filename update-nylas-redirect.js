// Update Nylas Application Redirect URIs
// This script adds the production URL to your Nylas application

const https = require('https');

const NYLAS_API_KEY = process.env.NYLAS_API_KEY || 'nyk_v0_c0P6OkW7khVJ6Fqa5Xr4vI50l8FO8oa24JGMDTW7R0eGmeT2njwBXWjunSMry97X';
const CLIENT_ID = 'd0f1e28f-0275-4a89-8685-164140d6de9a';

const redirectUris = [
  'http://localhost:3001/api/oauth/callback',
  'https://easemail-terminal.vercel.app/api/oauth/callback'
];

console.log('🔄 Updating Nylas Application Redirect URIs...\n');
console.log('Client ID:', CLIENT_ID);
console.log('Redirect URIs to add:');
redirectUris.forEach(uri => console.log('  -', uri));
console.log('\n');

// Note: The Nylas v3 API requires application updates to be done via dashboard
// This is because application settings are sensitive and require admin access

console.log('⚠️  IMPORTANT:');
console.log('Redirect URIs must be updated via the Nylas Dashboard:');
console.log('1. Go to: https://dashboard.us.nylas.com/');
console.log('2. Navigate to Applications');
console.log('3. Select your application:', CLIENT_ID);
console.log('4. Add the production redirect URI:');
console.log('   https://easemail-terminal.vercel.app/api/oauth/callback');
console.log('\n✅ After adding, test your OAuth flow again!\n');
