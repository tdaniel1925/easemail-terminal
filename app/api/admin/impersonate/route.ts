import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get session from cookie
    const sessionCookie = cookieStore.get('sb-access-token');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionCookie.value);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (!userProfile?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 });
    }

    const { targetUserId, reason } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    }

    // Verify target user exists
    const { data: targetUser, error: targetError } = await supabase.auth.admin.getUserById(targetUserId);
    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Create impersonate session record for audit trail
    const { error: sessionError } = await supabase
      .from('impersonate_sessions')
      .insert({
        super_admin_id: user.id,
        impersonated_user_id: targetUserId,
        reason: reason || 'Support/troubleshooting',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      });

    if (sessionError) {
      console.error('Error creating impersonate session:', sessionError);
    }

    // Generate a new session for the target user
    const { data: sessionData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUser.user.email!,
    });

    if (linkError || !sessionData) {
      console.error('Error generating session:', linkError);
      return NextResponse.json({ error: 'Failed to generate session' }, { status: 500 });
    }

    // Return the session data to be set in the client
    return NextResponse.json({
      success: true,
      impersonateToken: sessionData.properties.hashed_token,
      targetUser: {
        id: targetUser.user.id,
        email: targetUser.user.email,
      },
    });
  } catch (error: any) {
    console.error('Impersonate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// End impersonation session
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get session from cookie
    const sessionCookie = cookieStore.get('sb-access-token');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionCookie.value);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find active impersonate session
    const { data: sessions } = await supabase
      .from('impersonate_sessions')
      .select('*')
      .or(`super_admin_id.eq.${user.id},impersonated_user_id.eq.${user.id}`)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1);

    if (sessions && sessions.length > 0) {
      // Mark session as ended
      await supabase
        .from('impersonate_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessions[0].id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('End impersonate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get impersonate sessions for audit
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get session from cookie
    const sessionCookie = cookieStore.get('sb-access-token');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionCookie.value);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (!userProfile?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch impersonate sessions
    const { data: sessions, error } = await supabase
      .from('impersonate_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Get impersonate sessions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
