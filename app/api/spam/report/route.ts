import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';

// POST - Report message as spam
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, senderEmail, subject, isSpam } = await request.json();

    if (!messageId || !senderEmail) {
      return NextResponse.json(
        { error: 'Message ID and sender email are required' },
        { status: 400 }
      );
    }

    const supabaseClient: any = supabase;

    // Check if report already exists
    const { data: existingReport } = await supabaseClient
      .from('spam_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('message_id', messageId)
      .single();

    if (existingReport) {
      // Update existing report
      const { data: report, error } = await supabaseClient
        .from('spam_reports')
        .update({
          is_spam: isSpam !== false, // Default to true if not explicitly false
        })
        .eq('id', existingReport.id)
        .select()
        .single();

      if (error) {
        console.error('Update spam report error:', error);
        return NextResponse.json({ error: 'Failed to update spam report' }, { status: 500 });
      }

      return NextResponse.json({
        report,
        message: isSpam !== false ? 'Message reported as spam' : 'Message marked as not spam',
      });
    }

    // Create new spam report
    const { data: report, error } = await supabaseClient
      .from('spam_reports')
      .insert({
        user_id: user.id,
        message_id: messageId,
        sender_email: senderEmail,
        subject: subject || null,
        is_spam: isSpam !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('Create spam report error:', error);
      return NextResponse.json({ error: 'Failed to report spam' }, { status: 500 });
    }

    // If marking as spam, move message to spam folder in Nylas
    if (isSpam !== false) {
      try {
        const { data: account } = (await supabase
          .from('email_accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single()) as { data: any };

        if (account) {
          const nylasClient = nylas();
          await nylasClient.messages.update({
            identifier: account.grant_id,
            messageId: messageId,
            requestBody: {
              folders: ['[Gmail]/Spam'],
            },
          });
        }
      } catch (error) {
        console.error('Failed to move message to spam folder:', error);
        // Don't fail the request if moving to spam fails
      }
    }

    return NextResponse.json({
      report,
      message: isSpam !== false ? 'Message reported as spam and moved to spam folder' : 'Message marked as not spam',
    });
  } catch (error) {
    console.error('Report spam error:', error);
    return NextResponse.json({ error: 'Failed to report spam' }, { status: 500 });
  }
}

// GET - Get spam reports for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const senderEmail = searchParams.get('senderEmail');

    const supabaseClient: any = supabase;
    let query = supabaseClient
      .from('spam_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_spam', true)
      .order('reported_at', { ascending: false });

    if (senderEmail) {
      query = query.eq('sender_email', senderEmail);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('Fetch spam reports error:', error);
      return NextResponse.json({ error: 'Failed to fetch spam reports' }, { status: 500 });
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Fetch spam reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch spam reports' }, { status: 500 });
  }
}
