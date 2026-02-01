import { redis, ROOM_TTL, INACTIVE_THRESHOLD } from './redis';
import { RoomSnapshot, RoomMeta, Member, FIBONACCI_DECK } from '@/types';
import { nanoid } from 'nanoid';

export async function createRoom(roomName: string): Promise<string> {
  const roomCode = nanoid(8).toUpperCase();
  const meta: RoomMeta = {
    roomName,
    deck: [...FIBONACCI_DECK],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    revealed: false,
    storyTitle: '',
    version: 0,
  };

  await redis.set(`room:${roomCode}:meta`, JSON.stringify(meta), { ex: ROOM_TTL });

  return roomCode;
}

export async function getRoomSnapshot(roomCode: string): Promise<RoomSnapshot | null> {
  const normalizedRoomCode = roomCode.toUpperCase();
  const [metaData, membersHash, votesHash] = await Promise.all([
    redis.get(`room:${normalizedRoomCode}:meta`),
    redis.hgetall(`room:${normalizedRoomCode}:members`),
    redis.hgetall(`room:${normalizedRoomCode}:votes`),
  ]);

  if (!metaData) return null;

  // Upstash Redis may return parsed object or string
  const meta: RoomMeta = typeof metaData === 'string' ? JSON.parse(metaData) : metaData;

  // Parse members from hash
  const members: Record<string, Member> = {};
  if (membersHash) {
    for (const [clientId, memberData] of Object.entries(membersHash)) {
      if (memberData) {
        // Upstash Redis may return parsed object or string
        members[clientId] = typeof memberData === 'string' ? JSON.parse(memberData) : memberData;
      }
    }
  }

  // Clean up inactive members
  const now = Date.now();
  const activeMembers: Record<string, Member> = {};
  const inactiveClientIds: string[] = [];

  for (const [clientId, member] of Object.entries(members)) {
    if (now - member.lastSeenAt < INACTIVE_THRESHOLD) {
      activeMembers[clientId] = member;
    } else {
      inactiveClientIds.push(clientId);
    }
  }

  // Remove inactive members
  if (inactiveClientIds.length > 0) {
    await Promise.all([
      redis.hdel(`room:${normalizedRoomCode}:members`, ...inactiveClientIds),
      redis.hdel(`room:${normalizedRoomCode}:votes`, ...inactiveClientIds),
    ]);
  }

  const votes: Record<string, string> = {};
  if (votesHash) {
    for (const [clientId, vote] of Object.entries(votesHash)) {
      // Upstash may return votes as strings or numbers, so convert to string
      if (vote != null && activeMembers[clientId]) {
        votes[clientId] = String(vote);
      }
    }
  }

  return {
    meta,
    members: activeMembers,
    votes,
    version: meta.version,
  };
}

export async function joinMember(
  roomCode: string,
  clientId: string,
  name: string
): Promise<RoomSnapshot | null> {
  const normalizedRoomCode = roomCode.toUpperCase();
  const snapshot = await getRoomSnapshot(normalizedRoomCode);
  if (!snapshot) return null;

  const member: Member = {
    name,
    joinedAt: Date.now(),
    lastSeenAt: Date.now(),
  };

  await Promise.all([
    redis.hset(`room:${normalizedRoomCode}:members`, { [clientId]: JSON.stringify(member) }),
    redis.expire(`room:${normalizedRoomCode}:meta`, ROOM_TTL),
    redis.expire(`room:${normalizedRoomCode}:members`, ROOM_TTL),
    redis.expire(`room:${normalizedRoomCode}:votes`, ROOM_TTL),
  ]);

  return getRoomSnapshot(normalizedRoomCode);
}

