import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// GET - Get specific label
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
    const { data: label, error } = await supabaseClient
      .from('custom_labels')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }

    return NextResponse.json({ label });
  } catch (error) {
    console.error('Fetch label error:', error);
    return NextResponse.json({ error: 'Failed to fetch label' }, { status: 500 });
  }
}

// PATCH - Update label
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
    const { name, color, description } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const supabaseClient: any = supabase;
    const { data: label, error } = await supabaseClient
      .from('custom_labels')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Label name already exists' }, { status: 400 });
      }
      console.error('Update label error:', error);
      return NextResponse.json({ error: 'Failed to update label' }, { status: 500 });
    }

    // Revalidate inbox to reflect label changes
    revalidatePath('/app/inbox');

    return NextResponse.json({ label, message: 'Label updated successfully' });
  } catch (error) {
    console.error('Update label error:', error);
    return NextResponse.json({ error: 'Failed to update label' }, { status: 500 });
  }
}

// DELETE - Delete label
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

    // Delete all message associations first (CASCADE should handle this, but being explicit)
    await supabaseClient
      .from('message_labels')
      .delete()
      .eq('user_id', user.id)
      .eq('label_id', id);

    // Delete the label
    const { error } = await supabaseClient
      .from('custom_labels')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete label error:', error);
      return NextResponse.json({ error: 'Failed to delete label' }, { status: 500 });
    }

    // Revalidate inbox to reflect label deletion
    revalidatePath('/app/inbox');

    return NextResponse.json({ message: 'Label deleted successfully' });
  } catch (error) {
    console.error('Delete label error:', error);
    return NextResponse.json({ error: 'Failed to delete label' }, { status: 500 });
  }
}
