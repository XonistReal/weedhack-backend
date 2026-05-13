import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Check credentials (hardcoded as requested)
    if (username === 'admin' && password === 'Jo3l2006!') {
      // In a real app, you'd generate a JWT here
      return NextResponse.json({ 
        success: true, 
        token: "weedhack_session_token_1337", // Mock token
        message: "Logged in successfully" 
      });
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
