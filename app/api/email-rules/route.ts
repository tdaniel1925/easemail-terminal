import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List all email rules for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: rules, error } = await (supabase as any)
      .from('email_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Fetch email rules error:', error);
      return NextResponse.json({ error: 'Failed to fetch email rules' }, { status: 500 });
    }

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Fetch email rules error:', error);
    return NextResponse.json({ error: 'Failed to fetch email rules' }, { status: 500 });
  }
}

// POST - Create new email rule
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      conditions,
      actions,
      enabled = true,
      priority = 0,
    } = await request.json();

    // Validate required fields
    if (!name || !conditions || !actions) {
      return NextResponse.json(
        { error: 'Name, conditions, and actions are required' },
        { status: 400 }
      );
    }

    // Validate conditions structure
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return NextResponse.json(
        { error: 'Conditions must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate actions structure
    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { error: 'Actions must be a non-empty array' },
        { status: 400 }
      );
    }

    const supabaseClient: any = supabase;
    const { data: rule, error } = await supabaseClient
      .from('email_rules')
      .insert({
        user_id: user.id,
        name,
        conditions,
        actions,
        enabled,
        priority,
      })
      .select()
      .single();

    if (error) {
      console.error('Create email rule error:', error);
      return NextResponse.json({ error: 'Failed to create email rule' }, { status: 500 });
    }

    return NextResponse.json({ rule, message: 'Email rule created successfully' });
  } catch (error) {
    console.error('Create email rule error:', error);
    return NextResponse.json({ error: 'Failed to create email rule' }, { status: 500 });
  }
}
