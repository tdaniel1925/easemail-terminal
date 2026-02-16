import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiErrors } from '@/lib/api-error';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { requireAuth } from '@/lib/middleware/auth';
import { logger } from '@/lib/logger';

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Authenticate user
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Sign out the user (this clears Supabase session cookies)
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Logout error', error, {
        userId: user.id,
        component: 'api/auth/logout',
      });
      return ApiErrors.internalError('Failed to logout');
    }

    logger.info('User logged out successfully', { userId: user.id });

    // P0-AUTH-001: Create response with explicit cookie clearing
    const response = NextResponse.json({ message: 'Logged out successfully' });

    // Clear all Supabase-related cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'sb-localhost-auth-token', // For local development
    ];

    cookiesToClear.forEach((cookieName) => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/',
      });
    });

    return response;
  } catch (error: any) {
    logger.error('Logout error', error, {
      userId: user.id,
      component: 'api/auth/logout',
    });
    return ApiErrors.internalError(
      'Failed to logout',
      process.env.NODE_ENV === 'development' ? { message: error.message } : undefined
    );
  }
});
