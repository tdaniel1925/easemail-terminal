import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { nylas } from '@/lib/nylas/client';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, or external service)
// Call it every minute: */1 * * * *

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Find all pending emails that should be sent now
    const now = new Date().toISOString();
    const { data: emailsToSend, error } = await supabase
      .from('scheduled_emails')
      .select('*, email_accounts(*)')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(50); // Process up to 50 emails per run

    if (error) {
      console.error('Fetch scheduled emails error:', error);
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }

    if (!emailsToSend || emailsToSend.length === 0) {
      return NextResponse.json({ message: 'No emails to send', processed: 0 });
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process each email
    for (const scheduledEmail of emailsToSend) {
      results.processed++;

      try {
        const account = scheduledEmail.email_accounts;

        if (!account || !account.grant_id) {
          throw new Error('Email account not found or invalid');
        }

        // Send via Nylas
        const nylasClient = nylas();
        await nylasClient.messages.send({
          identifier: account.grant_id,
          requestBody: {
            to: scheduledEmail.to_recipients.map((email: string) => ({ email })),
            ...(scheduledEmail.cc_recipients?.length > 0 && {
              cc: scheduledEmail.cc_recipients.map((email: string) => ({ email })),
            }),
            ...(scheduledEmail.bcc_recipients?.length > 0 && {
              bcc: scheduledEmail.bcc_recipients.map((email: string) => ({ email })),
            }),
            subject: scheduledEmail.subject || '(no subject)',
            body: scheduledEmail.body,
            ...(scheduledEmail.reply_to_message_id && {
              reply_to_message_id: scheduledEmail.reply_to_message_id,
            }),
            ...(scheduledEmail.attachments && { attachments: scheduledEmail.attachments }),
          },
        });

        // Update status to sent
        await supabase
          .from('scheduled_emails')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', scheduledEmail.id);

        results.sent++;
      } catch (error: any) {
        console.error(`Failed to send scheduled email ${scheduledEmail.id}:`, error);

        // Update status to failed
        await supabase
          .from('scheduled_emails')
          .update({
            status: 'failed',
            error_message: error.message || 'Failed to send email',
          })
          .eq('id', scheduledEmail.id);

        results.failed++;
        results.errors.push({
          id: scheduledEmail.id,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: 'Scheduled emails processed',
      ...results,
    });
  } catch (error) {
    console.error('Process scheduled emails error:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
}

// POST endpoint for manual processing (for testing)
export async function POST(request: NextRequest) {
  return GET(request);
}
