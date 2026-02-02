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

    const { token, backupCode } = await request.json();

    if (!token && !backupCode) {
      return NextResponse.json(
        { error: 'Either TOTP token or backup code is required' },
        { status: 400 }
      );
    }

    // Get user's 2FA data
    const { data: userData } = (await supabase
      .from('users')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', user.id)
      .single()) as { data: any };

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userData.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    let isValid = false;

    // Verify TOTP token
    if (token && userData.two_factor_secret) {
      isValid = await verifyToken(token, userData.two_factor_secret);
    }

    // Verify backup code if token failed or not provided
    if (!isValid && backupCode) {
      const hashedCode = await hashBackupCode(backupCode);

      const { data: backupCodes } = (await supabase
        .from('backup_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('code_hash', hashedCode)
        .eq('used', false)
        .limit(1)) as { data: any };

      if (backupCodes && backupCodes.length > 0) {
        // Mark backup code as used
        await (supabase as any)
          .from('backup_codes')
          .update({ used: true, used_at: new Date().toISOString() })
          .eq('id', backupCodes[0].id);

        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid TOTP token or backup code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA verification successful',
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
