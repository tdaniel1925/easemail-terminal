import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('SmsStatus') as string;

    // Find user by phone number (they need to configure this in settings)
    const supabase = await createClient();

    // Store incoming message
    // Note: In production, you'd match the phone number to a user
    // For now, we'll store it without user_id and admin can see all
    await supabase.from('sms_messages').insert({
      from_number: from,
      to_number: to,
      body,
      direction: 'inbound',
      status: messageStatus,
      twilio_sid: messageSid,
    } as any);

    // Return TwiML response
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your message. We'll get back to you soon!</Message>
</Response>`,
      {
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  } catch (error) {
    console.error('SMS webhook error:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`,
      {
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
}
