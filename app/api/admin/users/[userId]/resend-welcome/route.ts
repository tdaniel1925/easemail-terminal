import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { ApiErrors } from '@/lib/api-error';
import { sendEmail } from '@/lib/resend';
import { getWelcomeEmailHtml } from '@/lib/email-templates';
import crypto from 'crypto';

/**
 * Generate a secure random password
 * Format: 3 words + 3 numbers (e.g., "Cloud-Sky-Moon-837")
 */
function generateSecurePassword(): string {
  const words = [
    'Cloud', 'Sky', 'Moon', 'Star', 'Ocean', 'River', 'Mountain', 'Forest',
    'Tiger', 'Eagle', 'Dolphin', 'Phoenix', 'Dragon', 'Thunder', 'Lightning',
    'Crystal', 'Diamond', 'Emerald', 'Sapphire', 'Ruby', 'Pearl', 'Coral',
    'Sunrise', 'Sunset', 'Aurora', 'Galaxy', 'Comet', 'Nebula', 'Cosmos'
  ];

  // Select 3 random words
  const selectedWords = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = crypto.randomInt(0, words.length);
    selectedWords.push(words[randomIndex]);
  }

  // Generate 3 random digits
  const randomDigits = crypto.randomInt(100, 999).toString();

  // Combine: Word-Word-Word-###
  return `${selectedWords.join('-')}-${randomDigits}`;
}

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

    // Generate new temporary password
    const temporaryPassword = generateSecurePassword();

    // Update user's password using Supabase Admin API
    try {
      const { error: updateError } = await serviceClient.auth.admin.updateUserById(
        userId,
        { password: temporaryPassword }
      );

      if (updateError) {
        console.error('Failed to update password:', updateError);
        return ApiErrors.internalError('Failed to update password');
      }

      console.log(`Password reset for user when resending welcome: ${targetUser.email}`);
    } catch (passwordError) {
      console.error('Password update error:', passwordError);
      return ApiErrors.internalError('Failed to update password');
    }

    // Send welcome email with new password
    try {
      const userName = targetUser.name || targetUser.email.split('@')[0];
      const html = getWelcomeEmailHtml({
        userName,
        userEmail: targetUser.email,
        initialPassword: temporaryPassword, // Include new password in welcome email
      });

      await sendEmail({
        to: targetUser.email,
        subject: 'Welcome to EaseMail!',
        html,
      });

      console.log(`Welcome email with new credentials resent to: ${targetUser.email}`);

      return NextResponse.json({
        success: true,
        message: 'Welcome email sent with new login credentials',
      });
    } catch (emailError) {
      console.error('Failed to send welcome email to', targetUser.email, emailError);
      // Password was changed but email failed
      return NextResponse.json({
        success: true,
        message: 'Password reset successfully but email failed to send',
        warning: 'Email notification was not sent',
      });
    }
  } catch (error) {
    console.error('Resend welcome email error:', error);
    return ApiErrors.internalError('Failed to resend welcome email');
  }
}
