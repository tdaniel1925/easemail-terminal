import { config } from 'dotenv';
import fetch from 'node-fetch';

config({ path: '.env.local' });

const RECIPIENT_EMAIL = 'tdaniel@botmakers.ai';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://easemail.app';

const emailSamples = [
  {
    name: 'Welcome Email (New User)',
    endpoint: '/api/emails/welcome',
    data: {
      to: RECIPIENT_EMAIL,
      userName: 'Daniel Thompson',
      userEmail: RECIPIENT_EMAIL
    }
  },
  {
    name: 'Super Admin Welcome Email',
    endpoint: '/api/emails/super-admin-welcome',
    data: {
      to: RECIPIENT_EMAIL,
      userName: 'Daniel Thompson',
      userEmail: RECIPIENT_EMAIL
    }
  },
  {
    name: 'Organization Owner Welcome Email',
    endpoint: '/api/emails/org-owner-welcome',
    data: {
      to: RECIPIENT_EMAIL,
      userName: 'Daniel Thompson',
      userEmail: RECIPIENT_EMAIL,
      organizationName: 'BotMakers Inc',
      organizationId: 'sample-org-id-12345',
      plan: 'PRO',
      seats: 10,
      temporaryPassword: 'SamplePass123!'
    }
  },
  {
    name: 'Organization Admin Welcome Email',
    endpoint: '/api/emails/org-role-welcome',
    data: {
      to: RECIPIENT_EMAIL,
      userName: 'Daniel Thompson',
      userEmail: RECIPIENT_EMAIL,
      role: 'ADMIN',
      organizationName: 'BotMakers Inc',
      organizationId: 'sample-org-id-12345',
      inviterName: 'John Smith',
      temporaryPassword: 'SamplePass123!'
    }
  },
  {
    name: 'Organization Member Welcome Email',
    endpoint: '/api/emails/org-role-welcome',
    data: {
      to: RECIPIENT_EMAIL,
      userName: 'Daniel Thompson',
      userEmail: RECIPIENT_EMAIL,
      role: 'MEMBER',
      organizationName: 'BotMakers Inc',
      organizationId: 'sample-org-id-12345',
      inviterName: 'John Smith',
      temporaryPassword: 'SamplePass123!'
    }
  },
  {
    name: 'Organization Invitation Email',
    endpoint: '/api/emails/organization-invite',
    data: {
      inviteeName: 'Daniel Thompson',
      inviteeEmail: RECIPIENT_EMAIL,
      inviterName: 'John Smith',
      organizationName: 'BotMakers Inc',
      role: 'ADMIN',
      inviteLink: `${BASE_URL}/invite/sample-token-abc123`
    }
  },
  {
    name: 'Billing Setup Email',
    endpoint: '/api/emails/billing-setup',
    data: {
      userName: 'Daniel Thompson',
      userEmail: RECIPIENT_EMAIL,
      organizationName: 'BotMakers Inc',
      organizationId: 'sample-org-id-12345',
      plan: 'PRO',
      seats: 10
    }
  }
];

async function sendSampleEmails() {
  console.log('📧 Sending sample emails to:', RECIPIENT_EMAIL);
  console.log('Base URL:', BASE_URL);
  console.log('='.repeat(60));
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const sample of emailSamples) {
    console.log(`📨 Sending: ${sample.name}`);
    console.log(`   Endpoint: ${sample.endpoint}`);

    try {
      const response = await fetch(`${BASE_URL}${sample.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sample.data)
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`   ✅ SUCCESS - ${result.message || 'Email sent'}`);
        successCount++;
      } else {
        console.log(`   ❌ FAILED - ${result.error || 'Unknown error'}`);
        failCount++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      failCount++;
    }

    console.log('');

    // Add delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📧 Total: ${emailSamples.length}`);
  console.log(`\n✉️  All sample emails sent to: ${RECIPIENT_EMAIL}`);
}

sendSampleEmails().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
