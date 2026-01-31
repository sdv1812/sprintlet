import { redis, ROOM_TTL, INACTIVE_THRESHOLD } from './redis';
import { RoomSnapshot, RoomMeta, Member, FIBONACCI_DECK } from '@/types';
import { nanoid } from 'nanoid';

export async function createRoom(roomName: string): Promise<string> {
  const roomCode = nanoid(8);
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
  const [metaData, membersHash, votesHash] = await Promise.all([
    redis.get(`room:${roomCode}:meta`),
    redis.hgetall(`room:${roomCode}:members`),
    redis.hgetall(`room:${roomCode}:votes`),
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
      redis.hdel(`room:${roomCode}:members`, ...inactiveClientIds),
      redis.hdel(`room:${roomCode}:votes`, ...inactiveClientIds),
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
  const snapshot = await getRoomSnapshot(roomCode);
  if (!snapshot) return null;

  const member: Member = {
    name,
    joinedAt: Date.now(),
    lastSeenAt: Date.now(),
  };

  await Promise.all([
    redis.hset(`room:${roomCode}:members`, { [clientId]: JSON.stringify(member) }),
    redis.expire(`room:${roomCode}:meta`, ROOM_TTL),
    redis.expire(`room:${roomCode}:members`, ROOM_TTL),
    redis.expire(`room:${roomCode}:votes`, ROOM_TTL),
  ]);

  return getRoomSnapshot(roomCode);
}

export async function updateLastSeen(roomCode: string, clientId: string): Promise<void> {
  const memberData = await redis.hget(`room:${roomCode}:members`, clientId);
  if (memberData) {
    // Upstash Redis may return parsed object or string
    const member: Member = typeof memberData === 'string' ? JSON.parse(memberData) : memberData;
    member.lastSeenAt = Date.now();
    await redis.hset(`room:${roomCode}:members`, { [clientId]: JSON.stringify(member) });
  }
}

export async function castVote(
  roomCode: string,
  clientId: string,
  vote: string
): Promise<RoomSnapshot | null> {
  const snapshot = await getRoomSnapshot(roomCode);
  if (!snapshot) return null;

  await Promise.all([
    redis.hset(`room:${roomCode}:votes`, { [clientId]: vote }),
    updateLastSeen(roomCode, clientId),
    refreshTTL(roomCode),
  ]);

  return getRoomSnapshot(roomCode);
}

export async function revealVotes(
  roomCode: string,
  clientId: string
): Promise<RoomSnapshot | null> {
  const snapshot = await getRoomSnapshot(roomCode);
  if (!snapshot) return null;

  const meta = snapshot.meta;
  meta.revealed = true;
  meta.version += 1;
  meta.updatedAt = Date.now();

  await Promise.all([
    redis.set(`room:${roomCode}:meta`, JSON.stringify(meta), { ex: ROOM_TTL }),
    updateLastSeen(roomCode, clientId),
  ]);

  return getRoomSnapshot(roomCode);
}

export async function resetVotes(roomCode: string, clientId: string): Promise<RoomSnapshot | null> {
  const snapshot = await getRoomSnapshot(roomCode);
  if (!snapshot) return null;

  const meta = snapshot.meta;
  meta.revealed = false;
  meta.version += 1;
  meta.updatedAt = Date.now();

  await Promise.all([
    redis.set(`room:${roomCode}:meta`, JSON.stringify(meta), { ex: ROOM_TTL }),
    redis.del(`room:${roomCode}:votes`),
    updateLastSeen(roomCode, clientId),
  ]);

  return getRoomSnapshot(roomCode);
}

export async function updateStoryTitle(
  roomCode: string,
  clientId: string,
  storyTitle: string
): Promise<RoomSnapshot | null> {
  const snapshot = await getRoomSnapshot(roomCode);
  if (!snapshot) return null;

  const meta = snapshot.meta;
  meta.storyTitle = storyTitle;
  meta.version += 1;
  meta.updatedAt = Date.now();

  await Promise.all([
    redis.set(`room:${roomCode}:meta`, JSON.stringify(meta), { ex: ROOM_TTL }),
    updateLastSeen(roomCode, clientId),
  ]);

  return getRoomSnapshot(roomCode);
}

export async function leaveMember(roomCode: string, clientId: string): Promise<void> {
  await Promise.all([
    redis.hdel(`room:${roomCode}:members`, clientId),
    redis.hdel(`room:${roomCode}:votes`, clientId),
  ]);
}

async function refreshTTL(roomCode: string): Promise<void> {
  await Promise.all([
    redis.expire(`room:${roomCode}:meta`, ROOM_TTL),
    redis.expire(`room:${roomCode}:members`, ROOM_TTL),
    redis.expire(`room:${roomCode}:votes`, ROOM_TTL),
  ]);
}
