import { NextRequest, NextResponse } from 'next/server';
import { getRoomSnapshot } from '@/lib/room';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const snapshot = await getRoomSnapshot(code);

    if (!snapshot) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error('Error getting room:', error);
    return NextResponse.json({ error: 'Failed to get room' }, { status: 500 });
  }
}
