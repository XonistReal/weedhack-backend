import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  const oldUrl = searchParams.get('oldUrl');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Check auth
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer weedhack_session_token_1337') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete old DLL if exists
  if (oldUrl && oldUrl.includes('blob.vercel-storage.com')) {
    try {
      await del(oldUrl);
    } catch (e) {
      console.error("Failed to delete old blob", e);
    }
  }

  if (request.body) {
    const blob = await put(filename, request.body, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } else {
    return NextResponse.json({ error: 'No body provided' }, { status: 400 });
  }
}
