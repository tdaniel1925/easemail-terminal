import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { ApiErrors } from '@/lib/api-error';
import { sendEmail } from '@/lib/resend';
import { getWelcomeEmailHtml } from '@/lib/email-templates';

// Validation schema for creating new user
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    // Use service client to bypass RLS for super admin queries
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user is super admin
    const { data: userData } = (await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: any; error: any };

    if (!userData?.is_super_admin) {
      return ApiErrors.forbidden('Super admin access required');
    }

    // Get all users with stats
    const { data: allUsers } = (await serviceClient
      .from('users')
      .select('id, email, name, two_factor_enabled, created_at')
      .order('created_at', { ascending: false })) as { data: any };

    // Return empty array if query fails
    if (!allUsers || !Array.isArray(allUsers)) {
      return NextResponse.json({ users: [] });
    }

    // Get organization counts for each user using Promise.allSettled for fault tolerance
    const statsResults = await Promise.allSettled(
      allUsers.map(async (u: any) => {
        try {
          const { count: orgCount } = await serviceClient
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', u.id);

          const { count: emailCount } = await serviceClient
            .from('email_accounts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', u.id);

          return {
            ...u,
            organization_count: orgCount || 0,
            email_account_count: emailCount || 0,
          };
        } catch (error) {
          console.error(`Failed to fetch stats for user ${u.id}:`, error);
          // Return user with zero stats on error
          return {
            ...u,
            organization_count: 0,
            email_account_count: 0,
          };
        }
      })
    );

    // Extract successful results, fallback to user data on failures
    const usersWithStats = statsResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`User stats fetch failed for ${allUsers[index].id}:`, result.reason);
        return {
          ...allUsers[index],
          organization_count: 0,
          email_account_count: 0,
        };
      }
    });

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Admin users error:', error);
    return ApiErrors.internalError('Failed to fetch users');
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    // Create service client for admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user is super admin
    const { data: userData } = (await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: any; error: any };

    if (!userData?.is_super_admin) {
      return ApiErrors.forbidden('Super admin access required');
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const validation = createUserSchema.safeParse(requestBody);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.errors);
    }

    const { email, name, password } = validation.data;

    // Create user via Supabase Admin API using service client
    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || '' },
    });

    if (createError) {
      return ApiErrors.badRequest(createError.message);
    }

    // Create user record in public.users table using service client
    const { error: insertError } = (await (serviceClient
      .from('users') as any)
      .insert({
        id: newUser.user.id,
        email,
        name: name || null,
      })) as { error: any };

    if (insertError) {
      console.error('Failed to create user record:', insertError);
    }

    // Send welcome email to new user with login credentials
    try {
      const userName = name || email.split('@')[0];
      const html = getWelcomeEmailHtml({
        userName,
        userEmail: email,
        initialPassword: password, // Include password in welcome email
      });

      await sendEmail({
        to: email,
        subject: 'Welcome to EaseMail!',
        html,
      });

      console.log(`Welcome email with credentials sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email to', email, emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ user: newUser.user });
  } catch (error) {
    console.error('Create user error:', error);
    return ApiErrors.internalError('Failed to create user');
  }
}
