import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyToken, hashBackupCode } from '@/lib/auth/totp';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, backupCodes } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'TOTP token is required' },
        { status: 400 }
      );
    }

    // Get user's temporary secret
    const { data: userData } = await supabase
      .from('users')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', user.id)
      .single();

    if (!userData || !userData.two_factor_secret) {
      return NextResponse.json(
        { error: 'No 2FA setup found. Please run setup first.' },
        { status: 400 }
      );
    }

    if (userData.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Verify the token
    const isValid = verifyToken(token, userData.two_factor_secret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid TOTP token' },
        { status: 400 }
      );
    }

    // Enable 2FA
    await supabase
      .from('users')
      .update({ two_factor_enabled: true })
      .eq('id', user.id);

    // Store hashed backup codes if provided
    if (backupCodes && Array.isArray(backupCodes)) {
      const hashedCodes = await Promise.all(
        backupCodes.map(async (code: string) => ({
          user_id: user.id,
          code_hash: await hashBackupCode(code),
          used: false,
        }))
      );

      await supabase.from('backup_codes').insert(hashedCodes);
    }

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}
