import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiErrors } from '@/lib/api-error';
import type { User } from '@supabase/supabase-js';

export type AuthResult =
  | {
      user: User;
      error: null;
    }
  | {
      user: null;
      error: ReturnType<typeof ApiErrors.unauthorized>;
    };

export type AdminAuthResult =
  | {
      user: User;
      error: null;
    }
  | {
      user: null;
      error: ReturnType<typeof ApiErrors.unauthorized> | ReturnType<typeof ApiErrors.forbidden>;
    };

/**
 * Validates user authentication
 * Returns user on success, error response on failure
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: ApiErrors.unauthorized('Authentication required'),
      };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      user: null,
      error: ApiErrors.unauthorized('Authentication failed'),
    };
  }
}

/**
 * Validates super admin access
 */
export async function requireSuperAdmin(): Promise<AdminAuthResult> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return authResult;
  }

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', authResult.user.id)
      .single();

    if (!userData?.is_super_admin) {
      return {
        user: null,
        error: ApiErrors.forbidden('Super admin access required'),
      };
    }

    return authResult;
  } catch (error) {
    console.error('Super admin check error:', error);
    return {
      user: null,
      error: ApiErrors.forbidden('Access denied'),
    };
  }
}

/**
 * Validates organization access
 */
export async function requireOrganizationAccess(
  organizationId: string
): Promise<AdminAuthResult> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return authResult;
  }

  try {
    const supabase = await createClient();
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', authResult.user.id)
      .single();

    if (!membership) {
      return {
        user: null,
        error: ApiErrors.forbidden('Organization access required'),
      };
    }

    return authResult;
  } catch (error) {
    console.error('Organization access check error:', error);
    return {
      user: null,
      error: ApiErrors.forbidden('Access denied'),
    };
  }
}
