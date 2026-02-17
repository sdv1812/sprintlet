import { NextRequest } from 'next/server';
import {
  getRoomSnapshot,
  joinMember,
  castVote,
  revealVotes,
  resetVotes,
  updateStoryTitle,
  leaveMember,
  updateLastSeen,
} from '@/lib/room';
import { ServerMessage, FIBONACCI_DECK } from '@/types';

// Store active connections per room
const roomConnections = new Map<string, Set<ReadableStreamDefaultController>>();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get('roomCode');
  const clientId = searchParams.get('clientId');
  const snapshotOnly = searchParams.get('snapshot') === 'true';

  if (!roomCode || !clientId) {
    return new Response('Missing roomCode or clientId', { status: 400 });
  }

  // If snapshot mode, just return the current room state as JSON
  if (snapshotOnly) {
    try {
      const snapshot = await getRoomSnapshot(roomCode);
      return Response.json({ snapshot });
    } catch (error) {
      console.error('Error getting room snapshot:', error);
      return Response.json({ snapshot: null }, { status: 500 });
    }
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the room
      if (!roomConnections.has(roomCode)) {
        roomConnections.set(roomCode, new Set());
      }
      roomConnections.get(roomCode)!.add(controller);

      // Send initial connection message
      sendMessage(controller, {
        type: 'ROOM_SNAPSHOT',
        roomCode,
        snapshot: {
          meta: {
            roomName: '',
            deck: [...FIBONACCI_DECK],
            createdAt: 0,
            updatedAt: 0,
            revealed: false,
            storyTitle: '',
            version: 0,
          },
          members: {},
          votes: {},
          version: 0,
        },
      });

      // Set up heartbeat
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'HEARTBEAT' })}\n\n`);
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        const connections = roomConnections.get(roomCode);
        if (connections) {
          connections.delete(controller);
          if (connections.size === 0) {
            roomConnections.delete(roomCode);
          }
        }
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, roomCode, clientId } = body;

    let snapshot = null;
    let message: ServerMessage | null = null;

    switch (type) {
      case 'JOIN_ROOM': {
        const { name } = body;
        snapshot = await joinMember(roomCode, clientId, name);
        if (snapshot) {
          message = { type: 'ROOM_SNAPSHOT', roomCode, snapshot };
        }
        break;
      }

      case 'CAST_VOTE': {
        const { vote } = body;
        console.log('CAST_VOTE received:', { roomCode, clientId, vote });
        snapshot = await castVote(roomCode, clientId, vote);
        console.log('Vote cast result, snapshot exists:', !!snapshot);
        if (snapshot) {
          message = { type: 'ROOM_SNAPSHOT', roomCode, snapshot };
        }
        break;
      }

      case 'REVEAL': {
        snapshot = await revealVotes(roomCode, clientId);
        if (snapshot) {
          message = { type: 'ROOM_SNAPSHOT', roomCode, snapshot };
        }
        break;
      }

      case 'RESET': {
        snapshot = await resetVotes(roomCode, clientId);
        if (snapshot) {
          message = { type: 'ROOM_SNAPSHOT', roomCode, snapshot };
        }
        break;
      }

      case 'UPDATE_STORY': {
        const { storyTitle } = body;
        snapshot = await updateStoryTitle(roomCode, clientId, storyTitle);
        if (snapshot) {
          message = { type: 'ROOM_SNAPSHOT', roomCode, snapshot };
        }
        break;
      }

      case 'LEAVE_ROOM': {
        await leaveMember(roomCode, clientId);
        snapshot = await getRoomSnapshot(roomCode);
        if (snapshot) {
          message = { type: 'ROOM_SNAPSHOT', roomCode, snapshot };
        }
        break;
      }

      case 'HEARTBEAT': {
        await updateLastSeen(roomCode, clientId);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      default: {
        return new Response(JSON.stringify({ error: 'Unknown message type' }), {
          status: 400,
        });
      }
    }

    if (message) {
      broadcast(roomCode, message);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
  } catch (error) {
    console.error('Error handling message:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

function sendMessage(controller: ReadableStreamDefaultController, message: ServerMessage) {
  try {
    controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

function broadcast(roomCode: string, message: ServerMessage) {
  const connections = roomConnections.get(roomCode);
  console.log(`Broadcasting to room ${roomCode}, connections:`, connections?.size || 0);
  if (!connections) {
    console.log('No connections found for room', roomCode);
    return;
  }

  connections.forEach((controller) => {
    sendMessage(controller, message);
  });
  console.log(`Broadcasted message type ${message.type} to ${connections.size} clients`);
}
