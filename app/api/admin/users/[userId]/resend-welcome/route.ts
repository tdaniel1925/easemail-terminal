import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { ApiErrors } from '@/lib/api-error';
import { sendEmail } from '@/lib/resend';
import { getWelcomeEmailHtml } from '@/lib/email-templates';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    const { userId } = await params;

    // Create service client for admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if current user is super admin
    const { data: currentUserData } = (await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: any; error: any };

    if (!currentUserData?.is_super_admin) {
      return ApiErrors.forbidden('Super admin access required');
    }

    // Get target user details
    const { data: targetUser } = (await serviceClient
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single()) as { data: any; error: any };

    if (!targetUser) {
      return ApiErrors.notFound('User not found');
    }

    // Send welcome email
    try {
      const userName = targetUser.name || targetUser.email.split('@')[0];
      const html = getWelcomeEmailHtml({
        userName,
        userEmail: targetUser.email,
      });

      await sendEmail({
        to: targetUser.email,
        subject: 'Welcome to EaseMail!',
        html,
      });

      console.log(`Welcome email resent to: ${targetUser.email}`);

      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully',
      });
    } catch (emailError) {
      console.error('Failed to send welcome email to', targetUser.email, emailError);
      return ApiErrors.internalError('Failed to send email');
    }
  } catch (error) {
    console.error('Resend welcome email error:', error);
    return ApiErrors.internalError('Failed to resend welcome email');
  }
}
