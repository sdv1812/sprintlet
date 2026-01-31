export const FIBONACCI_DECK = [
  '0',
  '0.5',
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '20',
  '40',
  '100',
  '?',
  '☕',
] as const;

export type DeckValue = (typeof FIBONACCI_DECK)[number];

export interface RoomMeta {
  roomName: string;
  deck: typeof FIBONACCI_DECK;
  createdAt: number;
  updatedAt: number;
  revealed: boolean;
  storyTitle: string;
  version: number;
}

export interface Member {
  name: string;
  joinedAt: number;
  lastSeenAt: number;
}

export interface RoomSnapshot {
  meta: RoomMeta;
  members: Record<string, Member>;
  votes: Record<string, string>;
  version: number;
}

// WebSocket message types
export type ClientMessage =
  | { type: 'JOIN_ROOM'; roomCode: string; clientId: string; name: string }
  | { type: 'LEAVE_ROOM'; roomCode: string; clientId: string }
  | { type: 'CAST_VOTE'; roomCode: string; clientId: string; vote: string }
  | { type: 'REVEAL'; roomCode: string; clientId: string }
  | { type: 'RESET'; roomCode: string; clientId: string }
  | { type: 'UPDATE_STORY'; roomCode: string; clientId: string; storyTitle: string }
  | { type: 'HEARTBEAT'; roomCode: string; clientId: string };

export type ServerMessage =
  | { type: 'ROOM_SNAPSHOT'; roomCode: string; snapshot: RoomSnapshot }
  | { type: 'ROOM_PATCH'; roomCode: string; patch: Partial<RoomSnapshot> }
  | { type: 'ERROR'; message: string; code?: string };

// Capacity Calculator types
export interface Location {
  id: string;
  name: string;
  publicHolidays: number;
  leaveDays: number;
  numEngineers: number;
}

export interface CapacityInput {
  sprintDays: number;
  averageVelocity: number;
  locations: Location[];
}

export interface CapacityResult {
  totalEngineers: number;
  maxPersonDays: number;
  unavailableDays: number;
  availablePersonDays: number;
  availabilityPercentage: number;
  projectedCapacity: number;
}
