import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';

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

    // Get user's email account (with grant_id for Nylas)
    let account: any;
    if (email_account_id) {
      const { data } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', email_account_id)
        .single();
      account = data;
    } else {
      const { data } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();
      account = data;
    }

    if (!account) {
      return NextResponse.json({ error: 'No email account found' }, { status: 400 });
    }

    // Create draft in Nylas
    const nylasClient = nylas();
    const nylasDraft = await nylasClient.drafts.create({
      identifier: account.grant_id,
      requestBody: {
        to: to_recipients || [],
        cc: cc_recipients || [],
        bcc: bcc_recipients || [],
        subject: subject || '',
        body: body || '',
        replyToMessageId: reply_to_message_id || undefined,
      },
    });

    // Create draft in local database
    const supabaseClient: any = supabase;
    const { data: draft, error } = await supabaseClient
      .from('drafts')
      .insert({
        user_id: user.id,
        email_account_id: account.id,
        nylas_draft_id: nylasDraft.data.id,
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
