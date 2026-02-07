import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint is only for testing - requires valid token
export async function POST(request: NextRequest) {
  // Require valid test token
  const testToken = request.headers.get('x-test-token');
  const validTestToken = process.env.TEST_ENDPOINT_TOKEN || 'test-token-for-e2e';

  // Token must match exactly
  if (testToken !== validTestToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Use service role key to bypass rate limits
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create user with admin client (bypasses rate limits)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: name || 'Test User',
        email: authData.user.email,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    // Mark onboarding as complete
    const { error: prefsError } = await supabaseAdmin
      .from('user_preferences')
      .upsert({
        user_id: authData.user.id,
        use_case: 'work',
        ai_features_enabled: true,
        auto_categorize: true,
        notification_schedule: {},
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (prefsError) {
      console.error('Preferences error:', prefsError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
