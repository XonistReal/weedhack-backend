import { NextResponse } from 'next/server';

// This would ideally come from a database or Vercel KV
let currentConfig = {
  version: "1.0.0",
  changelog: "Last Update: 2026-05-13\n- Fixed UI animations\n- Added smooth caret\n- Improved injector stability\n- Added live backend support",
  dll_url: "https://your-dll-link.com/weedhack.dll"
};

export async function GET(request: Request) {
  // Check for auth header (simple mock for now)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer weedhack_session_token_1337') {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(currentConfig);
}

// Admin can update this via POST
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer weedhack_session_token_1337') {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const newConfig = await request.json();
  currentConfig = { ...currentConfig, ...newConfig };
  
  return NextResponse.json({ success: true, message: "Config updated" });
}
