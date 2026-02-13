import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';

// GET - Fetch a single draft
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

    const { data: draft, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Fetch draft error:', error);
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Fetch draft error:', error);
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }
}

// PATCH - Update a draft (auto-save)
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

    const { id} = await params;
    const updateData: any = await request.json();

    // Validate draft has some content - prevent empty/invalid drafts
    const hasRecipients = (updateData.to_recipients && updateData.to_recipients.length > 0) ||
                          (updateData.cc_recipients && updateData.cc_recipients.length > 0) ||
                          (updateData.bcc_recipients && updateData.bcc_recipients.length > 0);
    const hasSubject = updateData.subject && updateData.subject.trim().length > 0;
    const hasBody = updateData.body && updateData.body.trim().length > 0;

    if (!hasRecipients && !hasSubject && !hasBody) {
      return NextResponse.json(
        { error: 'Cannot save empty draft. Please add recipients, subject, or body content.' },
        { status: 400 }
      );
    }

    // Get existing draft with email account info
    const { data: existingDraft } = (await supabase
      .from('drafts')
      .select('*, email_accounts(grant_id)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!existingDraft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    // Update draft in Nylas if it has a Nylas draft ID
    if (existingDraft.nylas_draft_id && existingDraft.email_accounts?.grant_id) {
      try {
        const nylasClient = nylas();
        await nylasClient.drafts.update({
          identifier: existingDraft.email_accounts.grant_id,
          draftId: existingDraft.nylas_draft_id,
          requestBody: {
            to: updateData.to_recipients || [],
            cc: updateData.cc_recipients || [],
            bcc: updateData.bcc_recipients || [],
            subject: updateData.subject || '',
            body: updateData.body || '',
          },
        });
      } catch (nylasError) {
        console.error('Failed to update draft in Nylas:', nylasError);
        // Continue with local update even if Nylas update fails
      }
    }

    // Update draft in local database
    const supabaseClient: any = supabase;
    const { data: draft, error } = await supabaseClient
      .from('drafts')
      .update({
        to_recipients: updateData.to_recipients,
        cc_recipients: updateData.cc_recipients,
        bcc_recipients: updateData.bcc_recipients,
        subject: updateData.subject,
        body: updateData.body,
        reply_to_message_id: updateData.reply_to_message_id,
        is_forward: updateData.is_forward,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update draft error:', error);
      return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
    }

    return NextResponse.json({ draft, message: 'Draft updated' });
  } catch (error) {
    console.error('Update draft error:', error);
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
  }
}

// DELETE - Delete a draft
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

    // Get draft with email account info before deleting
    const { data: existingDraft } = (await supabase
      .from('drafts')
      .select('*, email_accounts(grant_id)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()) as { data: any };

    if (!existingDraft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    // Delete draft from Nylas if it has a Nylas draft ID
    if (existingDraft.nylas_draft_id && existingDraft.email_accounts?.grant_id) {
      try {
        const nylasClient = nylas();
        await nylasClient.drafts.destroy({
          identifier: existingDraft.email_accounts.grant_id,
          draftId: existingDraft.nylas_draft_id,
        });
      } catch (nylasError) {
        console.error('Failed to delete draft from Nylas:', nylasError);
        // Continue with local delete even if Nylas delete fails
      }
    }

    // Delete from local database
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete draft error:', error);
      return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Draft deleted' });
  } catch (error) {
    console.error('Delete draft error:', error);
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
  }
}
