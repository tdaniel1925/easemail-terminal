import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ApiErrors } from '@/lib/api-error';
import { sendEmail } from '@/lib/resend';
import { getPasswordResetEmailHtml } from '@/lib/email-templates';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting to prevent abuse
  const rateLimitResult = await rateLimit(request, RateLimitPresets.AUTH);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.errors);
    }

    const { email } = validation.data;

    const supabase = await createClient();

    // Check if user exists (for security, we don't reveal if email exists)
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (userData) {
      // Generate password reset link using Supabase
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://easemail.app'}/auth/callback?type=recovery`,
      });

      if (error) {
        console.error('Password reset error:', error);
      } else {
        // Send password reset email
        try {
          const userName = userData.name || email.split('@')[0];
          const html = getPasswordResetEmailHtml({
            userName,
            resetLink: data?.properties?.action_link || '#',
          });

          await sendEmail({
            to: email,
            subject: 'Reset Your EaseMail Password',
            html,
          });

          console.log(`Password reset email sent to: ${email}`);
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
        }
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Reset password request error:', error);
    return ApiErrors.internalError('Failed to process password reset request');
  }
}
