import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';
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
 * P4-WEBHOOK-001: Add idempotency and replay attack prevention
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

    let payload: NylasWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse Nylas webhook body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in webhook body' }, { status: 400 });
    }

    const { type, data, id, time } = payload;

    // P4-WEBHOOK-001: Prevent replay attacks - reject old webhooks (>5 minutes old)
    const webhookAge = Date.now() - (time * 1000);
    const MAX_WEBHOOK_AGE = 5 * 60 * 1000; // 5 minutes
    if (webhookAge > MAX_WEBHOOK_AGE) {
      console.warn('Rejecting old webhook', { id, type, age: webhookAge });
      return NextResponse.json({ error: 'Webhook too old' }, { status: 400 });
    }

    // P4-WEBHOOK-002: Check for duplicate webhook using webhook ID (idempotency)
    const supabase = await createClient();
    const { data: existingWebhook } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('webhook_id', id)
      .single();

    if (existingWebhook) {
      console.log('Duplicate webhook detected (idempotent)', { webhookId: id, type });
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    console.log(`Received Nylas webhook: ${type}`, data);

    // Handle different webhook types
    let processingError: any = null;
    try {
      switch (type) {
        case 'message.created':
          await handleMessageCreated(data, id);
          break;

        case 'message.updated':
          await handleMessageUpdated(data, id);
          break;

        case 'message.deleted':
          await handleMessageDeleted(data, id);
          break;

        case 'thread.updated':
          await handleThreadUpdated(data, id);
          break;

        case 'calendar.created':
        case 'calendar.updated':
        case 'calendar.deleted':
          await handleCalendarEvent(type, data, id);
          break;

        case 'event.created':
        case 'event.updated':
        case 'event.deleted':
          await handleEventChange(type, data, id);
          break;

        default:
          console.log(`Unhandled webhook type: ${type}`);
      }
    } catch (handlerError) {
      processingError = handlerError;
      console.error('Webhook handler error:', handlerError);

      // P4-WEBHOOK-003: Log webhook failures to database
      await logWebhookFailure(supabase, id, type, data, handlerError);
    }

    return NextResponse.json({ success: !processingError });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * P4-WEBHOOK-003: Log webhook processing failures
 */
async function logWebhookFailure(
  supabase: any,
  webhookId: string,
  eventType: string,
  data: any,
  error: any
) {
  try {
    await supabase.from('webhook_failures').insert({
      webhook_id: webhookId,
      event_type: eventType,
      payload: data,
      error_message: error?.message || String(error),
      error_stack: error?.stack,
      created_at: new Date().toISOString(),
    });
  } catch (logError) {
    console.error('Failed to log webhook failure:', logError);
  }
}

/**
 * Handle new message created
 * P4-WEBHOOK-004: Add webhook ID tracking for idempotency
 */
async function handleMessageCreated(data: NylasWebhookData, webhookId: string) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    // Find account by grant_id
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('grant_id', grant_id)
      .single()) as { data: any };

    if (!account) {
      console.log(`No account found for grant_id: ${grant_id}`);
      return;
    }

    // Fetch full message data from Nylas
    const nylasClient = nylas();
    const message = await nylasClient.messages.find({
      identifier: grant_id,
      messageId: id,
    });

    if (!message || !message.data) {
      console.log(`Could not fetch message ${id} from Nylas`);
      return;
    }

    const msg = message.data;

    // Extract folder IDs (Nylas stores these in the folders array)
    const folderIds = msg.folders || [];

    // Prepare from email
    const fromEmail = Array.isArray(msg.from) && msg.from.length > 0
      ? msg.from[0].email
      : '';

    // Store message in database
    const supabaseClient: any = supabase;
    await supabaseClient.from('messages').insert({
      nylas_message_id: msg.id,
      nylas_thread_id: msg.threadId,
      nylas_grant_id: grant_id,
      user_id: account.user_id,
      email_account_id: account.id,
      subject: msg.subject || '(No Subject)',
      from_email: fromEmail,
      to_recipients: msg.to || [],
      cc_recipients: msg.cc || [],
      bcc_recipients: msg.bcc || [],
      body: msg.body || msg.snippet || '',
      snippet: msg.snippet || '',
      folder_ids: folderIds,
      labels: [], // Labels not available in Nylas v3
      is_unread: msg.unread || false,
      is_starred: msg.starred || false,
      is_draft: false, // Drafts are handled separately in Nylas v3
      date: new Date(msg.date * 1000).toISOString(),
      has_attachments: (msg.attachments || []).length > 0,
      attachments: msg.attachments || [],
    });

    // Track new email notification
    await supabaseClient.from('usage_tracking').insert({
      user_id: account.user_id,
      feature: 'email_received',
    });

    // P4-WEBHOOK-004: Mark webhook as processed (idempotency tracking)
    await supabaseClient.from('webhook_events').insert({
      webhook_id: webhookId,
      user_id: account.user_id,
      event_type: 'message.created',
      grant_id,
      object_id: id,
      payload: data,
      processed: true,
    });

    console.log(`Message ${id} stored in database for user: ${account.user_id}`);
  } catch (error) {
    console.error('Error handling message.created:', error);
  }
}

/**
 * Handle message updated
 * P4-WEBHOOK-004: Add webhook ID tracking for idempotency
 */
