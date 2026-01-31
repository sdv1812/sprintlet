# Sprintlet

Agile Ceremonies Made Simple - A Next.js application for Planning Poker and Capacity Calculator.

## Features

### 🃏 Planning Poker

- **Real-time collaboration**: Team-based story point estimation with live updates
- **Fibonacci deck**: Classic estimation values (0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ☕)
- **No authentication required**: Join rooms with just a name
- **Automatic reconnection**: Seamless reconnection on network interruptions
- **Vote statistics**: Average, median, min, max calculations when revealed
- **Room persistence**: Rooms expire after 8 hours of inactivity

### 📊 Capacity Calculator

- **Multi-location support**: Handle distributed teams across different locations
- **Comprehensive inputs**:
  - Sprint days (default: 10)
  - Multiple locations with individual public holidays and leave days
  - Focus factor (optional %)
  - Meeting hours per day (optional)
  - Team members with individual leave days
- **Detailed output**:
  - Capacity per person (in hours)
  - Total team capacity
  - Suggested commitment
- **Local storage**: Form state persists across sessions

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: Upstash Redis (serverless)
- **Real-time**: Server-Sent Events (SSE)
- **Validation**: Zod
- **ID Generation**: nanoid

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An Upstash Redis account (free tier available)

### 1. Set Up Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database (choose any region)
3. Copy the **REST URL** and **REST Token** from the database details

### 2. Clone and Install

```bash
# Install dependencies
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Upstash credentials:

```env
UPSTASH_REDIS_REST_URL=your_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy!

**Note on WebSockets vs SSE**: This application uses Server-Sent Events (SSE) for real-time updates instead of WebSockets. SSE is more reliable on serverless platforms like Vercel and provides one-way server-to-client communication, which is sufficient for our use case. Client-to-server communication happens via HTTP POST requests.

### Environment Variables

| Variable                   | Description                  | Required |
| -------------------------- | ---------------------------- | -------- |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST API URL   | Yes      |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST API Token | Yes      |

## Project Structure

```
sprintlet/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── poker/
│   │   │   └── page.tsx          # Planning Poker landing
│   │   ├── capacity/
│   │   │   └── page.tsx          # Capacity Calculator
│   │   ├── room/
│   │   │   └── [code]/
│   │   │       └── page.tsx      # Planning Poker room
│   │   └── api/
│   │       ├── room/
│   │       │   ├── create/       # Create room endpoint
│   │       │   └── [code]/       # Get room snapshot
│   │       └── sse/              # SSE endpoint for real-time
│   ├── lib/
│   │   ├── redis.ts              # Redis client
│   │   ├── room.ts               # Room state operations
│   │   ├── capacity.ts           # Capacity calculations
│   │   └── client.ts             # Client-side utilities
│   └── types/
│       └── index.ts              # TypeScript types
├── .env.example                  # Environment template
├── .env.local                    # Your local config (git-ignored)
└── package.json
```

## Architecture

### Data Storage (Redis)

The application uses Upstash Redis with the following key structure:

- `room:{code}:meta` - Room metadata (JSON)
  - roomName, deck, createdAt, updatedAt, revealed, storyTitle, version
- `room:{code}:members` - Hash of members
  - Key: clientId, Value: JSON(name, joinedAt, lastSeenAt)
- `room:{code}:votes` - Hash of votes
  - Key: clientId, Value: vote value

All keys use TTL (Time To Live) of 8 hours, refreshed on activity.

### Real-time Sync Strategy

1. **Server-Sent Events (SSE)**: One-way server-to-client push
   - Clients open SSE connection: `GET /api/sse?roomCode=xxx&clientId=yyy`
   - Server pushes updates when room state changes
2. **HTTP POST for Actions**: Client-to-server communication
   - `POST /api/sse` with message type (JOIN_ROOM, CAST_VOTE, REVEAL, etc.)
   - Server updates Redis, then broadcasts to all SSE connections

3. **Message Protocol**:
   - Client → Server: JOIN_ROOM, LEAVE_ROOM, CAST_VOTE, REVEAL, RESET, UPDATE_STORY, HEARTBEAT
   - Server → Client: ROOM_SNAPSHOT (full state), ROOM_PATCH (delta), ERROR

4. **Version Control**: Each room has a monotonically increasing version number to detect stale updates

5. **Heartbeat**: Every 30 seconds to update lastSeenAt and maintain connection

6. **Auto-cleanup**: Members inactive for > 2 minutes are automatically removed

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Code formatting

## Usage Guide

### Planning Poker

1. **Create a Room**:
   - Enter your name and optional room name
   - Click "Create Room"
   - Share the room code with your team

2. **Join a Room**:
   - Enter room code
   - Optionally enter your name (uses saved name if available)
   - Click "Join Room"

3. **Estimate Stories**:
   - Enter a story title (optional)
   - Each team member selects their estimate card
   - When ready, click "Reveal Votes"
   - View statistics (average, median, min, max)
   - Click "Reset Votes" to estimate the next story

### Capacity Calculator

1. **Configure Sprint**:
   - Set sprint days (default: 10)
   - Add locations with holidays and general leave days
   - Optionally set focus factor (%) and meeting hours per day

2. **Add Team Members**:
   - Add each team member with their name
   - Enter personal leave days for each member

3. **Calculate**:
   - Click "Calculate Capacity"
   - View individual and total team capacity
   - Results are saved to local storage

## License

MIT
