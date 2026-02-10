import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { ApiErrors } from '@/lib/api-error';

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

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const requestBody = await request.json();
    const validation = replySchema.safeParse(requestBody);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.errors);
    }

    const { messageId, to, cc, bcc, subject, body, replyAll, attachments: attachmentData, readReceipt } = validation.data;

    // Get user's email account
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return ApiErrors.badRequest('No email account connected');
    }

    const nylasClient = nylas();

    // Prepare custom headers for read receipt if requested
    const customHeaders: any = {};
    if (readReceipt) {
      customHeaders['Disposition-Notification-To'] = account.email;
      customHeaders['Return-Receipt-To'] = account.email;
    }

    // Send reply via Nylas
    const message = await nylasClient.messages.send({
      identifier: account.grant_id,
      requestBody: {
        to: Array.isArray(to) ? to.map((email: string) => ({ email })) : [{ email: to }],
        ...(cc && cc.length > 0 && { cc: cc.map((email: string) => ({ email })) }),
        ...(bcc && bcc.length > 0 && { bcc: bcc.map((email: string) => ({ email })) }),
        subject,
        body,
        reply_to_message_id: messageId, // This maintains the thread
        ...(attachmentData && attachmentData.length > 0 && { attachments: attachmentData }),
        ...(readReceipt && Object.keys(customHeaders).length > 0 && {
          custom_headers: customHeaders
        }),
      },
    });

    return NextResponse.json({ message: 'Reply sent successfully', data: message });
  } catch (error) {
    console.error('Reply message error:', error);
    return ApiErrors.internalError('Failed to send reply');
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
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return ApiErrors.badRequest('No email account connected');
    }

    const nylasClient = nylas();

    // Fetch the original message
    const message = await nylasClient.messages.find({
      identifier: account.grant_id,
      messageId: messageId,
    });

    return NextResponse.json({ message: message.data });
  } catch (error) {
    console.error('Fetch message error:', error);
    return ApiErrors.internalError('Failed to fetch message');
  }
}
