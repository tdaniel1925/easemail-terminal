import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: signatures, error } = (await (supabase.from('signatures') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })) as { data: any; error: any };

    if (error) {
      console.error('Fetch signatures error:', error);
      return NextResponse.json({ error: 'Failed to fetch signatures' }, { status: 500 });
    }

    return NextResponse.json({ signatures });
  } catch (error) {
    console.error('Fetch signatures error:', error);
    return NextResponse.json({ error: 'Failed to fetch signatures' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, content, is_default, email_account_id } = await request.json();

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    const { data: signature, error } = (await (supabase.from('signatures') as any)
      .insert({
        user_id: user.id,
        name,
        content,
        is_default: is_default || false,
        email_account_id: email_account_id || null,
      })
      .select()
      .single()) as { data: any; error: any };

    if (error) {
      console.error('Create signature error:', error);
      return NextResponse.json({ error: 'Failed to create signature' }, { status: 500 });
    }

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Create signature error:', error);
    return NextResponse.json({ error: 'Failed to create signature' }, { status: 500 });
  }
}
