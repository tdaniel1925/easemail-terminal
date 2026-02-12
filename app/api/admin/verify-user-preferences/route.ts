import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API endpoint to verify user_preferences database state
 * Used by E2E tests to confirm all users have preferences records
 *
 * GET /api/admin/verify-user-preferences
 *
 * Returns:
 * - totalUsers: Number of users in the system
 * - usersWithPreferences: Number of users with user_preferences
 * - usersWithoutPreferences: Number of users missing user_preferences
 * - recentlyCreatedUsers: Array of recently created users and their status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate and verify super admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if super admin
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin only' },
        { status: 403 }
      );
    }

    // Get all users
    const { data: allUsers, error: usersError } = (await supabase
      .from('users')
      .select('id, email, name, created_at, is_super_admin')) as {
      data: Array<{ id: string; email: string; name: string; created_at: string; is_super_admin: boolean }> | null;
      error: any;
    };

    if (usersError || !allUsers) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get all user_preferences
    const { data: allPreferences, error: prefsError } = (await supabase
      .from('user_preferences')
      .select('user_id, onboarding_completed, created_at')) as {
      data: Array<{ user_id: string; onboarding_completed: boolean; created_at: string }> | null;
      error: any;
    };

    if (prefsError) {
      console.error('Error fetching user_preferences:', prefsError);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // Create a map for quick lookup
    const prefsMap = new Map(
      (allPreferences || []).map(pref => [pref.user_id, pref])
    );

    // Find users without preferences
    const usersWithoutPreferences = allUsers.filter(
      user => !prefsMap.has(user.id)
    );

    // Get recently created users (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentUsers = allUsers
      .filter(u => new Date(u.created_at) > oneDayAgo)
      .map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        created_at: u.created_at,
        is_super_admin: u.is_super_admin,
        has_preferences: prefsMap.has(u.id),
        onboarding_completed: prefsMap.get(u.id)?.onboarding_completed || false,
        preferences_created_at: prefsMap.get(u.id)?.created_at || null,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      totalUsers: allUsers.length,
      usersWithPreferences: allUsers.length - usersWithoutPreferences.length,
      usersWithoutPreferences: usersWithoutPreferences.length,
      missingPreferencesUsers: usersWithoutPreferences.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
      })),
      recentlyCreatedUsers: recentUsers,
      summary: {
        allUsersHavePreferences: usersWithoutPreferences.length === 0,
        percentageWithPreferences: allUsers.length > 0
          ? ((allUsers.length - usersWithoutPreferences.length) / allUsers.length * 100).toFixed(2) + '%'
          : '0%',
      },
    });
  } catch (error) {
    console.error('Verify user preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
