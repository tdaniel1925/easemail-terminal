import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin of any organization
    const { data: memberships } = (await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .in('role', ['OWNER', 'ADMIN'])) as { data: any };

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all users with stats
    const { data: allUsers } = (await supabase
      .from('users')
      .select('id, email, name, two_factor_enabled, created_at')
      .order('created_at', { ascending: false })) as { data: any };

    // Get organization counts for each user
    const usersWithStats = await Promise.all(
      allUsers.map(async (u: any) => {
        const { count: orgCount } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', u.id);

        const { count: emailCount } = await supabase
          .from('email_accounts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', u.id);

        return {
          ...u,
          organization_count: orgCount || 0,
          email_account_count: emailCount || 0,
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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

    // Check if user is admin
    const { data: memberships } = (await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['OWNER', 'ADMIN'])) as { data: any };

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email, name, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Create user via Supabase Admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || '' },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Create user record in public.users table
    const { error: insertError } = (await (supabase
      .from('users') as any)
      .insert({
        id: newUser.user.id,
        email,
        name: name || null,
      })) as { error: any };

    if (insertError) {
      console.error('Failed to create user record:', insertError);
    }

    return NextResponse.json({ user: newUser.user });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
