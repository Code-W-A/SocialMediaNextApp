import { NextResponse } from 'next/server';
import { setUserOffline } from '@/actions/user';

export async function POST(request) {
  try {
    const data = await request.json();
    const { userId, status } = data;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (status === 'offline') {
      await setUserOffline(userId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user presence:', error);
    return NextResponse.json(
      { error: 'Failed to update presence' },
      { status: 500 }
    );
  }
} 