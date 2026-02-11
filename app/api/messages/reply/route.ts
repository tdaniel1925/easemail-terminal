import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { ApiErrors } from '@/lib/api-error';
import { successResponse, safeExternalCall } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

// Validation schema for reply requests
const replySchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
  to: z.union([
    z.string().email('Invalid email address'),
    z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient required')
  ]),
  cc: z.union([
    z.array(z.string().email()),
    z.undefined()
  ]).optional(),
  bcc: z.union([
    z.array(z.string().email()),
    z.undefined()
  ]).optional(),
  subject: z.string().min(1, 'Subject is required').max(998, 'Subject too long'),
  body: z.string().min(1, 'Message body is required'),
  replyAll: z.boolean().optional(),
  attachments: z.array(z.any()).optional(),
  readReceipt: z.boolean().optional()
});

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
    // Apply rate limiting for email replies
    const rateLimitResult = await rateLimit(request, RateLimitPresets.EMAIL_SEND);
    if (!rateLimitResult.success) {
      return ApiErrors.rateLimit(rateLimitResult.reset);
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    userId = user.id;

    // Parse and validate request body
    const requestBody = await request.json();
    const validation = replySchema.safeParse(requestBody);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.errors);
    }

    const { messageId, to, cc, bcc, subject, body, replyAll, attachments: attachmentData, readReceipt } = validation.data;

    // Get user's email account with proper error handling
    const result = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: EmailAccount | null; error: any };

    const account = result.data;
    const accountError = result.error;

    if (accountError || !account) {
      logger.error('No email account found for user', undefined, { userId: user.id, error: accountError });
      return ApiErrors.badRequest('No email account connected. Please connect an account first.');
    }

    // Validate grant_id exists and is valid
    if (!account.grant_id || account.grant_id.trim() === '') {
      logger.error('Email account missing grant_id', undefined, {
        userId: user.id,
        accountId: account.id,
        email: account.email
      });
      return ApiErrors.badRequest('Email account is not properly connected. Please reconnect your email account.');
    }

    const nylasClient = nylas();

    // Prepare custom headers for read receipt if requested
    const customHeaders: any = {};
    if (readReceipt) {
      customHeaders['Disposition-Notification-To'] = account.email;
      customHeaders['Return-Receipt-To'] = account.email;
    }

    // Send reply via Nylas with error handling
    const { data: message, error: sendError } = await safeExternalCall(
      () => nylasClient.messages.send({
        identifier: account.grant_id,
        requestBody: {
          to: Array.isArray(to) ? to.map((email: string) => ({ email })) : [{ email: to }],
          ...(cc && cc.length > 0 && { cc: cc.map((email: string) => ({ email })) }),
          ...(bcc && bcc.length > 0 && { bcc: bcc.map((email: string) => ({ email })) }),
          subject,
          body,
          replyToMessageId: messageId, // This maintains the thread
          ...(attachmentData && attachmentData.length > 0 && { attachments: attachmentData }),
          ...(readReceipt && Object.keys(customHeaders).length > 0 && {
            custom_headers: customHeaders
          }),
        },
      }),
      'Nylas Send Reply'
    );

    if (sendError || !message) {
      logger.error('Failed to send reply via Nylas', undefined, {
        userId: user.id,
        accountId: account.id,
        messageId,
        error: sendError,
      });
      return ApiErrors.externalService('Nylas', { error: sendError });
    }

    logger.info('Reply sent successfully', {
      userId: user.id,
      accountId: account.id,
      messageId: message.data?.id,
      replyToMessageId: messageId,
    });

    return successResponse(message, 'Reply sent successfully');
  } catch (error: any) {
    logger.error('Reply message error', error, {
      userId,
      component: 'api/messages/reply',
    });
    return ApiErrors.internalError(
      'Failed to send reply',
      process.env.NODE_ENV === 'development' ? { message: error.message } : undefined
    );
  }
}

// GET endpoint to fetch original message for reply context
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return ApiErrors.badRequest('Message ID required');
    }

    // Get user's email account
    const result = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: EmailAccount | null; error: any };

    const account = result.data;
    const accountError = result.error;

    if (accountError || !account) {
      logger.error('No email account found for user', undefined, { userId: user.id, error: accountError });
      return ApiErrors.badRequest('No email account connected');
    }

    if (!account.grant_id || account.grant_id.trim() === '') {
      logger.error('Email account missing grant_id', undefined, {
        userId: user.id,
        accountId: account.id
      });
      return ApiErrors.badRequest('Email account is not properly connected');
    }

    const nylasClient = nylas();

    // Fetch the original message with error handling
    const { data: message, error: fetchError } = await safeExternalCall(
      () => nylasClient.messages.find({
        identifier: account.grant_id,
        messageId: messageId,
      }),
      'Nylas Fetch Message'
    );

    if (fetchError || !message) {
      logger.error('Failed to fetch message via Nylas', undefined, {
        userId: user.id,
        messageId,
        error: fetchError
      });
      return ApiErrors.externalService('Nylas', { error: fetchError });
    }

    return NextResponse.json({ message: message.data });
  } catch (error: any) {
    logger.error('Fetch message error', error, {
      component: 'api/messages/reply/GET',
    });
    return ApiErrors.internalError('Failed to fetch message');
  }
}
