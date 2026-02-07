import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
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

    const { name, content, is_default, email_account_id } = await request.json();

    const { data: signature, error } = (await (supabase.from('signatures') as any)
      .update({
        name,
        content,
        is_default,
        email_account_id: email_account_id || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()) as { data: any; error: any };

    if (error) {
      console.error('Update signature error:', error);
      return NextResponse.json({ error: 'Failed to update signature' }, { status: 500 });
    }

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Update signature error:', error);
    return NextResponse.json({ error: 'Failed to update signature' }, { status: 500 });
  }
}

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

    const { error } = await supabase
      .from('signatures')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete signature error:', error);
      return NextResponse.json({ error: 'Failed to delete signature' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete signature error:', error);
    return NextResponse.json({ error: 'Failed to delete signature' }, { status: 500 });
  }
}
