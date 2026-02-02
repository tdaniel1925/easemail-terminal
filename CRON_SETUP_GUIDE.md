# Cron Job Setup Guide for EaseMail

This guide covers setting up automated background jobs for scheduled emails and snoozed emails.

## Overview

EaseMail requires two automated processes to run periodically:

1. **Scheduled Emails Processor** - Sends emails scheduled for sending
2. **Snoozed Emails Processor** - Returns snoozed emails to inbox when the snooze time expires

## Prerequisites

- Deployed application on Vercel (or other hosting platform)
- Public API endpoints accessible via HTTPS
- Cron service account (recommended: Vercel Cron, Upstash, or EasyCron)

## API Endpoints

### 1. Process Scheduled Emails

**Endpoint**: `POST /api/scheduled-emails/process`

**Purpose**: Checks for emails scheduled to be sent and sends them

**Recommended Frequency**: Every 1 minute

**Example Response**:
```json
{
  "processed": 5,
  "sent": 4,
  "failed": 1,
  "details": [...]
}
```

### 2. Process Snoozed Emails

**Endpoint**: `POST /api/snooze/process`

**Purpose**: Returns snoozed emails to inbox when snooze time expires

**Recommended Frequency**: Every 1 minute

**Example Response**:
```json
{
  "processed": 3,
  "messages": [...]
}
```

---

## Option 1: Vercel Cron Jobs (Recommended)

Vercel Cron is the simplest option if you're already hosting on Vercel.

### Setup Steps

1. **Create `vercel.json` in your project root**:

```json
{
  "crons": [
    {
      "path": "/api/scheduled-emails/process",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/snooze/process",
      "schedule": "* * * * *"
    }
  ]
}
```

2. **Deploy to Vercel**:

```bash
vercel deploy --prod
```

3. **Verify in Vercel Dashboard**:
   - Go to your project in Vercel
   - Click "Settings" → "Cron Jobs"
   - Verify both jobs are listed and active

### Monitoring

- View cron execution logs in Vercel Dashboard under "Logs"
- Filter by cron function name to see execution history

---

## Option 2: Upstash QStash

Free tier includes 100 requests/day, perfect for development.

### Setup Steps

1. **Sign up at [upstash.com](https://upstash.com)**

2. **Create QStash Schedule**:
   - Go to QStash dashboard
   - Click "Schedules" → "Create Schedule"

3. **Configure Scheduled Emails Job**:
   - **Name**: `process-scheduled-emails`
   - **Destination**: `https://your-domain.vercel.app/api/scheduled-emails/process`
   - **Schedule**: `* * * * *` (every minute)
   - **Method**: POST
   - **Headers**:
     - `Authorization: Bearer YOUR_API_KEY` (optional security)

4. **Configure Snoozed Emails Job**:
   - **Name**: `process-snoozed-emails`
   - **Destination**: `https://your-domain.vercel.app/api/snooze/process`
   - **Schedule**: `* * * * *` (every minute)
   - **Method**: POST

### Monitoring

- View execution history in QStash dashboard
- Check response codes and execution times

---

## Option 3: GitHub Actions

Free for public repos, includes private repos on paid plans.

### Setup Steps

1. **Create `.github/workflows/cron-jobs.yml`**:

```yaml
name: EaseMail Cron Jobs

on:
  schedule:
    # Runs every minute
    - cron: '* * * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  process-scheduled-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Process Scheduled Emails
        run: |
          curl -X POST https://your-domain.vercel.app/api/scheduled-emails/process \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

  process-snoozed-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Process Snoozed Emails
        run: |
          curl -X POST https://your-domain.vercel.app/api/snooze/process \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

2. **Add CRON_SECRET to GitHub Secrets**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add new secret: `CRON_SECRET` with a secure random value

3. **Commit and push**:

```bash
git add .github/workflows/cron-jobs.yml
git commit -m "Add cron jobs for scheduled and snoozed emails"
git push
```

### Monitoring

- View workflow runs in GitHub Actions tab
- Check logs for each execution

---

## Option 4: EasyCron (External Service)

Reliable third-party cron service with free tier.

### Setup Steps

1. **Sign up at [easycron.com](https://www.easycron.com)**

2. **Create First Cron Job**:
   - **URL**: `https://your-domain.vercel.app/api/scheduled-emails/process`
   - **Cron Expression**: `* * * * *`
   - **HTTP Method**: POST
   - **Headers**: Add authorization if needed

3. **Create Second Cron Job**:
   - **URL**: `https://your-domain.vercel.app/api/snooze/process`
   - **Cron Expression**: `* * * * *`
   - **HTTP Method**: POST

### Monitoring

- View execution history in EasyCron dashboard
- Get email alerts on failures

---

## Security Recommendations

### 1. Add Authorization Header

Update your API routes to require an authorization token:

```typescript
// In /api/scheduled-emails/process/route.ts and /api/snooze/process/route.ts

const authHeader = request.headers.get('authorization');
const expectedToken = process.env.CRON_SECRET;

if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Add CRON_SECRET to Environment Variables

In Vercel Dashboard:
- Go to Settings → Environment Variables
- Add `CRON_SECRET` with a secure random value
- Redeploy your application

### 3. Rate Limiting

Consider adding rate limiting to prevent abuse:

```typescript
// Example using upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
});

