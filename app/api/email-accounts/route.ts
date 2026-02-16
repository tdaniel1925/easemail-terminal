import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiErrors, handleSupabaseError } from '@/lib/api-error';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { requireAuth } from '@/lib/middleware/auth';
import { logger } from '@/lib/logger';

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Authenticate user
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Fetch user's email accounts
    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch email accounts', error, {
        userId: user.id,
        component: 'api/email-accounts',
      });
      return handleSupabaseError(error, 'Failed to fetch email accounts');
    }

    logger.info('Email accounts fetched successfully', {
      userId: user.id,
      accountCount: accounts?.length || 0,
    });

    return NextResponse.json({ accounts: accounts || [] });
  } catch (error: any) {
    logger.error('Get email accounts error', error, {
      userId: user.id,
      component: 'api/email-accounts',
    });
    return ApiErrors.internalError(
      'Failed to get email accounts',
      process.env.NODE_ENV === 'development' ? { message: error.message } : undefined
    );
  }
});
