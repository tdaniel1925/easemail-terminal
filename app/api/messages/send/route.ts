import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { errorResponse, successResponse, safeQuery, safeExternalCall } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';
import { isString, isArray } from '@/lib/guards';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { ApiErrors } from '@/lib/api-error';

// P1-API-001: Request size limits
const MAX_EMAIL_BODY_SIZE = 10 * 1024 * 1024; // 10MB for email body
const MAX_SUBJECT_LENGTH = 998; // RFC 5322 recommended max
const MAX_TOTAL_RECIPIENTS = 100; // Prevent mass email abuse

// Validation schema for email send requests
const sendEmailSchema = z.object({
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
  subject: z.string().min(1, 'Subject is required').max(MAX_SUBJECT_LENGTH, 'Subject too long'),
  body: z.string()
    .min(1, 'Email body is required')
    .max(MAX_EMAIL_BODY_SIZE, `Email body too large. Maximum size is ${MAX_EMAIL_BODY_SIZE / 1024 / 1024}MB`),
  attachments: z.array(z.any()).optional(),
  readReceipt: z.boolean().optional(),
  accountId: z.string().optional() // Optional account ID to send from specific account
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
    // Apply rate limiting for email sending
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
    const validation = sendEmailSchema.safeParse(requestBody);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.errors);
    }

    const { to, cc, bcc, subject, body: emailBody, attachments: attachmentData, readReceipt, accountId } = validation.data;

    // P1-API-001: Validate total recipient count to prevent abuse
    const toCount = Array.isArray(to) ? to.length : 1;
    const ccCount = cc && Array.isArray(cc) ? cc.length : 0;
    const bccCount = bcc && Array.isArray(bcc) ? bcc.length : 0;
    const totalRecipients = toCount + ccCount + bccCount;

    if (totalRecipients > MAX_TOTAL_RECIPIENTS) {
      return ApiErrors.badRequest(
        `Too many recipients. Maximum ${MAX_TOTAL_RECIPIENTS} recipients allowed per email.`
      );
    }

    // Get user's email account with proper error handling
    let account: EmailAccount | null;
    let accountError: any = null;

    if (accountId) {
      // Use the specified account
      const result = (await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', accountId)
        .single()) as { data: EmailAccount | null; error: any };

      account = result.data;
      accountError = result.error;

      if (accountError || !account) {
        logger.error('Specified email account not found', undefined, { userId: user.id, accountId, error: accountError });
        return ApiErrors.badRequest('The specified email account was not found.');
      }
    } else {
      // Default to primary account
      const result = (await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()) as { data: EmailAccount | null; error: any };

      account = result.data;
      accountError = result.error;

      if (accountError || !account) {
        logger.error('No email account found for user', undefined, { userId: user.id, error: accountError });
        return ApiErrors.badRequest('No email account connected. Please connect an account first.');
      }
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

    const nylasRequestBody = {
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
    };

    const { data: message, error: sendError } = await safeExternalCall(
      () => nylasClient.messages.send({
        identifier: account.grant_id,
        requestBody: nylasRequestBody,
      }),
      'Nylas Send Email'
    );

    if (sendError || !message) {
      logger.error('Failed to send email via Nylas', undefined, {
        userId: user.id,
        accountId: account.id,
        error: sendError,
      });
      return ApiErrors.externalService('Nylas', { error: sendError });
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
    return ApiErrors.internalError(
      'Failed to send email',
      process.env.NODE_ENV === 'development' ? { message: error.message } : undefined
    );
  }
}
