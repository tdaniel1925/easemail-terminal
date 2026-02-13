import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

/**
 * Update user details (super admin only)
 * PATCH /api/admin/users/[userId]/edit
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Create service client for admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user is super admin OR an admin/owner of an organization that the target user belongs to
    const { data: userData } = (await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    const isSuperAdmin = userData?.is_super_admin || false;

    // If not super admin, check if they're an admin/owner of a shared organization
    if (!isSuperAdmin) {
      // Get organizations where current user is ADMIN or OWNER
      const { data: adminOrgs } = (await serviceClient
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .in('role', ['ADMIN', 'OWNER'])) as { data: { organization_id: string }[] | null };

      if (!adminOrgs || adminOrgs.length === 0) {
        return NextResponse.json(
          { error: 'Forbidden - Admin or Super admin access required' },
          { status: 403 }
        );
      }

      // Check if target user is in any of these organizations
      const { data: targetOrgMemberships } = (await serviceClient
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .in('organization_id', adminOrgs.map(o => o.organization_id))) as { data: { organization_id: string }[] | null };

      if (!targetOrgMemberships || targetOrgMemberships.length === 0) {
        return NextResponse.json(
          { error: 'Forbidden - You can only edit users in organizations you admin' },
          { status: 403 }
        );
      }
    }

    // Parse request body
    const { name, email } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email is being changed and if new email already exists
    const { data: existingUser } = (await serviceClient
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()) as { data: { email: string } | null };

    if (existingUser && existingUser.email !== email) {
      // Email is being changed, check if new email exists
      const { data: emailExists } = (await serviceClient
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', userId)
        .single()) as { data: any };

      if (emailExists) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Update user profile in public.users table
    const { error: profileError } = await serviceClient
      .from('users')
      .update({
        name: name || null,
        email,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Failed to update user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    // If email changed, update auth user email too
    if (existingUser && existingUser.email !== email) {
      try {
        await serviceClient.auth.admin.updateUserById(userId, {
          email,
        });
      } catch (authError) {
        console.error('Failed to update auth email:', authError);
        // Don't fail the request, but log it
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Edit user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
