import { Resend } from 'resend';

const resend = new Resend('re_7G9uj8Ze_HdHTK4KZPsenzuHcyk1dJ1aA');

async function checkResendStatus() {
  console.log('🔍 Checking Resend API status...\n');

  try {
    // Send a simple test email and capture the response
    console.log('📧 Sending test email to tdaniel@botmakers.ai...');

    const result = await resend.emails.send({
      from: 'EaseMail <onboarding@resend.dev>',
      to: 'tdaniel@botmakers.ai',
      subject: '[TEST] Simple Test Email from EaseMail',
      html: '<h1>Test Email</h1><p>If you receive this, emails are working correctly.</p><p>Timestamp: ' + new Date().toISOString() + '</p>',
    });

    console.log('\n✅ Email sent successfully!');
    console.log('📋 Response from Resend:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n💡 Email ID:', result.data?.id);
    console.log('💡 This ID can be used to check delivery status in Resend dashboard');
    console.log('💡 Dashboard: https://resend.com/emails');

    console.log('\n📬 Please check:');
    console.log('   1. Your inbox at tdaniel@botmakers.ai');
    console.log('   2. Your spam/junk folder');
    console.log('   3. Resend dashboard for delivery status');

  } catch (error) {
    console.error('❌ Error sending email:');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);

    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }

    if (error.message.includes('API key')) {
      console.error('\n⚠️  API Key issue detected');
      console.error('Please verify RESEND_API_KEY is correct');
    }

    if (error.message.includes('domain')) {
      console.error('\n⚠️  Domain verification issue');
      console.error('The sending domain may not be verified');
    }
  }
}

checkResendStatus();
