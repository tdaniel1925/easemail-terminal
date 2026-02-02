import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { nylas } from '@/lib/nylas/client';

// This endpoint should be called by a cron job every minute
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

    // Find all snoozed emails that should be unsnoozed now
    const now = new Date().toISOString();
    const { data: emailsToUnsnooze, error } = await supabase
      .from('snoozed_emails')
      .select('*')
      .lte('snooze_until', now)
      .limit(50); // Process up to 50 emails per run

    if (error) {
      console.error('Fetch snoozed emails error:', error);
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }

    if (!emailsToUnsnooze || emailsToUnsnooze.length === 0) {
      return NextResponse.json({ message: 'No emails to unsnooze', processed: 0 });
    }

    const results = {
      processed: 0,
      unsnoozed: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Group by user_id to fetch accounts once per user
    const userGroups = new Map<string, any[]>();
    emailsToUnsnooze.forEach((email: any) => {
      if (!userGroups.has(email.user_id)) {
        userGroups.set(email.user_id, []);
      }
      userGroups.get(email.user_id)!.push(email);
    });

    // Process each user's emails
    for (const [userId, userEmails] of userGroups.entries()) {
      try {
        // Get user's email account
        const { data: account } = await supabase
          .from('email_accounts')
          .select('*')
          .eq('user_id', userId)
          .eq('is_primary', true)
          .single();

        if (!account || !account.grant_id) {
          throw new Error('Email account not found');
        }

        const nylasClient = nylas();

        // Process each email for this user
        for (const snoozedEmail of userEmails) {
          results.processed++;

          try {
            // Restore message to original folder (inbox)
            await nylasClient.messages.update({
              identifier: account.grant_id,
              messageId: snoozedEmail.message_id,
              requestBody: {
                folders: [snoozedEmail.original_folder],
              },
            });

            // Delete snooze record
            await supabase
              .from('snoozed_emails')
              .delete()
              .eq('id', snoozedEmail.id);

            results.unsnoozed++;
          } catch (error: any) {
            console.error(`Failed to unsnooze email ${snoozedEmail.message_id}:`, error);
            results.failed++;
            results.errors.push({
              id: snoozedEmail.id,
              messageId: snoozedEmail.message_id,
              error: error.message,
            });
          }
        }
      } catch (error: any) {
        console.error(`Failed to process emails for user ${userId}:`, error);
        results.failed += userEmails.length;
        results.errors.push({
          userId,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: 'Snoozed emails processed',
      ...results,
    });
  } catch (error) {
    console.error('Process snoozed emails error:', error);
    return NextResponse.json(
      { error: 'Failed to process snoozed emails' },
      { status: 500 }
    );
  }
}

// POST endpoint for manual processing (for testing)
export async function POST(request: NextRequest) {
  return GET(request);
}
