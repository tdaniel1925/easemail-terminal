import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Track user login for notifications
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

    // Check if user has login tracking record
    const { data: existingTracking } = await supabase
      .from('user_login_tracking')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingTracking) {
      // Update existing record
      await supabase
        .from('user_login_tracking')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: (existingTracking.login_count || 0) + 1,
        })
        .eq('user_id', user.id);
    } else {
      // Create new record (first login)
      await supabase
        .from('user_login_tracking')
        .insert({
          user_id: user.id,
          first_login_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
          login_count: 1,
        });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Track login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
