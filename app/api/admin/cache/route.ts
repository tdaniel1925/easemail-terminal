import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create service client for super admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user is super admin
    const { data: userData } = (await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    // Revalidate common paths to clear Next.js cache
    const pathsToRevalidate = [
      '/',
      '/app',
      '/app/inbox',
      '/app/organization',
      '/app/admin/organizations',
      '/app/admin/users',
      '/app/admin/invoices',
      '/app/admin/payment-methods',
      '/app/admin/revenue-snapshot',
      '/app/admin/settings',
    ];

    pathsToRevalidate.forEach((path) => {
      try {
        revalidatePath(path, 'layout');
        revalidatePath(path, 'page');
      } catch (error) {
        console.error(`Failed to revalidate path ${path}:`, error);
      }
    });

    // Revalidate all common tags
    const tagsToRevalidate = [
      'organizations',
      'users',
      'invoices',
      'payments',
      'settings',
      'messages',
    ];

    for (const tag of tagsToRevalidate) {
      try {
        // Next.js 16 requires cache profile as second argument
        revalidateTag(tag, 'max');
      } catch (error) {
        console.error(`Failed to revalidate tag ${tag}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      clearedPaths: pathsToRevalidate.length,
      clearedTags: tagsToRevalidate.length,
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
