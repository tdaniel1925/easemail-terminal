import twilio from 'twilio';
import type { Twilio } from 'twilio';

let twilioInstance: Twilio | null = null;

function getTwilioClient(): Twilio {
  if (!twilioInstance) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN environment variable is not set');
    }
    twilioInstance = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioInstance;
}

export const twilioClient = getTwilioClient;

export function getTwilioPhoneNumber(): string {
  if (!process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('TWILIO_PHONE_NUMBER environment variable is not set');
  }
  return process.env.TWILIO_PHONE_NUMBER;
}

export async function sendSMS(to: string, body: string) {
  try {
    const client = getTwilioClient();
    const phoneNumber = getTwilioPhoneNumber();
    const message = await client.messages.create({
      body,
      from: phoneNumber,
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
    const client = getTwilioClient();
    const messages = await client.messages.list({
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
    const client = getTwilioClient();
    // Configure incoming message webhook
    const phoneNumbers = await client.incomingPhoneNumbers.list();

    if (phoneNumbers.length > 0) {
      await client
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
