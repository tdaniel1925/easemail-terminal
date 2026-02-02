import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/totp';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, password } = await request.json();

    if (!token && !password) {
      return NextResponse.json(
        { error: 'Either TOTP token or password is required' },
        { status: 400 }
      );
    }

    // Get user's 2FA data
    const { data: userData } = (await supabase
      .from('users')
      .select('two_factor_secret, two_factor_enabled, email')
      .eq('id', user.id)
      .single()) as { data: any };

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userData.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // Verify token if provided
    if (token && userData.two_factor_secret) {
      const isValid = await verifyToken(token, userData.two_factor_secret);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid TOTP token' },
          { status: 400 }
        );
      }
    } else if (password) {
      // Verify password as fallback
      const { error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      });

      if (error) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 400 }
        );
      }
    }

    // Disable 2FA
    await (supabase as any)
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
      })
      .eq('id', user.id);

    // Delete all backup codes
    await supabase.from('backup_codes').delete().eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
