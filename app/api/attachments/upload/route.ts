import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const attachments: Array<{
      filename: string;
      content: string;
      content_type: string;
      size: number;
    }> = [];

    // Convert files to base64 for Nylas API
    for (const file of files) {
      try {
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Content = buffer.toString('base64');

        attachments.push({
          filename: file.name,
          content: base64Content,
          content_type: file.type || 'application/octet-stream',
          size: file.size,
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        // Continue with other files
      }
    }

    if (attachments.length === 0) {
      return NextResponse.json({ error: 'Failed to process any attachments' }, { status: 500 });
    }

    return NextResponse.json({
      message: `${attachments.length} file(s) processed successfully`,
      attachments,
    });
  } catch (error) {
    console.error('Upload attachments error:', error);
    return NextResponse.json(
      { error: 'Failed to upload attachments' },
      { status: 500 }
    );
  }
}
