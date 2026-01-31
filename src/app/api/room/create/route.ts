import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRoom } from '@/lib/room';

const createRoomSchema = z.object({
  roomName: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomName } = createRoomSchema.parse(body);

    const roomCode = await createRoom(roomName);

    return NextResponse.json({ roomCode });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }

    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