const { success } = await ratelimit.limit("cron-job");
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

---

## Monitoring and Alerts

### 1. Log Aggregation

Use Vercel's built-in logging or integrate with:
- **Datadog** - Application monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay and logging

### 2. Health Checks

Create a health check endpoint:

```typescript
// /api/health/route.ts
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabaseConnection(),
      nylas: await checkNylasConnection(),
    }
  });
}
```

### 3. Alerting

Set up alerts for:
- Failed cron executions (3+ consecutive failures)
- High error rates in processing
- Delayed email sends (>5 minutes past scheduled time)

---

## Troubleshooting

### Cron Jobs Not Running

1. **Check cron schedule syntax**: Use [crontab.guru](https://crontab.guru) to verify
2. **Verify endpoint accessibility**: Test with curl or Postman
3. **Check Vercel function logs**: Look for errors or timeouts
4. **Verify timezone settings**: Most cron services use UTC

### Emails Not Sending

1. **Check Nylas credentials**: Verify grant IDs are valid
2. **Check database records**: Query `scheduled_emails` table
3. **Review API logs**: Look for Nylas API errors
4. **Verify email account status**: Ensure account is connected

### Snoozed Emails Not Returning

1. **Check snooze times**: Verify `snooze_until` is in the past
2. **Check folder names**: Ensure `original_folder` is correct
3. **Verify Nylas folder IDs**: Check that folders exist
4. **Review API logs**: Look for Nylas message update errors

---

## Cron Expression Reference

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, Sunday=0)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

Common expressions:
- `* * * * *` - Every minute
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour
- `0 0 * * *` - Daily at midnight
- `0 9 * * 1` - Every Monday at 9 AM

---

## Cost Considerations

### Free Tiers

- **Vercel Cron**: Included in all plans (with execution time limits)
- **Upstash QStash**: 100 requests/day free
- **GitHub Actions**: 2,000 minutes/month free (public repos unlimited)
- **EasyCron**: 1 cron job free

### Optimization Tips

1. **Reduce frequency if possible**: If 1-minute precision isn't critical, run every 5 minutes
2. **Batch processing**: Process multiple items per execution
3. **Use edge functions**: Faster cold starts with Vercel Edge Functions

---

## Testing

### Manual Testing

Test cron endpoints locally:

```bash
# Test scheduled emails processor
curl -X POST http://localhost:3000/api/scheduled-emails/process \
  -H "Content-Type: application/json"

# Test snoozed emails processor
curl -X POST http://localhost:3000/api/snooze/process \
  -H "Content-Type: application/json"
```

### Integration Testing

Create test schedules:

```typescript
// Create a scheduled email for 1 minute from now
const testSchedule = {
  userId: 'test-user',
  recipientEmail: 'test@example.com',
  subject: 'Test Scheduled Email',
  body: 'This is a test',
  scheduledFor: new Date(Date.now() + 60000).toISOString()
};
```

---

## Summary

**Recommended Setup**:
1. Use **Vercel Cron** for production (simplest, no extra service)
2. Use **Upstash QStash** for staging/development (better observability)
3. Add authorization headers for security
4. Monitor execution logs regularly
5. Set up alerts for failures

Once set up, your EaseMail users will enjoy:
- Reliable scheduled email delivery
- Automatic snooze processing
- Seamless background operations
