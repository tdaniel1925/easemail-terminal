import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

interface NylasWebhookData {
  type: string;
  object: string;
  attributes: {
    id: string;
    grant_id: string;
    [key: string]: any;
  };
}

interface NylasWebhookPayload {
  specversion: string;
  type: string;
  source: string;
  id: string;
  time: number;
  data: NylasWebhookData;
}

/**
 * Verify Nylas webhook signature
 * https://developer.nylas.com/docs/developer-guide/webhooks/webhook-signatures/
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const computedSignature = hmac.digest('hex');
  return signature === computedSignature;
}

/**
 * Handle Nylas webhook challenge for verification
 * https://developer.nylas.com/docs/developer-guide/webhooks/setup/#verify-your-webhook-endpoint
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');

  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ error: 'No challenge provided' }, { status: 400 });
}

/**
 * Handle Nylas webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-nylas-signature');
    const webhookSecret = process.env.NYLAS_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const payload: NylasWebhookPayload = JSON.parse(rawBody);
    const { type, data } = payload;

    console.log(`Received Nylas webhook: ${type}`, data);

    // Handle different webhook types
    switch (type) {
      case 'message.created':
        await handleMessageCreated(data);
        break;

      case 'message.updated':
        await handleMessageUpdated(data);
        break;

      case 'message.deleted':
        await handleMessageDeleted(data);
        break;

      case 'thread.updated':
        await handleThreadUpdated(data);
        break;

      case 'calendar.created':
      case 'calendar.updated':
      case 'calendar.deleted':
        await handleCalendarEvent(type, data);
        break;

      case 'event.created':
      case 'event.updated':
      case 'event.deleted':
        await handleEventChange(type, data);
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle new message created
 */
async function handleMessageCreated(data: NylasWebhookData) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    // Find user by grant_id
    const { data: account } = await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single();

    if (!account) {
      console.log(`No account found for grant_id: ${grant_id}`);
      return;
    }

    // Store webhook event for processing
    await supabase.from('webhook_events').insert({
      user_id: account.user_id,
      event_type: 'message.created',
      grant_id,
      object_id: id,
      payload: data,
      processed: false,
    });

    // Track new email notification
    await supabase.from('usage_tracking').insert({
      user_id: account.user_id,
      feature: 'email_received',
    } as any);

    console.log(`Message created webhook processed for user: ${account.user_id}`);
  } catch (error) {
    console.error('Error handling message.created:', error);
  }
}

/**
 * Handle message updated
 */
async function handleMessageUpdated(data: NylasWebhookData) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    const { data: account } = await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single();

    if (!account) return;

    await supabase.from('webhook_events').insert({
      user_id: account.user_id,
      event_type: 'message.updated',
      grant_id,
      object_id: id,
      payload: data,
      processed: false,
    });

    console.log(`Message updated webhook processed for user: ${account.user_id}`);
  } catch (error) {
    console.error('Error handling message.updated:', error);
  }
}

/**
 * Handle message deleted
 */
async function handleMessageDeleted(data: NylasWebhookData) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    const { data: account } = await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single();

    if (!account) return;

    await supabase.from('webhook_events').insert({
      user_id: account.user_id,
      event_type: 'message.deleted',
      grant_id,
      object_id: id,
      payload: data,
      processed: false,
    });

    console.log(`Message deleted webhook processed for user: ${account.user_id}`);
  } catch (error) {
    console.error('Error handling message.deleted:', error);
  }
}

/**
 * Handle thread updated (read/unread, starred, etc.)
 */
async function handleThreadUpdated(data: NylasWebhookData) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    const { data: account } = await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single();

    if (!account) return;

    await supabase.from('webhook_events').insert({
      user_id: account.user_id,
      event_type: 'thread.updated',
      grant_id,
      object_id: id,
      payload: data,
      processed: false,
    });

    console.log(`Thread updated webhook processed for user: ${account.user_id}`);
  } catch (error) {
    console.error('Error handling thread.updated:', error);
  }
}

/**
 * Handle calendar events (created/updated/deleted)
 */
async function handleCalendarEvent(type: string, data: NylasWebhookData) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    const { data: account } = await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single();

    if (!account) return;

    await supabase.from('webhook_events').insert({
      user_id: account.user_id,
      event_type: type,
      grant_id,
      object_id: id,
      payload: data,
      processed: false,
    });

    console.log(`Calendar event ${type} webhook processed for user: ${account.user_id}`);
  } catch (error) {
    console.error(`Error handling ${type}:`, error);
  }
}

/**
 * Handle event changes (calendar events)
 */
async function handleEventChange(type: string, data: NylasWebhookData) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    const { data: account } = await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single();

    if (!account) return;

    await supabase.from('webhook_events').insert({
      user_id: account.user_id,
      event_type: type,
      grant_id,
      object_id: id,
      payload: data,
      processed: false,
    });

    console.log(`Event ${type} webhook processed for user: ${account.user_id}`);
  } catch (error) {
    console.error(`Error handling ${type}:`, error);
  }
}
