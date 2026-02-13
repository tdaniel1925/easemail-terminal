#!/usr/bin/env node

import Nylas from 'nylas';
import { config } from 'dotenv';

config({ path: '.env.local' });

const DAVID_GRANT_ID = 'e0369e93-69dc-469f-8204-c2f400377c9c';

const nylasClient = new Nylas({
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
});

async function checkGrant() {
  console.log('🔍 Checking David\'s Nylas grant status...\n');

  try {
    // Try to get grant details
    const grant = await nylasClient.auth.grants.find({
      grantId: DAVID_GRANT_ID,
    });

    console.log('✅ Grant found:');
    console.log(JSON.stringify(grant, null, 2));

  } catch (error) {
    console.error('❌ Grant error:', error.message);
    console.log('\nFull error:', error);
  }

  // Try a simple API call
  console.log('\n🧪 Testing API access...');
  try {
    const response = await nylasClient.messages.list({
      identifier: DAVID_GRANT_ID,
      queryParams: { limit: 1 },
    });

    console.log('✅ API access working! Found', response.data?.length || 0, 'messages');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\nThis means David needs to reconnect his Microsoft account.');
    console.log('The grant may have expired or lost permissions.');
  }
}

checkGrant();
