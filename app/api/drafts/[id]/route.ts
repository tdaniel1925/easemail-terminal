import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Update draft
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
