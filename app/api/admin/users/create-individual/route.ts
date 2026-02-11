import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/resend';
import { getWelcomeEmailHtml } from '@/lib/email-templates';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Create service client for admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Authenticate and verify super admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if super admin
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin only' },
        { status: 403 }
      );
    }

    // Parse request body
    const { name, email } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingAuthUser } = await serviceClient.auth.admin.listUsers();
    const existingUser = existingAuthUser.users.find(u => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Generate temporary password
    const temporaryPassword = randomBytes(16).toString('hex');

    // Create new user
    const { data: newAuthUser, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name,
      },
    });

    if (authError || !newAuthUser.user) {
      console.error('Failed to create user:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    const userId = newAuthUser.user.id;

    // Create user profile
    const { error: profileError } = await (supabase as any).from('users').insert({
      id: userId,
      email,
      name,
      preferences: {},
      is_super_admin: false,
    });

    if (profileError) {
      console.error('Failed to create user profile:', profileError);
      // Try to clean up auth user
      await serviceClient.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Send welcome email
    try {
      const html = getWelcomeEmailHtml({
        userName: name,
        userEmail: email,
        initialPassword: temporaryPassword,
      });

      await sendEmail({
        to: email,
        subject: 'Welcome to EaseMail!',
        html,
      });

      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Individual user ${email} created successfully`,
      userId,
      temporaryPassword, // Return so admin can share if email fails
    });
  } catch (error) {
    console.error('Create individual user error:', error);
    return NextResponse.json(
      { error: 'Failed to create individual user' },
      { status: 500 }
    );
  }
}
