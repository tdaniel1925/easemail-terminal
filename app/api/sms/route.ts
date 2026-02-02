import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendSMS, getSMSMessages } from '@/lib/twilio/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, body } = await request.json();

    if (!to || !body) {
      return NextResponse.json(
        { error: 'To and body are required' },
        { status: 400 }
      );
    }

    // Send SMS via Twilio
    const result = await sendSMS(to, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS' },
        { status: 500 }
      );
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
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
    }

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'sms_sent',
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Send SMS error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
