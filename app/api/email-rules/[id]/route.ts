import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get single email rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: rule, error } = await (supabase as any)
      .from('email_rules')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Fetch email rule error:', error);
      return NextResponse.json({ error: 'Email rule not found' }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Fetch email rule error:', error);
    return NextResponse.json({ error: 'Failed to fetch email rule' }, { status: 500 });
  }
}

// PATCH - Update email rule
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    // Don't allow changing user_id
    delete updates.user_id;
    delete updates.created_at;

    const supabaseClient: any = supabase;
    const { data: rule, error } = await supabaseClient
      .from('email_rules')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update email rule error:', error);
      return NextResponse.json({ error: 'Failed to update email rule' }, { status: 500 });
    }

    return NextResponse.json({ rule, message: 'Email rule updated successfully' });
  } catch (error) {
    console.error('Update email rule error:', error);
    return NextResponse.json({ error: 'Failed to update email rule' }, { status: 500 });
  }
}

// DELETE - Delete email rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await (supabase as any)
      .from('email_rules')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete email rule error:', error);
      return NextResponse.json({ error: 'Failed to delete email rule' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email rule deleted successfully' });
  } catch (error) {
    console.error('Delete email rule error:', error);
    return NextResponse.json({ error: 'Failed to delete email rule' }, { status: 500 });
  }
}
