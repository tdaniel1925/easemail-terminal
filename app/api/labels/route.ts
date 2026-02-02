import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List all labels for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient: any = supabase;
    const { data: labels, error } = await supabaseClient
      .from('custom_labels')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Fetch labels error:', error);
      return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
    }

    // Get message count for each label
    const labelsWithCounts = await Promise.all(
      labels.map(async (label: any) => {
        const { count } = await supabaseClient
          .from('message_labels')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('label_id', label.id);

        return {
          ...label,
          messageCount: count || 0,
        };
      })
    );

    return NextResponse.json({ labels: labelsWithCounts });
  } catch (error) {
    console.error('Fetch labels error:', error);
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
  }
}

// POST - Create new label
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, color, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Label name is required' }, { status: 400 });
    }

    const supabaseClient: any = supabase;
    const { data: label, error } = await supabaseClient
      .from('custom_labels')
      .insert({
        user_id: user.id,
        name,
        color: color || '#3B82F6',
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json({ error: 'Label name already exists' }, { status: 400 });
      }
      console.error('Create label error:', error);
      return NextResponse.json({ error: 'Failed to create label' }, { status: 500 });
    }

    return NextResponse.json({ label, message: 'Label created successfully' });
  } catch (error) {
    console.error('Create label error:', error);
    return NextResponse.json({ error: 'Failed to create label' }, { status: 500 });
  }
}
