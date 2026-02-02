# Nylas Webhooks Setup

This guide explains how to set up Nylas webhooks for real-time email and calendar synchronization in EaseMail.

## What are Webhooks?

Webhooks allow EaseMail to receive instant notifications when:
- New emails arrive
- Emails are updated (read/unread, starred, deleted)
- Calendar events are created, updated, or deleted
- Threads are updated

This enables real-time inbox updates without constant polling.

## Prerequisites

1. Deployed EaseMail application with a public URL (e.g., https://your-app.vercel.app)
2. Nylas API credentials configured
3. Admin access to your EaseMail organization

## Setup Options

### Option 1: Automatic Setup via API (Recommended)

Use the admin webhooks API to create a webhook:

```bash
curl -X POST https://your-app.vercel.app/api/admin/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "webhookUrl": "https://your-app.vercel.app/api/webhooks/nylas",
    "description": "EaseMail Production Webhook",
    "triggers": [
      "message.created",
      "message.updated",
      "message.deleted",
      "thread.updated",
      "event.created",
      "event.updated",
      "event.deleted"
    ]
  }'
```

### Option 2: Manual Setup via Nylas Dashboard

1. Go to [Nylas Dashboard](https://dashboard.nylas.com)
2. Navigate to **Webhooks** section
3. Click **Create Webhook**
4. Configure:
   - **Webhook URL**: `https://your-app.vercel.app/api/webhooks/nylas`
   - **Description**: EaseMail Webhook
   - **Triggers**: Select all message and event triggers
5. Click **Create**
6. Copy the webhook secret and add it to your environment variables

### Option 3: Using the Setup Script

Create a setup script `scripts/setup-webhooks.ts`:

```typescript
import { createNylasWebhook } from '@/lib/nylas/webhooks';

async function main() {
  const webhookUrl = process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/nylas';

  const result = await createNylasWebhook({
    webhookUrl,
    description: 'EaseMail Production Webhook',
  });

  if (result.success) {
    console.log('✅ Webhook created successfully!');
    console.log('Webhook ID:', result.webhook.id);
    console.log('Webhook Secret:', result.webhook.webhookSecret);
    console.log('\nAdd this to your .env file:');
    console.log(`NYLAS_WEBHOOK_SECRET=${result.webhook.webhookSecret}`);
  } else {
    console.error('❌ Failed to create webhook:', result.error);
  }
}

main();
```

Run with: `tsx scripts/setup-webhooks.ts`

## Environment Variables

Add the webhook secret to your `.env` file:

```bash
NYLAS_WEBHOOK_SECRET=your_webhook_secret_here
```

This secret is used to verify that webhook requests are actually from Nylas.

## Webhook Verification

The webhook endpoint at `/api/webhooks/nylas` automatically:

1. **Handles Challenge Verification** (GET request)
   - Nylas sends a challenge parameter to verify the endpoint
   - The endpoint returns the challenge to confirm setup

2. **Verifies Signatures** (POST request)
   - All webhook payloads are verified using HMAC-SHA256
   - Invalid signatures are rejected

## Webhook Events

### Supported Event Types

- `message.created` - New email received
- `message.updated` - Email updated (read, starred, etc.)
- `message.deleted` - Email deleted
- `thread.updated` - Email thread updated
- `event.created` - Calendar event created
- `event.updated` - Calendar event updated
- `event.deleted` - Calendar event deleted

### Event Storage

All webhook events are stored in the `webhook_events` table:

```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  user_id UUID,
  event_type TEXT,
  grant_id TEXT,
  object_id TEXT,
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ
);
```

## Frontend Integration

### Polling for New Events

Use the `useWebhookEvents` hook to poll for new events:

```typescript
import { useEmailNotifications } from '@/lib/hooks/useWebhookEvents';

function InboxPage() {
  const { unreadCount, events } = useEmailNotifications((event) => {
    console.log('New email received:', event);
    // Refresh inbox
    fetchMessages();
  });

  return (
    <div>
      {unreadCount > 0 && (
        <Badge>{unreadCount} new emails</Badge>
      )}
    </div>
  );
}
```

### Real-time Updates

The hook polls `/api/webhooks/events` every 10 seconds for new events:

```typescript
const {
  events,           // All webhook events
  unreadCount,      // Count of unprocessed events
  markAsProcessed,  // Mark events as processed
  refetch,          // Manually trigger fetch
} = useWebhookEvents({
  pollInterval: 10000,  // 10 seconds
  eventTypes: ['message.created'],
});
```

## Testing Webhooks

### Test Locally with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. Expose local server: `ngrok http 3000`
4. Use the ngrok URL when creating the webhook:
   ```
   https://abc123.ngrok.io/api/webhooks/nylas
   ```

### Verify Webhook is Working

1. Send yourself a test email
2. Check webhook events: `GET /api/webhooks/events`
3. Look for `message.created` event in the response

### Manual Testing

Send a test webhook manually:

```bash
curl -X POST https://your-app.vercel.app/api/webhooks/nylas \
  -H "Content-Type: application/json" \
  -H "x-nylas-signature: test" \
  -d '{
    "specversion": "1.0",
    "type": "message.created",
    "source": "nylas",
    "id": "test-event",
    "time": 1234567890,
    "data": {
      "type": "message",
      "object": "message",
      "attributes": {
        "id": "test-message-id",
        "grant_id": "test-grant-id"
      }
    }
  }'
```

## Managing Webhooks

### List All Webhooks

```typescript
const result = await listNylasWebhooks();
console.log(result.webhooks);
```

### Delete a Webhook

```typescript
const result = await deleteNylasWebhook('webhook-id');
```

### Rotate Webhook Secret

For security, periodically rotate your webhook secret:

```typescript
const result = await rotateWebhookSecret('webhook-id');
// Update NYLAS_WEBHOOK_SECRET in your .env
```

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook URL is publicly accessible**
   - Must be HTTPS (not HTTP)
   - Must not be localhost (use ngrok for local testing)

2. **Verify webhook is created**
   ```bash
   GET /api/admin/webhooks
   ```

3. **Check webhook secret is correct**
   - Must match between Nylas and your `.env`

4. **View webhook logs in Nylas Dashboard**
   - See delivery status and error messages

### Events Not Being Processed

1. **Check database for webhook events**
   ```sql
   SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 10;
   ```

2. **Verify user has email account connected**
   - Webhook events are linked by `grant_id`

3. **Check server logs for errors**
   ```bash
   vercel logs
   ```

## Security Best Practices

1. **Always verify webhook signatures**
   - Prevents unauthorized webhook calls
   - Already implemented in the webhook handler

2. **Use HTTPS only**
   - Webhook URLs must use HTTPS

3. **Rotate secrets regularly**
   - Change webhook secret every 90 days

4. **Monitor for suspicious activity**
   - Check webhook logs for unusual patterns

5. **Rate limit webhook processing**
   - Prevent abuse from excessive webhook calls

## Performance Optimization

### Event Processing

Webhook events are stored in the database for asynchronous processing:

1. Webhook received → Event stored in DB
2. Frontend polls for new events
3. UI updates in real-time
4. Events marked as processed

### Scaling Considerations

For high-volume applications:

1. **Use a message queue** (Redis, RabbitMQ)
   - Offload webhook processing
   - Better reliability and scalability

2. **Batch process events**
   - Process multiple events together
   - Reduce database queries

3. **Implement exponential backoff**
   - Retry failed event processing
   - Avoid overwhelming the system

## Next Steps

1. ✅ Set up webhook endpoint
2. ✅ Create webhook in Nylas
3. ✅ Add webhook secret to environment
4. ✅ Test webhook is receiving events
5. ✅ Integrate webhook events into your UI

For more information, see:
- [Nylas Webhooks Documentation](https://developer.nylas.com/docs/developer-guide/webhooks/)
- [EaseMail API Documentation](./API.md)
