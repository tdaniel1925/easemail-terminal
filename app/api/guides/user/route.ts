import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'html';

    const filePath = format === 'pdf'
      ? join(process.cwd(), 'docs', 'EaseMail-User-Guide.pdf')
      : join(process.cwd(), 'docs', 'EaseMail-User-Guide.html');

    const fileContent = await readFile(filePath);

    const contentType = format === 'pdf'
      ? 'application/pdf'
      : 'text/html';

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="EaseMail-User-Guide.${format}"`,
      },
    });
  } catch (error) {
    console.error('Error serving user guide:', error);
    return NextResponse.json(
      { error: 'Failed to load user guide' },
      { status: 500 }
    );
  }
}
