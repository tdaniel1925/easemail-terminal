import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch additional user data from users table
    const { data: userData } = await supabase
      .from('users')
      .select('name, role, is_super_admin, profile_picture_url')
      .eq('id', user.id)
      .single() as { data: { name: string; role: string; is_super_admin: boolean; profile_picture_url?: string } | null };

    // Merge auth user with database user data
    const enrichedUser = {
      ...user,
      name: userData?.name || user.user_metadata?.name || '',
      role: userData?.role || null,
      is_super_admin: userData?.is_super_admin || false,
      profile_picture_url: userData?.profile_picture_url || null,
    };

    return NextResponse.json({ user: enrichedUser });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    // Update user metadata
    const { data, error } = await supabase.auth.updateUser({
      data: { name },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
