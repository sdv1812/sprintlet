# Next Steps

## To Start Using Sprintlet

### 1. Set Up Upstash Redis (Required)

The app needs a Redis database to store room data. Get one for free:

1. Go to https://console.upstash.com/
2. Sign up / Log in
3. Click "Create Database"
4. Choose a region (any will work)
5. Copy the following from your database:
   - **REST URL**
   - **REST TOKEN**

### 2. Configure Environment Variables

Edit `.env.local` file:

```bash
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 3. Start the Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 4. Test Planning Poker

1. Click "Planning Poker" on home page
2. Enter your name
3. Create a room
4. Copy the room code
5. Open in another browser/incognito to join as another user
6. Vote on a story
7. Click "Reveal Votes"
8. See statistics
9. Click "Reset Votes" for next story

### 5. Test Capacity Calculator

1. Click "Capacity Calculator" on home page
2. Set sprint days (default: 10)
3. Add locations with holidays
4. Add team members
5. Click "Calculate Capacity"
6. View results

## Deploy to Vercel

### Option 1: Via Vercel Dashboard

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your repository
5. Add environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
6. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
npm i -g vercel
vercel

# Set environment variables
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN

# Deploy
vercel --prod
```

## Troubleshooting

### Dev server won't start

- Make sure port 3000 is available
- Check that all dependencies are installed: `npm install`

### Redis connection errors

- Verify environment variables in `.env.local`
- Make sure Redis URL and token are correct
- Check Upstash console that database is active

### Build errors

- Run `npm run type-check` to see TypeScript errors
- Run `npm run lint` to see linting issues
- Make sure all dependencies are installed

### Real-time updates not working

- Check browser console for errors
- Verify SSE endpoint is accessible
- Check network tab for SSE connection

## Development Tips

### Prettier formatting

```bash
npx prettier --write "src/**/*.{ts,tsx}"
```

### Type checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Production build

```bash
npm run build
npm start
```

## What's Included

✅ Complete Planning Poker implementation
✅ Complete Capacity Calculator implementation
✅ Real-time updates via Server-Sent Events
✅ Redis state management
✅ TypeScript with strict mode
✅ ESLint configuration
✅ Prettier configuration
✅ Tailwind CSS
✅ Mobile-responsive design
✅ Dark mode support
✅ Production-ready build
✅ Comprehensive documentation

## Need Help?

- Check README.md for detailed documentation
- Check IMPLEMENTATION.md for technical details
- Review the code comments
- Open an issue on GitHub
