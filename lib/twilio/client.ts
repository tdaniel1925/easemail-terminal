import twilio from 'twilio';

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;

export async function sendSMS(to: string, body: string) {
  try {
    const message = await twilioClient.messages.create({
      body,
      from: twilioPhoneNumber,
      to,
    });

    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
}

export async function getSMSMessages(limit: number = 50) {
  try {
    const messages = await twilioClient.messages.list({
      limit,
    });

    return messages.map((msg) => ({
      sid: msg.sid,
      from: msg.from,
      to: msg.to,
      body: msg.body,
      status: msg.status,
      direction: msg.direction,
      dateCreated: msg.dateCreated,
      dateSent: msg.dateSent,
    }));
  } catch (error: any) {
    console.error('SMS fetch error:', error);
    return [];
  }
}

export async function setupSMSWebhook(webhookUrl: string) {
  try {
    // Configure incoming message webhook
    const phoneNumbers = await twilioClient.incomingPhoneNumbers.list();

    if (phoneNumbers.length > 0) {
      await twilioClient
        .incomingPhoneNumbers(phoneNumbers[0].sid)
        .update({
          smsUrl: webhookUrl,
          smsMethod: 'POST',
        });

      return { success: true };
    }

    return { success: false, error: 'No phone number found' };
  } catch (error: any) {
    console.error('Webhook setup error:', error);
    return { success: false, error: error.message };
  }
}
