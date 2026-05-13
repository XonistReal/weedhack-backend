import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Check users.json in Blob
    const { blobs } = await list();
    const usersBlob = blobs.find(b => b.pathname === 'users.json');
    
    if (usersBlob) {
      const response = await fetch(usersBlob.url);
      const users = await response.json();
      
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        return NextResponse.json({ success: true, token: 'weedhack_session_token_1337', isAdmin: !!user.isAdmin });
      }
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
