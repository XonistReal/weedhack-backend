import { put, list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer weedhack_session_token_1337') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { blobs } = await list();
    const usersBlob = blobs.find(b => b.pathname === 'users.json');
    if (usersBlob) {
      const response = await fetch(usersBlob.url);
      return NextResponse.json(await response.json());
    }
  } catch (e) {}
  
  return NextResponse.json([]);
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer weedhack_session_token_1337') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, password, action, isAdmin } = body;
    
    // Get current users
    let users: any[] = [];
    const { blobs } = await list();
    const usersBlob = blobs.find(b => b.pathname === 'users.json');
    if (usersBlob) {
      const response = await fetch(usersBlob.url);
      users = await response.json();
      await del(usersBlob.url); // Prepare for overwrite
    }

    if (action === 'add') {
      users.push({ username, password, isAdmin: !!isAdmin });
    } else if (action === 'delete') {
      users = users.filter(u => u.username !== username);
    }

    await put('users.json', JSON.stringify(users), {
      access: 'public',
      addRandomSuffix: false // We keep it constant for users.json
    });

    return NextResponse.json({ success: true, users });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Error managing users" }, { status: 500 });
  }
}
