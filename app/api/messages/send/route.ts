import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { errorResponse, successResponse, safeQuery, safeExternalCall } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';
import { isString, isArray } from '@/lib/guards';

interface EmailAccount {
  id: string;
  user_id: string;
  grant_id: string;
  email: string;
  provider: string;
  is_primary: boolean;
}

export async function POST(request: NextRequest) {
  let userId: string | undefined;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    userId = user.id;

    // Parse and validate request body
    const body = await request.json();
    const { to, cc, bcc, subject, body: emailBody, attachments: attachmentData, readReceipt } = body;

    // Validate required fields
    if (!to || (!isString(to) && !isArray(to))) {
      return errorResponse('Invalid "to" field: must be email string or array', 400);
    }
    if (!subject || !isString(subject)) {
      return errorResponse('Subject is required and must be a string', 400);
    }
    if (!emailBody || !isString(emailBody)) {
      return errorResponse('Email body is required and must be a string', 400);
    }

    // Get user's email account with proper error handling
    const { data: account, error: accountError } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: EmailAccount | null; error: any };

    if (accountError || !account) {
      logger.error('No email account found for user', undefined, { userId: user.id, error: accountError });
      return errorResponse('No email account connected. Please connect an account first.', 400);
    }

    // Prepare recipients with validation
    const toRecipients = isArray(to)
      ? to.filter(isString).map((email: string) => ({ email }))
      : [{ email: to }];

    if (toRecipients.length === 0) {
      return errorResponse('At least one valid recipient is required', 400);
    }

    const ccRecipients = cc && isArray(cc) && cc.length > 0
      ? cc.filter(isString).map((email: string) => ({ email }))
      : undefined;

    const bccRecipients = bcc && isArray(bcc) && bcc.length > 0
      ? bcc.filter(isString).map((email: string) => ({ email }))
      : undefined;

    // Send email via Nylas with error handling
    const nylasClient = nylas();

    // Prepare custom headers for read receipt if requested
    const customHeaders: any = {};
    if (readReceipt) {
      customHeaders['Disposition-Notification-To'] = account.email;
      customHeaders['Return-Receipt-To'] = account.email;
    }

    const { data: message, error: sendError } = await safeExternalCall(
      () => nylasClient.messages.send({
        identifier: account.grant_id,
        requestBody: {
          to: toRecipients,
          ...(ccRecipients && { cc: ccRecipients }),
          ...(bccRecipients && { bcc: bccRecipients }),
          subject,
          body: emailBody,
          ...(attachmentData && isArray(attachmentData) && attachmentData.length > 0 && {
            attachments: attachmentData
          }),
          ...(readReceipt && Object.keys(customHeaders).length > 0 && {
            custom_headers: customHeaders
          }),
        },
      }),
      'Nylas Send Email'
    );

    if (sendError || !message) {
      logger.error('Failed to send email via Nylas', undefined, {
        userId: user.id,
        accountId: account.id,
        error: sendError,
      });
      return errorResponse(sendError || 'Failed to send email', 502);
    }

    // Track usage for analytics (non-blocking)
    (supabase.from('usage_tracking') as any)
      .insert({
        user_id: user.id,
        feature: 'email_sent',
        organization_id: null,
      })
      .then(({ error: trackingError }: any) => {
        if (trackingError) {
          logger.warn('Usage tracking failed', { error: trackingError, userId: user.id });
        }
      })
      .catch((err: any) => {
        logger.warn('Usage tracking error', { userId: user.id, error: err });
      });

    logger.info('Email sent successfully', {
      userId: user.id,
      accountId: account.id,
      messageId: message.data?.id,
      recipients: toRecipients.length,
    });

    return successResponse(message, 'Email sent successfully');
  } catch (error: any) {
    logger.error('Send message error', error, {
      userId,
      component: 'api/messages/send',
    });
    return errorResponse(
      'Failed to send email',
      500,
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
}
