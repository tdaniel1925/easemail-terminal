import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';
import { ApiErrors, handleSupabaseError } from '@/lib/api-error';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { requireAuth } from '@/lib/middleware/auth';
import { validateRequest } from '@/lib/middleware/validate';
import { logger } from '@/lib/logger';

// Validation schema for draft updates
const updateDraftSchema = z.object({
  to_recipients: z.array(z.any()).optional(),
  cc_recipients: z.array(z.any()).optional(),
  bcc_recipients: z.array(z.any()).optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  reply_to_message_id: z.string().optional(),
  is_forward: z.boolean().optional(),
}).refine(
  (data) => {
    // Validate draft has some content - prevent empty/invalid drafts
    const hasRecipients = (data.to_recipients && data.to_recipients.length > 0) ||
                          (data.cc_recipients && data.cc_recipients.length > 0) ||
                          (data.bcc_recipients && data.bcc_recipients.length > 0);
    const hasSubject = data.subject && data.subject.trim().length > 0;
    const hasBody = data.body && data.body.trim().length > 0;

    return hasRecipients || hasSubject || hasBody;
  },
  {
    message: 'Cannot save empty draft. Please add recipients, subject, or body content.',
  }
);

// GET - Fetch a single draft
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // Authenticate user
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!id) {
      return ApiErrors.badRequest('Draft ID is required');
    }

    const supabase = await createClient();

    const { data: draft, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      logger.error('Failed to fetch draft', error, {
        userId: user.id,
        draftId: id,
        component: 'api/drafts/[id]/GET',
      });
      return handleSupabaseError(error, 'Failed to fetch draft');
    }

    if (!draft) {
      return ApiErrors.notFound('Draft');
    }

    logger.info('Draft fetched successfully', {
      userId: user.id,
      draftId: id,
    });

    return NextResponse.json({ draft });
  } catch (error: any) {
    logger.error('Fetch draft error', error, {
      userId: user.id,
      component: 'api/drafts/[id]/GET',
    });
    return ApiErrors.internalError(
      'Failed to fetch draft',
      process.env.NODE_ENV === 'development' ? { message: error.message } : undefined
    );
  }
});

// PATCH - Update a draft (auto-save)
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // Authenticate user
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  // Validate request body
  const { data: updateData, error: validationError } = await validateRequest(
    request,
    updateDraftSchema
  );
  if (validationError) return validationError;

  try {
    const { id } = await params;

    if (!id) {
      return ApiErrors.badRequest('Draft ID is required');
    }

    const supabase = await createClient();

    // Get existing draft with email account info
    const { data: existingDraft, error: fetchError } = await supabase
      .from('drafts')
      .select('*, email_accounts(grant_id)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      logger.error('Failed to fetch existing draft', fetchError, {
        userId: user.id,
        draftId: id,
        component: 'api/drafts/[id]/PATCH',
      });
      return handleSupabaseError(fetchError, 'Failed to fetch draft');
    }

    if (!existingDraft) {
      return ApiErrors.notFound('Draft');
    }

    // Update draft in Nylas if it has a Nylas draft ID
    if (existingDraft.nylas_draft_id && existingDraft.email_accounts?.grant_id) {
      try {
        const nylasClient = nylas();
        await nylasClient.drafts.update({
          identifier: existingDraft.email_accounts.grant_id,
          draftId: existingDraft.nylas_draft_id,
          requestBody: {
            to: updateData.to_recipients || [],
            cc: updateData.cc_recipients || [],
            bcc: updateData.bcc_recipients || [],
            subject: updateData.subject || '',
            body: updateData.body || '',
          },
        });
      } catch (nylasError) {
        logger.error('Failed to update draft in Nylas', nylasError, {
          userId: user.id,
          draftId: id,
          nylasDraftId: existingDraft.nylas_draft_id,
        });
        // Continue with local update even if Nylas update fails
      }
    }

    // Update draft in local database
    const { data: draft, error: updateError } = await supabase
      .from('drafts')
      .update({
        to_recipients: updateData.to_recipients,
        cc_recipients: updateData.cc_recipients,
        bcc_recipients: updateData.bcc_recipients,
        subject: updateData.subject,
        body: updateData.body,
        reply_to_message_id: updateData.reply_to_message_id,
        is_forward: updateData.is_forward,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update draft', updateError, {
        userId: user.id,
        draftId: id,
        component: 'api/drafts/[id]/PATCH',
      });
      return handleSupabaseError(updateError, 'Failed to update draft');
    }

    logger.info('Draft updated successfully', {
      userId: user.id,
      draftId: id,
    });

    return NextResponse.json({ draft, message: 'Draft updated' });
  } catch (error: any) {
    logger.error('Update draft error', error, {
      userId: user.id,
      component: 'api/drafts/[id]/PATCH',
    });
    return ApiErrors.internalError(
      'Failed to update draft',
      process.env.NODE_ENV === 'development' ? { message: error.message } : undefined
    );
  }
});

// DELETE - Delete a draft
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // Authenticate user
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!id) {
      return ApiErrors.badRequest('Draft ID is required');
    }

    const supabase = await createClient();

    // Get draft with email account info before deleting
    const { data: existingDraft, error: fetchError } = await supabase
      .from('drafts')
      .select('*, email_accounts(grant_id)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      logger.error('Failed to fetch draft for deletion', fetchError, {
        userId: user.id,
        draftId: id,
        component: 'api/drafts/[id]/DELETE',
      });
      return handleSupabaseError(fetchError, 'Failed to fetch draft');
    }

    if (!existingDraft) {
      return ApiErrors.notFound('Draft');
    }

    // Delete draft from Nylas if it has a Nylas draft ID
    if (existingDraft.nylas_draft_id && existingDraft.email_accounts?.grant_id) {
      try {
        const nylasClient = nylas();
        await nylasClient.drafts.destroy({
          identifier: existingDraft.email_accounts.grant_id,
          draftId: existingDraft.nylas_draft_id,
        });
      } catch (nylasError) {
        logger.error('Failed to delete draft from Nylas', nylasError, {
          userId: user.id,
          draftId: id,
          nylasDraftId: existingDraft.nylas_draft_id,
        });
        // Continue with local delete even if Nylas delete fails
      }
    }

    // Delete from local database
    const { error: deleteError } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      logger.error('Failed to delete draft', deleteError, {
        userId: user.id,
        draftId: id,
        component: 'api/drafts/[id]/DELETE',
      });
      return handleSupabaseError(deleteError, 'Failed to delete draft');
    }

    logger.info('Draft deleted successfully', {
      userId: user.id,
      draftId: id,
    });

    return NextResponse.json({ message: 'Draft deleted' });
  } catch (error: any) {
    logger.error('Delete draft error', error, {
      userId: user.id,
      component: 'api/drafts/[id]/DELETE',
    });
    return ApiErrors.internalError(
      'Failed to delete draft',
      process.env.NODE_ENV === 'development' ? { message: error.message } : undefined
    );
  }
});
