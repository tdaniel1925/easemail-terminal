import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';

// GET - Fetch specific scheduled email
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const supabaseClient: any = supabase;
    const { data: scheduledEmail, error } = await supabaseClient
      .from('scheduled_emails')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Scheduled email not found' }, { status: 404 });
    }

    return NextResponse.json({ scheduledEmail });
  } catch (error) {
    console.error('Fetch scheduled email error:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled email' }, { status: 500 });
  }
}

// PATCH - Update scheduled email or change status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const {
      to,
      cc,
      bcc,
      subject,
      body,
      scheduledFor,
      status,
      sendNow,
    } = await request.json();

    // If sendNow is true, send the email immediately
    if (sendNow) {
      // Fetch the scheduled email
      const supabaseClient: any = supabase;
      const { data: scheduledEmail } = await supabaseClient
        .from('scheduled_emails')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!scheduledEmail) {
        return NextResponse.json({ error: 'Scheduled email not found' }, { status: 404 });
      }

      if (scheduledEmail.status !== 'pending') {
        return NextResponse.json(
          { error: 'Only pending emails can be sent' },
          { status: 400 }
        );
      }

      // Get email account
      const { data: account } = (await supabase
        .from('email_accounts')
        .select('*')
        .eq('id', scheduledEmail.email_account_id)
        .single()) as { data: any };

      if (!account) {
        return NextResponse.json({ error: 'Email account not found' }, { status: 400 });
      }

      try {
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
            subject: scheduledEmail.subject,
            body: scheduledEmail.body,
            ...(scheduledEmail.reply_to_message_id && {
              reply_to_message_id: scheduledEmail.reply_to_message_id,
            }),
            ...(scheduledEmail.attachments && { attachments: scheduledEmail.attachments }),
          },
        });

        // Update status to sent
        await supabaseClient
          .from('scheduled_emails')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', id);

        return NextResponse.json({ message: 'Email sent successfully' });
      } catch (error: any) {
        console.error('Send email error:', error);

        // Update status to failed
        await supabaseClient
          .from('scheduled_emails')
          .update({
            status: 'failed',
            error_message: error.message || 'Failed to send email',
          })
          .eq('id', id);

        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
      }
    }

    // Otherwise, update the scheduled email
    const updateData: any = {};
    if (to !== undefined) updateData.to_recipients = Array.isArray(to) ? to : [to];
    if (cc !== undefined) updateData.cc_recipients = Array.isArray(cc) ? cc : (cc ? [cc] : []);
    if (bcc !== undefined) updateData.bcc_recipients = Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []);
    if (subject !== undefined) updateData.subject = subject;
    if (body !== undefined) updateData.body = body;
    if (scheduledFor !== undefined) {
      const scheduledDate = new Date(scheduledFor);
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        );
      }
      updateData.scheduled_for = scheduledFor;
    }
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const supabaseClient: any = supabase;
    const { data: scheduledEmail, error } = await supabaseClient
      .from('scheduled_emails')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update scheduled email error:', error);
      return NextResponse.json({ error: 'Failed to update scheduled email' }, { status: 500 });
    }

    return NextResponse.json({
      scheduledEmail,
      message: 'Scheduled email updated successfully',
    });
  } catch (error) {
    console.error('Update scheduled email error:', error);
    return NextResponse.json({ error: 'Failed to update scheduled email' }, { status: 500 });
  }
}

// DELETE - Cancel scheduled email
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const supabaseClient: any = supabase;
    const { error } = await supabaseClient
      .from('scheduled_emails')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Cancel scheduled email error:', error);
      return NextResponse.json({ error: 'Failed to cancel scheduled email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Scheduled email cancelled successfully' });
  } catch (error) {
    console.error('Cancel scheduled email error:', error);
    return NextResponse.json({ error: 'Failed to cancel scheduled email' }, { status: 500 });
  }
}
