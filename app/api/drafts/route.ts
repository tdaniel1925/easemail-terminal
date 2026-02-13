import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';
import { safeExternalCall } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';
import { ApiErrors } from '@/lib/api-error';

interface EmailAccount {
  id: string;
  user_id: string;
  grant_id: string;
  email: string;
  provider: string;
  is_primary: boolean;
}

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
      logger.error('Fetch drafts error', error, { userId: user.id });
      return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
    }

    return NextResponse.json({ drafts });
  } catch (error: any) {
    logger.error('Fetch drafts error', error);
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

    // Validate draft has some content - prevent empty/invalid drafts
    const hasRecipients = (to_recipients && to_recipients.length > 0) ||
                          (cc_recipients && cc_recipients.length > 0) ||
                          (bcc_recipients && bcc_recipients.length > 0);
    const hasSubject = subject && subject.trim().length > 0;
    const hasBody = body && body.trim().length > 0;

    if (!hasRecipients && !hasSubject && !hasBody) {
      return NextResponse.json(
        { error: 'Cannot save empty draft. Please add recipients, subject, or body content.' },
        { status: 400 }
      );
    }

    // Get user's email account (with grant_id for Nylas)
    let account: EmailAccount | null;
    let accountError: any = null;

    if (email_account_id) {
      const result = (await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', email_account_id)
        .single()) as { data: EmailAccount | null; error: any };
      account = result.data;
      accountError = result.error;
    } else {
      const result = (await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()) as { data: EmailAccount | null; error: any };
      account = result.data;
      accountError = result.error;
    }

    if (accountError || !account) {
      logger.error('No email account found for draft', undefined, {
        userId: user.id,
        emailAccountId: email_account_id,
        error: accountError
      });
      return ApiErrors.badRequest('No email account connected. Please connect an account first.');
    }

    // Validate grant_id exists and is valid
    if (!account.grant_id || account.grant_id.trim() === '') {
      logger.error('Email account missing grant_id for draft', undefined, {
        userId: user.id,
        accountId: account.id,
        email: account.email
      });
      return ApiErrors.badRequest('Email account is not properly connected. Please reconnect your email account.');
    }

    // Create draft in Nylas with error handling
    const nylasClient = nylas();
    const { data: nylasDraft, error: nylasError } = await safeExternalCall(
      () => nylasClient.drafts.create({
        identifier: account.grant_id,
        requestBody: {
          to: to_recipients || [],
          cc: cc_recipients || [],
          bcc: bcc_recipients || [],
          subject: subject || '',
          body: body || '',
          replyToMessageId: reply_to_message_id || undefined,
        },
      }),
      'Nylas Create Draft'
    );

    if (nylasError || !nylasDraft) {
      logger.error('Failed to create draft in Nylas', undefined, {
        userId: user.id,
        accountId: account.id,
        error: nylasError
      });
      return ApiErrors.externalService('Nylas', { error: nylasError });
    }

    // Create draft in local database
    const { data: draft, error: dbError } = await (supabase as any)
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

    if (dbError) {
      logger.error('Create draft database error', dbError, { userId: user.id });
      return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
    }

    logger.info('Draft created successfully', {
      userId: user.id,
      draftId: draft.id,
      nylasDraftId: nylasDraft.data.id
    });

    return NextResponse.json({ draft, message: 'Draft saved' });
  } catch (error: any) {
    logger.error('Create draft error', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}