export async function updateLastSeen(roomCode: string, clientId: string): Promise<void> {
  const normalizedRoomCode = roomCode.toUpperCase();
  const memberData = await redis.hget(`room:${normalizedRoomCode}:members`, clientId);
  if (memberData) {
    // Upstash Redis may return parsed object or string
    const member: Member = typeof memberData === 'string' ? JSON.parse(memberData) : memberData;
    member.lastSeenAt = Date.now();
    await redis.hset(`room:${normalizedRoomCode}:members`, { [clientId]: JSON.stringify(member) });
  }
}

export async function castVote(
  roomCode: string,
  clientId: string,
  vote: string
): Promise<RoomSnapshot | null> {
  const normalizedRoomCode = roomCode.toUpperCase();
  const snapshot = await getRoomSnapshot(normalizedRoomCode);
  if (!snapshot) return null;

  await Promise.all([
    redis.hset(`room:${normalizedRoomCode}:votes`, { [clientId]: vote }),
    updateLastSeen(normalizedRoomCode, clientId),
    refreshTTL(normalizedRoomCode),
  ]);

  return getRoomSnapshot(normalizedRoomCode);
}

export async function revealVotes(
  roomCode: string,
  clientId: string
): Promise<RoomSnapshot | null> {
  const normalizedRoomCode = roomCode.toUpperCase();
  const snapshot = await getRoomSnapshot(normalizedRoomCode);
  if (!snapshot) return null;

  const meta = snapshot.meta;
  meta.revealed = true;
  meta.version += 1;
  meta.updatedAt = Date.now();

  await Promise.all([
    redis.set(`room:${normalizedRoomCode}:meta`, JSON.stringify(meta), { ex: ROOM_TTL }),
    updateLastSeen(normalizedRoomCode, clientId),
  ]);

  return getRoomSnapshot(normalizedRoomCode);
}

export async function resetVotes(roomCode: string, clientId: string): Promise<RoomSnapshot | null> {
  const normalizedRoomCode = roomCode.toUpperCase();
  const snapshot = await getRoomSnapshot(normalizedRoomCode);
  if (!snapshot) return null;

  const meta = snapshot.meta;
  meta.revealed = false;
  meta.version += 1;
  meta.updatedAt = Date.now();

  await Promise.all([
    redis.set(`room:${normalizedRoomCode}:meta`, JSON.stringify(meta), { ex: ROOM_TTL }),
    redis.del(`room:${normalizedRoomCode}:votes`),
    updateLastSeen(normalizedRoomCode, clientId),
  ]);

  return getRoomSnapshot(normalizedRoomCode);
}

export async function updateStoryTitle(
  roomCode: string,
  clientId: string,
  storyTitle: string
): Promise<RoomSnapshot | null> {
  const normalizedRoomCode = roomCode.toUpperCase();
  const snapshot = await getRoomSnapshot(normalizedRoomCode);
  if (!snapshot) return null;

  const meta = snapshot.meta;
  meta.storyTitle = storyTitle;
  meta.version += 1;
  meta.updatedAt = Date.now();

  await Promise.all([
    redis.set(`room:${normalizedRoomCode}:meta`, JSON.stringify(meta), { ex: ROOM_TTL }),
    updateLastSeen(normalizedRoomCode, clientId),
  ]);

  return getRoomSnapshot(normalizedRoomCode);
}

export async function leaveMember(roomCode: string, clientId: string): Promise<void> {
  const normalizedRoomCode = roomCode.toUpperCase();
  await Promise.all([
    redis.hdel(`room:${normalizedRoomCode}:members`, clientId),
    redis.hdel(`room:${normalizedRoomCode}:votes`, clientId),
  ]);
}

async function refreshTTL(roomCode: string): Promise<void> {
  const normalizedRoomCode = roomCode.toUpperCase();
  await Promise.all([
    redis.expire(`room:${normalizedRoomCode}:meta`, ROOM_TTL),
    redis.expire(`room:${normalizedRoomCode}:members`, ROOM_TTL),
    redis.expire(`room:${normalizedRoomCode}:votes`, ROOM_TTL),
  ]);
}
