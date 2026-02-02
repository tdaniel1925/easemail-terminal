import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all drafts for the user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's drafts
    const { data: drafts, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Fetch drafts error:', error);
      return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
    }

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('Fetch drafts error:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}

// POST - Create a new draft
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      to_recipients,
      cc_recipients,
      bcc_recipients,
      subject,
      body,
      reply_to_message_id,
      is_forward,
      email_account_id,
    } = await request.json();

    // Get user's primary email account if not specified
    let accountId = email_account_id;
    if (!accountId) {
      const { data: account } = (await supabase
        .from('email_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()) as { data: any };

      accountId = account?.id;
    }

    // Create draft
    const supabaseClient: any = supabase;
    const { data: draft, error } = await supabaseClient
      .from('drafts')
      .insert({
        user_id: user.id,
        email_account_id: accountId,
        to_recipients,
        cc_recipients,
        bcc_recipients,
        subject,
        body,
        reply_to_message_id,
        is_forward,
      })
      .select()
      .single();

    if (error) {
      console.error('Create draft error:', error);
      return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
    }

    return NextResponse.json({ draft, message: 'Draft saved' });
  } catch (error) {
    console.error('Create draft error:', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}
