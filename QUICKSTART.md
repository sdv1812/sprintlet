# Quick Start Guide - Sprintlet

## 🚀 Get Started in 3 Minutes

### Step 1: Get Redis Credentials (2 minutes)

1. Visit **https://console.upstash.com/**
2. Sign up (free)
3. Click **"Create Database"**
4. Select any region → Click **"Create"**
5. Copy these two values:
   - **UPSTASH_REDIS_REST_URL** (looks like: `https://xxx.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (long string)

### Step 2: Add Credentials (30 seconds)

Open `.env.local` and paste your credentials:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### Step 3: Run the App (30 seconds)

```bash
npm run dev
```

Open **http://localhost:3000** 🎉

## 🎮 Try Planning Poker

1. Click **"Planning Poker"**
2. Enter your name: `Alice`
3. Click **"Create Room"**
4. Copy the room code (e.g., `AB12CD34`)
5. Open a new incognito window
6. Paste the room code and join as `Bob`
7. Both vote on a story
8. Click **"Reveal Votes"**
9. See the statistics!

## 📊 Try Capacity Calculator

1. Click **"Capacity Calculator"**
2. Leave sprint days as `10`
3. Add a location: `Office A`, holidays: `2`, leave: `1`
4. Add team members:
   - `Alice`, leave: `2`
   - `Bob`, leave: `0`
5. Set focus factor: `80`
6. Set meetings: `2` hours/day
7. Click **"Calculate Capacity"**
8. See the results!

## 🌐 Deploy to Vercel (Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted
# Then deploy to production
vercel --prod
```

## ✅ You're All Set!

- Planning Poker: Real-time team estimation
- Capacity Calculator: Sprint planning tool
- No authentication needed
- Mobile-friendly
- Dark mode included

## 📚 More Info

- **README.md** - Full documentation
- **IMPLEMENTATION.md** - Technical details
- **NEXT_STEPS.md** - Detailed setup guide

## ⚡ Commands

```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm run lint        # Check code quality
npm run type-check  # Check TypeScript
```

Enjoy using Sprintlet! 🎉
