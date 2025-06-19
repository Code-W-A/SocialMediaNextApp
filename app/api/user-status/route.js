import { NextResponse } from 'next/server';
import { setUserOnlineStatus } from '@/actions/chat';

export async function POST(request) {
  try {
    const data = await request.json();
    const { userId, action } = data;
    
    if (!userId || action !== 'setOffline') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
    
    // Set user offline
    await setUserOnlineStatus(userId, false);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting offline status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
} 