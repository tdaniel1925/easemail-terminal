import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Check user authentication and role
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has OWNER or ADMIN role
    const { data: orgMembership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')
      .maybeSingle() as { data: { role: string } | null };

    if (!orgMembership || !['OWNER', 'ADMIN'].includes(orgMembership.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'html';

    const filePath = format === 'pdf'
      ? join(process.cwd(), 'docs', 'Organization-Admin-User-Guide.pdf')
      : join(process.cwd(), 'docs', 'Organization-Admin-User-Guide.html');

    const fileContent = await readFile(filePath);

    const contentType = format === 'pdf'
      ? 'application/pdf'
      : 'text/html';

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="Organization-Admin-User-Guide.${format}"`,
      },
    });
  } catch (error) {
    console.error('Error serving admin guide:', error);
    return NextResponse.json(
      { error: 'Failed to load admin guide' },
      { status: 500 }
    );
  }
}
