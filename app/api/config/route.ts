import { put, list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

const DEFAULT_CONFIG = {
  version: "1.0.0",
  changelog: "Last Update: 2026-05-13\n- Fixed UI animations\n- Added smooth caret\n- Improved injector stability\n- Added live backend support",
  dll_url: "https://your-dll-link.com/weedhack.dll",
  history: []
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer weedhack_session_token_1337') {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Search more broadly for any config file
    const { blobs } = await list();
    const configBlob = blobs.find(b => b.pathname.startsWith('config'));
    
    if (configBlob) {
      const response = await fetch(configBlob.url);
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    console.error("Blob read error", e);
  }
  
  return NextResponse.json(DEFAULT_CONFIG);
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer weedhack_session_token_1337') {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const newConfig = await request.json();
    
    // Get existing to preserve history
    let existing: any = DEFAULT_CONFIG;
    const { blobs } = await list({ prefix: 'config.json' });
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      existing = await response.json();
      // Delete all old config files
      for (const blob of blobs) {
        await del(blob.url);
      }
    }

    const history = existing.history || [];
    if (existing.changelog !== newConfig.changelog) {
      history.unshift({
        content: existing.changelog,
        date: existing.last_updated || "Legacy"
      });
    }

    const finalConfig = {
      ...newConfig,
      history: history.slice(0, 10)
    };

    // Save as new blob
    await put('config.json', JSON.stringify(finalConfig), {
      access: 'public',
      addRandomSuffix: true // Vercel Blob requirement
    });

    return NextResponse.json({ success: true, message: "Config saved to Blob" });
  } catch (e) {
    console.error("Blob write error", e);
    return NextResponse.json({ success: false, message: "Blob storage error" }, { status: 500 });
  }
}
