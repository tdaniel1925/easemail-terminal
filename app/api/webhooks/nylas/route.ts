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
    await supabase.from('messages').insert({
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
      labels: msg.labels || [],
      is_unread: msg.unread || false,
      is_starred: msg.starred || false,
      is_draft: msg.object === 'draft',
      date: new Date(msg.date * 1000).toISOString(),
      has_attachments: (msg.attachments || []).length > 0,
      attachments: msg.attachments || [],
    } as any);

    // Track new email notification
    await supabase.from('usage_tracking').insert({
      user_id: account.user_id,
      feature: 'email_received',
    } as any);

    console.log(`Message ${id} stored in database for user: ${account.user_id}`);
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
    await supabase
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
        labels: msg.labels || [],
        is_unread: msg.unread || false,
        is_starred: msg.starred || false,
        is_draft: msg.object === 'draft',
        has_attachments: (msg.attachments || []).length > 0,
        attachments: msg.attachments || [],
        updated_at: new Date().toISOString(),
      } as any)
      .eq('nylas_message_id', msg.id);

    console.log(`Message ${id} updated in database for user: ${account.user_id}`);
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

    console.log(`Message ${id} deleted from database for user: ${account.user_id}`);
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

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single()) as { data: any };

    if (!account) return;

    await supabase.from('webhook_events').insert({
      user_id: account.user_id,
      event_type: 'thread.updated',
      grant_id,
      object_id: id,
      payload: data,
      processed: false,
    } as any);

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

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single()) as { data: any };

    if (!account) return;

    await supabase.from('webhook_events').insert({
      user_id: account.user_id,
      event_type: type,
      grant_id,
      object_id: id,
      payload: data,
      processed: false,
    } as any);

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

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('grant_id', grant_id)
      .single()) as { data: any };

    if (!account) return;

    await supabase.from('webhook_events').insert({
      user_id: account.user_id,
      event_type: type,
      grant_id,
      object_id: id,
      payload: data,
      processed: false,
    } as any);

    console.log(`Event ${type} webhook processed for user: ${account.user_id}`);
  } catch (error) {
    console.error(`Error handling ${type}:`, error);
  }
}
