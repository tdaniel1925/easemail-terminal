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

    // Get organization details
    const { data: org } = (await supabase
      .from('organizations')
      .select('name, seats, seats_used, plan')
      .eq('id', orgId)
      .single()) as { data: any };

    if (!org) {
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

      // Check if already a member
      const { data: existingMember } = await supabase
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

      // Create user profile
      await (supabase as any).from('users').insert({
        id: userId,
        email,
        name,
        preferences: {},
      });
    }

    // Add user to organization
    const { error: memberError } = await (supabase as any)
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
      await (supabase as any)
        .from('organizations')
        .update({ seats_used: org.seats_used + 1 })
        .eq('id', orgId);
    }

    // Send appropriate welcome email
    try {
      let html: string;
      let subject: string;

      if (role === 'OWNER') {
        html = getOrgOwnerWelcomeEmailHtml({
          userName: name,
          userEmail: email,
          organizationName: org.name,
          organizationId: orgId,
          plan: org.plan,
          seats: org.seats,
          temporaryPassword: isNewUser ? temporaryPassword : undefined,
        });
        subject = `Welcome to ${org.name} on EaseMail!`;
      } else if (role === 'ADMIN') {
        html = getOrgAdminWelcomeEmailHtml({
          userName: name,
          userEmail: email,
          organizationName: org.name,
          organizationId: orgId,
          inviterName: 'System Administrator',
          temporaryPassword: isNewUser ? temporaryPassword : undefined,
        });
        subject = `You're Now an Admin of ${org.name}`;
      } else {
        // MEMBER role
        const memberEmailParams: any = {
          userName: name,
          userEmail: email,
          organizationName: org.name,
          organizationId: orgId,
          inviterName: 'System Administrator',
        };
        if (isNewUser && temporaryPassword) {
          memberEmailParams.temporaryPassword = temporaryPassword;
        }
        html = getOrgMemberWelcomeEmailHtml(memberEmailParams);
        subject = `Welcome to ${org.name} on EaseMail!`;
      }

      await sendEmail({
        to: email,
        subject,
        html,
      });

      console.log(`Welcome email sent to ${email} as ${role}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
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
