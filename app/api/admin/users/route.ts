import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: any; error: any };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    // Get all users with stats
    const { data: allUsers } = (await supabase
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

    // Check if user is super admin
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: any; error: any };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
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
