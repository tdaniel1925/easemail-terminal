import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List all scheduled emails for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'pending', 'sent', 'failed', 'cancelled'

    let query = (supabase as any)
      .from('scheduled_emails')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: scheduledEmails, error } = await query;

    if (error) {
      console.error('Fetch scheduled emails error:', error);
      return NextResponse.json({ error: 'Failed to fetch scheduled emails' }, { status: 500 });
    }

    return NextResponse.json({ scheduledEmails });
  } catch (error) {
    console.error('Fetch scheduled emails error:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled emails' }, { status: 500 });
  }
}

// POST - Create new scheduled email
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      to,
      cc,
      bcc,
      subject,
      body,
      attachments,
      scheduledFor,
      reply_to_message_id,
      is_forward,
      readReceipt,
    } = await request.json();

    // Validate required fields
    if (!to || !body || !scheduledFor) {
      return NextResponse.json(
        { error: 'To, body, and scheduled time are required' },
        { status: 400 }
      );
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Get user's primary email account
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Parse recipients
    const toArray = Array.isArray(to) ? to : [to];
    const ccArray = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
    const bccArray = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];

    const supabaseClient: any = supabase;
    const { data: scheduledEmail, error } = await supabaseClient
      .from('scheduled_emails')
      .insert({
        user_id: user.id,
        email_account_id: account.id,
        to_recipients: toArray,
        cc_recipients: ccArray,
        bcc_recipients: bccArray,
        subject: subject || '',
        body,
        attachments: attachments || null,
        scheduled_for: scheduledFor,
        reply_to_message_id: reply_to_message_id || null,
        is_forward: is_forward || false,
        read_receipt: readReceipt || false,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Schedule email error:', error);
      return NextResponse.json({ error: 'Failed to schedule email' }, { status: 500 });
    }

    return NextResponse.json({
      scheduledEmail,
      message: `Email scheduled for ${scheduledDate.toLocaleString()}`,
    });
  } catch (error) {
    console.error('Schedule email error:', error);
    return NextResponse.json({ error: 'Failed to schedule email' }, { status: 500 });
  }
}
