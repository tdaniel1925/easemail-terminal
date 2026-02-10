import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { sendSMS, getSMSMessages } from '@/lib/twilio/client';
import { ApiErrors } from '@/lib/api-error';

// Validation schema for SMS requests
const smsSchema = z.object({
  to: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number too long')
    .regex(/^[+]?[0-9\s\-()]+$/, 'Invalid phone number format'),
  body: z.string()
    .min(1, 'Message body is required')
    .max(1600, 'Message too long (max 1600 characters for SMS)')
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    // Get SMS messages from database
    const { data: messages } = await supabase
      .from('sms_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Get SMS error:', error);
    return ApiErrors.internalError('Failed to get messages');
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const validation = smsSchema.safeParse(requestBody);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.errors);
    }

    const { to, body } = validation.data;

    // Send SMS via Twilio
    const result = await sendSMS(to, body);

    if (!result.success) {
      return ApiErrors.externalService('Twilio SMS', { error: result.error });
    }

    // Store in database
    const { data: message, error } = await supabase
      .from('sms_messages')
      .insert({
        user_id: user.id,
        to_number: to,
        from_number: process.env.TWILIO_PHONE_NUMBER!,
        body,
        direction: 'outbound',
        status: 'sent',
        twilio_sid: result.sid,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
    }

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'sms_sent',
    } as any);

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Send SMS error:', error);
    return ApiErrors.internalError('Failed to send SMS');
  }
}
