import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';

// GET - List all snoozed emails for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient: any = supabase;
    const { data: snoozedEmails, error } = await supabaseClient
      .from('snoozed_emails')
      .select('*')
      .eq('user_id', user.id)
      .order('snooze_until', { ascending: true });

    if (error) {
      console.error('Fetch snoozed emails error:', error);
      return NextResponse.json({ error: 'Failed to fetch snoozed emails' }, { status: 500 });
    }

    // Fetch message details from Nylas for each snoozed email
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ snoozedEmails: [] });
    }

    const nylasClient = nylas();
    const messagesWithDetails = await Promise.all(
      snoozedEmails.map(async (snooze: any) => {
        try {
          const message = await nylasClient.messages.find({
            identifier: account.grant_id,
            messageId: snooze.message_id,
          });
          return {
            ...snooze,
            message: message.data,
          };
        } catch (error) {
          console.error(`Failed to fetch message ${snooze.message_id}:`, error);
          return {
            ...snooze,
            message: null,
          };
        }
      })
    );

    return NextResponse.json({ snoozedEmails: messagesWithDetails });
  } catch (error) {
    console.error('Fetch snoozed emails error:', error);
    return NextResponse.json({ error: 'Failed to fetch snoozed emails' }, { status: 500 });
  }
}

// POST - Snooze an email
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, threadId, snoozeUntil, originalFolder } = await request.json();

    if (!messageId || !snoozeUntil) {
      return NextResponse.json(
        { error: 'Message ID and snooze time are required' },
        { status: 400 }
      );
    }

    // Validate snooze time is in the future
    const snoozeDate = new Date(snoozeUntil);
    if (snoozeDate <= new Date()) {
      return NextResponse.json(
        { error: 'Snooze time must be in the future' },
        { status: 400 }
      );
    }

    // Get user's email account
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Archive the message in Nylas (hide from inbox)
    const nylasClient = nylas();
    await nylasClient.messages.update({
      identifier: account.grant_id,
      messageId: messageId,
      requestBody: {
        folders: ['[Gmail]/All Mail'], // Move to All Mail (archived)
      },
    });

    // Save snooze record
    const supabaseClient: any = supabase;
    const { data: snoozedEmail, error } = await supabaseClient
      .from('snoozed_emails')
      .insert({
        user_id: user.id,
        message_id: messageId,
        thread_id: threadId || null,
        snooze_until: snoozeUntil,
        original_folder: originalFolder || 'inbox',
      })
      .select()
      .single();

    if (error) {
      console.error('Snooze email error:', error);
      return NextResponse.json({ error: 'Failed to snooze email' }, { status: 500 });
    }

    return NextResponse.json({
      snoozedEmail,
      message: `Email snoozed until ${snoozeDate.toLocaleString()}`,
    });
  } catch (error) {
    console.error('Snooze email error:', error);
    return NextResponse.json({ error: 'Failed to snooze email' }, { status: 500 });
  }
}

// DELETE - Unsnooze an email (by message ID)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    // Get snooze record
    const supabaseClient: any = supabase;
    const { data: snoozedEmail } = await supabaseClient
      .from('snoozed_emails')
      .select('*')
      .eq('user_id', user.id)
      .eq('message_id', messageId)
      .single();

    if (!snoozedEmail) {
      return NextResponse.json({ error: 'Snoozed email not found' }, { status: 404 });
    }

    // Get user's email account
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (account) {
      // Restore message to inbox
      const nylasClient = nylas();
      await nylasClient.messages.update({
        identifier: account.grant_id,
        messageId: messageId,
        requestBody: {
          folders: [snoozedEmail.original_folder],
        },
      });
    }

    // Delete snooze record
    await supabaseClient
      .from('snoozed_emails')
      .delete()
      .eq('id', snoozedEmail.id);

    return NextResponse.json({ message: 'Email unsnoozed successfully' });
  } catch (error) {
    console.error('Unsnooze email error:', error);
    return NextResponse.json({ error: 'Failed to unsnooze email' }, { status: 500 });
  }
}
