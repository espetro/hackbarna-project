# TetrisTravel - Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd tetristravel
npm install
```

## Step 2: Set Up Environment

```bash
# Copy the example environment file
cp .env.local.example .env.local
```

Edit `.env.local` and add your Mapbox token:

```env
NEXT_PUBLIC_MAPBOX_KEY=pk.your_actual_mapbox_token_here
```

**Get a free Mapbox token**: [mapbox.com/account/access-tokens](https://account.mapbox.com/access-tokens/)

## Step 3: Run the App

```bash
npm run dev
```

Visit: **http://localhost:3000**

## That's It! 🎉

The app will work with mock data. You can:

1. Skip or go through the onboarding screens
2. Enter a search query (e.g., "I want a food experience in Paris")
3. View recommendations on an interactive map
4. Book an experience
5. See the confirmation page

## Optional: Add Videos

For the full experience, add video files to `public/videos/`:
- `onboarding-1.mp4`
- `onboarding-2.mp4`
- `onboarding-3.mp4`

Free video sources:
- [Pexels](https://www.pexels.com/videos/)
- [Pixabay](https://pixabay.com/videos/)

## Need Help?

See the full [README.md](./README.md) for detailed documentation.

## Testing the App

Try these search queries:
- "I have 3 hours in Paris and want a food experience"
- "Looking for art and culture activities"
- "Wine tasting experience"
