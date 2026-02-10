import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/app/inbox';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    // Check if this is a password recovery flow
    const type = requestUrl.searchParams.get('type');
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/auth/update-password', request.url));
    }

    return NextResponse.redirect(new URL(next, request.url));
  }

  // Handle magic link (for impersonation, etc.)
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      console.error('Magic link verification error:', error);
      return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
    }

    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/auth/update-password', request.url));
    }

    return NextResponse.redirect(new URL(next, request.url));
  }

  // No code or token provided, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}
