import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ApiErrors } from '@/lib/api-error';

const errorReportSchema = z.object({
  error: z.object({
    message: z.string(),
    stack: z.string().optional(),
    digest: z.string().optional(),
    type: z.string(),
  }),
  context: z.object({
    url: z.string(),
    userAgent: z.string(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    organizationId: z.string().optional(),
    recentActions: z.array(z.any()).optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const validatedData = errorReportSchema.parse(body);

    // Store error report in database (if table exists)
    // Note: This will silently fail if the table doesn't exist yet
    try {
      const { error: dbError } = await supabase
        .from('error_reports')
        .insert({
          user_id: user?.id || null,
          error_message: validatedData.error.message,
          error_stack: validatedData.error.stack,
          error_digest: validatedData.error.digest,
          error_type: validatedData.error.type,
          context: validatedData.context,
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('Failed to store error report:', dbError);
        // Don't fail the request if database insert fails
      }
    } catch (dbError) {
      console.error('Error reports table may not exist yet:', dbError);
      // Continue - error was still logged to console
    }

    // Log to console for now
    console.error('[Error Report]', {
      user: user?.id || 'anonymous',
      error: validatedData.error,
      context: validatedData.context,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error report API error:', error);
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(error.errors);
    }
    return ApiErrors.internalError('Failed to submit error report');
  }
}
