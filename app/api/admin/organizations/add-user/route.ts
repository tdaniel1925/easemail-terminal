import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/resend';
import { getOrgOwnerWelcomeEmailHtml, getOrgAdminWelcomeEmailHtml, getOrgMemberWelcomeEmailHtml } from '@/lib/email-templates';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Create service client for admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data to check permissions
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    const isSuperAdmin = userData?.is_super_admin || false;

    // Parse request body
    const {
      organization_id,
      name,
      email,
      role,
    } = await request.json();

    // Validate required fields
    if (!email || !role || !name) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    let orgId = organization_id;

    // If not super admin, verify they're an OWNER or ADMIN of an organization
    if (!isSuperAdmin) {
      if (!organization_id) {
        return NextResponse.json(
          { error: 'Organization ID is required' },
          { status: 400 }
        );
      }

      // Check if user is owner or admin of this org
      const { data: membership } = (await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organization_id)
        .eq('user_id', user.id)
        .single()) as { data: any };

      if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      orgId = organization_id;
    } else {
      // Super admin must specify org
      if (!organization_id) {
        return NextResponse.json(
          { error: 'Organization ID is required' },
          { status: 400 }
        );
      }
      orgId = organization_id;
    }

    // Get organization details using service client to ensure access
    const { data: org, error: orgError } = (await serviceClient
      .from('organizations')
      .select('name, seats, seats_used, plan')
      .eq('id', orgId)
      .single()) as { data: any; error: any };

    if (orgError || !org) {
      console.error('Failed to fetch organization:', orgError);
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check seats only for MEMBER role
    if (role === 'MEMBER' && org.seats_used >= org.seats) {
      return NextResponse.json({ error: 'No available seats' }, { status: 400 });
    }

    // Check if user already exists with this email
    const { data: existingAuthUser } = await serviceClient.auth.admin.listUsers();
    const existingUser = existingAuthUser.users.find(u => u.email === email);

    let userId: string;
    let isNewUser = false;
    let temporaryPassword = '';

    if (existingUser) {
      // User exists, just add to organization
      userId = existingUser.id;

      // Check if already a member using service client
      const { data: existingMember } = await serviceClient
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        );
      }
    } else {
      // Create new user
      isNewUser = true;
      temporaryPassword = randomBytes(16).toString('hex');

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

      userId = newAuthUser.user.id;

      // Create user profile using service client to bypass RLS
      const { error: userError } = await serviceClient
        .from('users')
        .insert({
          id: userId,
          email,
          name,
          preferences: {},
        });

      if (userError) {
        console.error('Failed to create user profile:', userError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }

      // Create user_preferences with onboarding completed (admin-created users skip onboarding)
      const { error: prefsError } = await serviceClient
        .from('user_preferences')
        .insert({
          user_id: userId,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          ai_features_enabled: true,
          auto_categorize: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (prefsError) {
        console.error('Failed to create user preferences:', prefsError);
        return NextResponse.json(
          { error: 'Failed to create user preferences' },
          { status: 500 }
        );
      }
    }

    // Add user to organization using service client
    const { error: memberError } = await serviceClient
      .from('organization_members')
      .insert({
        organization_id: orgId,
        user_id: userId,
        role,
      });

    if (memberError) {
      console.error('Failed to add member:', memberError);
      return NextResponse.json({ error: 'Failed to add user to organization' }, { status: 500 });
    }

    // Increment seats_used only for MEMBER role
    if (role === 'MEMBER') {
      const { error: updateError } = await serviceClient
        .from('organizations')
        .update({ seats_used: org.seats_used + 1 })
        .eq('id', orgId);

      if (updateError) {
        console.error('Failed to update seats_used:', updateError);
        // Don't fail the request if seat update fails - user is already added
      }
    }

    // Send welcome email ONLY to new users (with login credentials)
    // Existing users being added to an org don't need a welcome email
    if (isNewUser) {
      try {
        let html: string;
        let subject: string;

        console.log(`Preparing welcome email for NEW user ${email} with role ${role}`);

        if (role === 'OWNER') {
          html = getOrgOwnerWelcomeEmailHtml({
            userName: name,
            userEmail: email,
            organizationName: org.name,
            organizationId: orgId,
            plan: org.plan,
            seats: org.seats,
            temporaryPassword,
          });
          subject = `Welcome to ${org.name} on EaseMail!`;
        } else if (role === 'ADMIN') {
          html = getOrgAdminWelcomeEmailHtml({
            userName: name,
            userEmail: email,
            organizationName: org.name,
            organizationId: orgId,
            inviterName: 'System Administrator',
            temporaryPassword,
          });
          subject = `You're Now an Admin of ${org.name}`;
        } else {
          // MEMBER role
          html = getOrgMemberWelcomeEmailHtml({
            userName: name,
            userEmail: email,
            organizationName: org.name,
            organizationId: orgId,
            inviterName: 'System Administrator',
            temporaryPassword,
          });
          subject = `Welcome to ${org.name} on EaseMail!`;
        }

        await sendEmail({
          to: email,
          subject,
          html,
        });

        console.log(`✓ Welcome email sent successfully to ${email} as ${role}`);
      } catch (emailError: any) {
        console.error('Failed to send welcome email:', {
          error: emailError,
          message: emailError?.message,
          email,
          role,
          isNewUser,
        });
        // Don't fail the request if email fails - user is already successfully added
      }
    } else {
      console.log(`Skipping welcome email for existing user ${email} (already has account)`);
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} added to ${org.name} as ${role}`,
      userId,
      isNewUser,
    });
  } catch (error) {
    console.error('Add user to organization error:', error);
    return NextResponse.json(
      { error: 'Failed to add user to organization' },
      { status: 500 }
    );
  }
}