async function handleMessageUpdated(data: NylasWebhookData, webhookId: string) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('grant_id', grant_id)
      .single()) as { data: any };

    if (!account) return;

    // Fetch updated message data from Nylas
    const nylasClient = nylas();
    const message = await nylasClient.messages.find({
      identifier: grant_id,
      messageId: id,
    });

    if (!message || !message.data) {
      console.log(`Could not fetch updated message ${id} from Nylas`);
      return;
    }

    const msg = message.data;

    // Extract folder IDs
    const folderIds = msg.folders || [];

    // Prepare from email
    const fromEmail = Array.isArray(msg.from) && msg.from.length > 0
      ? msg.from[0].email
      : '';

    // Update message in database
    const supabaseClient: any = supabase;
    await supabaseClient
      .from('messages')
      .update({
        subject: msg.subject || '(No Subject)',
        from_email: fromEmail,
        to_recipients: msg.to || [],
        cc_recipients: msg.cc || [],
        bcc_recipients: msg.bcc || [],
        body: msg.body || msg.snippet || '',
        snippet: msg.snippet || '',
        folder_ids: folderIds,
        labels: [], // Labels not available in Nylas v3
        is_unread: msg.unread || false,
        is_starred: msg.starred || false,
        is_draft: false, // Drafts are handled separately in Nylas v3
        has_attachments: (msg.attachments || []).length > 0,
        attachments: msg.attachments || [],
        updated_at: new Date().toISOString(),
      })
      .eq('nylas_message_id', msg.id);

    // P4-WEBHOOK-004: Mark webhook as processed
    await supabaseClient.from('webhook_events').insert({
      webhook_id: webhookId,
      user_id: account.user_id,
      event_type: 'message.updated',
      grant_id,
      object_id: id,
      payload: data,
      processed: true,
    });

    console.log(`Message ${id} updated in database for user: ${account.user_id}`);
  } catch (error) {
    console.error('Error handling message.updated:', error);
  }
}

/**
 * Handle message deleted
 * P4-WEBHOOK-004: Add webhook ID tracking for idempotency
 */
async function handleMessageDeleted(data: NylasWebhookData, webhookId: string) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('grant_id', grant_id)
      .single()) as { data: any };

    if (!account) return;

    // Delete message from database
    await supabase
      .from('messages')
      .delete()
      .eq('nylas_message_id', id);

    // P4-WEBHOOK-004: Mark webhook as processed
    const supabaseClient: any = supabase;
    await supabaseClient.from('webhook_events').insert({
      webhook_id: webhookId,
      user_id: account.user_id,
      event_type: 'message.deleted',
      grant_id,
      object_id: id,
      payload: data,
      processed: true,
    });

    console.log(`Message ${id} deleted from database for user: ${account.user_id}`);
  } catch (error) {
    console.error('Error handling message.deleted:', error);
  }
}

/**
 * Handle thread updated (read/unread, starred, etc.)
 * P4-WEBHOOK-004: Add webhook ID tracking for idempotency
 */
async function handleThreadUpdated(data: NylasWebhookData, webhookId: string) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single()) as { data: any };

    if (!account) return;

    // P4-WEBHOOK-004: Mark webhook as processed with webhook ID
    const supabaseClient: any = supabase;
    await supabaseClient.from('webhook_events').insert({
      webhook_id: webhookId,
      user_id: account.user_id,
      event_type: 'thread.updated',
      grant_id,
      object_id: id,
      payload: data,
      processed: true,
    });

    console.log(`Thread updated webhook processed for user: ${account.user_id}`);
  } catch (error) {
    console.error('Error handling thread.updated:', error);
  }
}

/**
 * Handle calendar events (created/updated/deleted)
 * P4-WEBHOOK-004: Add webhook ID tracking for idempotency
 */
async function handleCalendarEvent(type: string, data: NylasWebhookData, webhookId: string) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single()) as { data: any };

    if (!account) return;

    // P4-WEBHOOK-004: Mark webhook as processed with webhook ID
    const supabaseClient: any = supabase;
    await supabaseClient.from('webhook_events').insert({
      webhook_id: webhookId,
      user_id: account.user_id,
      event_type: type,
      grant_id,
      object_id: id,
      payload: data,
      processed: true,
    });

    console.log(`Calendar event ${type} webhook processed for user: ${account.user_id}`);
  } catch (error) {
    console.error(`Error handling ${type}:`, error);
  }
}

/**
 * Handle event changes (calendar events)
 * P4-WEBHOOK-004: Add webhook ID tracking for idempotency
 */
async function handleEventChange(type: string, data: NylasWebhookData, webhookId: string) {
  const { grant_id, id } = data.attributes;

  try {
    const supabase = await createClient();

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single()) as { data: any };

    if (!account) return;

    // P4-WEBHOOK-004: Mark webhook as processed with webhook ID
    const supabaseClient: any = supabase;
    await supabaseClient.from('webhook_events').insert({
      webhook_id: webhookId,
      user_id: account.user_id,
      event_type: type,
      grant_id,
      object_id: id,
      payload: data,
      processed: true,
    });

    console.log(`Event ${type} webhook processed for user: ${account.user_id}`);
  } catch (error) {
    console.error(`Error handling ${type}:`, error);
  }
}
