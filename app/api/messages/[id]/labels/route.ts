import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get all labels for a message
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

    const { id: messageId } = await params;

    const supabaseClient: any = supabase;
    const { data: messageLabels, error } = await supabaseClient
      .from('message_labels')
      .select('*, custom_labels(*)')
      .eq('user_id', user.id)
      .eq('message_id', messageId);

    if (error) {
      console.error('Fetch message labels error:', error);
      return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
    }

    const labels = messageLabels.map((ml: any) => ml.custom_labels);

    return NextResponse.json({ labels });
  } catch (error) {
    console.error('Fetch message labels error:', error);
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
  }
}

// POST - Add label to message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: messageId } = await params;
    const { labelId } = await request.json();

    if (!labelId) {
      return NextResponse.json({ error: 'Label ID is required' }, { status: 400 });
    }

    const supabaseClient: any = supabase;

    // Verify label belongs to user
    const { data: label } = await supabaseClient
      .from('custom_labels')
      .select('*')
      .eq('id', labelId)
      .eq('user_id', user.id)
      .single();

    if (!label) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }

    // Add label to message
    const { data: messageLabel, error } = await supabaseClient
      .from('message_labels')
      .insert({
        user_id: user.id,
        message_id: messageId,
        label_id: labelId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Label already applied to this message' }, { status: 400 });
      }
      console.error('Add label to message error:', error);
      return NextResponse.json({ error: 'Failed to add label' }, { status: 500 });
    }

    return NextResponse.json({ messageLabel, message: 'Label added successfully' });
  } catch (error) {
    console.error('Add label to message error:', error);
    return NextResponse.json({ error: 'Failed to add label' }, { status: 500 });
  }
}

// DELETE - Remove label from message
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

    const { id: messageId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const labelId = searchParams.get('labelId');

    if (!labelId) {
      return NextResponse.json({ error: 'Label ID is required' }, { status: 400 });
    }

    const supabaseClient: any = supabase;
    const { error } = await supabaseClient
      .from('message_labels')
      .delete()
      .eq('user_id', user.id)
      .eq('message_id', messageId)
      .eq('label_id', labelId);

    if (error) {
      console.error('Remove label from message error:', error);
      return NextResponse.json({ error: 'Failed to remove label' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Label removed successfully' });
  } catch (error) {
    console.error('Remove label from message error:', error);
    return NextResponse.json({ error: 'Failed to remove label' }, { status: 500 });
  }
}
