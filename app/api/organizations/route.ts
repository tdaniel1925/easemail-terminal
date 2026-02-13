import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { getOrgOwnerWelcomeEmailHtml } from '@/lib/email-templates';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single() as { data: { is_super_admin: boolean } | null };

    const isSuperAdmin = userData?.is_super_admin || false;

    let organizations: any[] = [];

    if (isSuperAdmin) {
      // Super admins can see ALL organizations
      const { data: allOrgs } = (await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })) as { data: any };

      // For each org, check if super admin is a member to get their role
      const orgsWithRoles = await Promise.all((allOrgs || []).map(async (org: any) => {
        const { data: membership } = (await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', org.id)
          .eq('user_id', user.id)
          .single()) as { data: any };

        return {
          ...org,
          role: membership?.role || 'SUPER_ADMIN',
        };
      }));

      organizations = orgsWithRoles;
    } else {
      // Regular users only see organizations they're members of
      const { data: memberships } = (await supabase
        .from('organization_members')
        .select('*, organizations(*)')
        .eq('user_id', user.id)) as { data: any };

      organizations = memberships?.map((m: any) => ({
        ...m.organizations,
        role: m.role,
      })) || [];
    }

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json(
      { error: 'Failed to get organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Organization name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Create organization
    const { data: organization, error: orgError } = (await supabase
      .from('organizations')
      .insert({
        name,
        plan: 'FREE',
        seats: 1,
        seats_used: 1,
      } as any)
      .select()
      .single()) as { data: any; error: any };

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 400 });
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'OWNER',
      } as any);

    if (memberError) {
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', organization.id);
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    // Get user details for welcome email
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single() as { data: { name: string; email: string } | null };

    // Send org owner welcome email
    if (userData) {
      try {
        const html = getOrgOwnerWelcomeEmailHtml({
          userName: userData.name || userData.email.split('@')[0],
          userEmail: userData.email,
          organizationName: organization.name,
          organizationId: organization.id,
          plan: organization.plan || 'PRO',
          seats: organization.seats || 1,
        });

        await sendEmail({
          to: userData.email,
          subject: `Welcome to ${organization.name} on EaseMail!`,
          html,
        });

        console.log('Org owner welcome email sent to:', userData.email);
      } catch (emailError) {
        console.error('Failed to send org owner welcome email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
