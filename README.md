# TetrisTravel

A Next.js web application for savvy business travelers to discover and book local, authentic experiences that fit their schedules.

## Features

- **Onboarding Flow**: Three-step onboarding with full-screen video backgrounds
- **Inspiration Page**: Visual gallery with search functionality for finding experiences
- **Smart Recommendations**: Mock API integration with fallback data
- **Interactive Map**: Mapbox GL integration showing experience locations
- **Booking Flow**: Complete booking and confirmation process
- **Responsive Design**: Mobile-first design using Tailwind CSS

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Mapbox account (free tier available)

## Getting Started

### 1. Installation

```bash
cd tetristravel
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Mapbox token:

```env
NEXT_PUBLIC_MAPBOX_KEY=your_mapbox_token_here
NEXT_PUBLIC_RECOMMENDATIONS_API=https://your-api-endpoint.com/api/recommend
```

**Getting a Mapbox Token:**
1. Sign up at [mapbox.com](https://account.mapbox.com/)
2. Navigate to your [Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copy your default public token or create a new one
4. Paste it in your `.env.local` file

**Note**: The `NEXT_PUBLIC_RECOMMENDATIONS_API` is optional. If not set, the app will use mock data.

### 3. Add Video Assets (Optional)

Place your onboarding videos in `public/videos/`:
- `onboarding-1.mp4`
- `onboarding-2.mp4`
- `onboarding-3.mp4`

See `public/videos/README.md` for video requirements and free sources.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
tetristravel/
├── app/                        # Next.js App Router pages
│   ├── onboarding/            # Onboarding flow (3 steps)
│   ├── inspiration/           # Search and inspiration page
│   ├── recommendations/       # Map view with experience cards
│   ├── confirmation/          # Booking confirmation
│   ├── api/                   # API routes
│   │   └── recommendations/   # Mock recommendations endpoint
│   ├── layout.tsx            # Root layout with providers
│   └── globals.css           # Global styles
├── components/                # Reusable React components
│   ├── VideoBackground.tsx   # Video background component
│   ├── MapView.tsx           # Mapbox integration
│   └── RecommendationCard.tsx # Experience card component
├── lib/                       # Utilities and shared code
│   ├── types.ts              # TypeScript type definitions
│   ├── mockData.ts           # Mock recommendation data
│   └── context/              # React Context for state management
│       └── AppContext.tsx    # Global app state
├── public/                    # Static assets
│   ├── videos/               # Onboarding videos
│   └── images/               # Image assets
└── package.json              # Dependencies and scripts
```

## Application Flow

1. **Landing** (`/`) → Redirects to onboarding
2. **Onboarding** (`/onboarding`) → 3-step carousel with video backgrounds
3. **Inspiration** (`/inspiration`) → Image grid + search input
4. **Recommendations** (`/recommendations`) → Map view with experience cards
5. **Confirmation** (`/confirmation`) → Booking confirmation page

## Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Mapbox GL JS**: Interactive maps via react-map-gl
- **React Context**: State management

## API Integration

### Mock API

The app includes a mock API endpoint at `/api/recommendations` that:
- Accepts POST requests with a `query` field
- Returns filtered recommendations based on keywords
- Falls back to all recommendations if no matches

### Real API Integration

To connect a real backend:

1. Set `NEXT_PUBLIC_RECOMMENDATIONS_API` in `.env.local`
2. Ensure your API accepts POST requests with this format:
   ```json
   {
     "query": "I have 3 hours in Paris..."
   }
   ```
3. Return an array of recommendations matching the `Recommendation` type in `lib/types.ts`

## Development Scripts

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Customization

### Adding More Experiences

Edit `lib/mockData.ts` to add more recommendations:

```typescript
{
  id: 7,
  title: "Your Experience",
  description: "Description here",
  image: "https://images.unsplash.com/...",
  location: { lat: 48.8566, lng: 2.3522 },
  duration: "2 hours",
  price: "€35"
}
```

### Styling

- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Component-level styles: Use Tailwind utility classes

### Map Customization

Edit `components/MapView.tsx`:
- Change map style: Modify `mapStyle` prop
- Adjust initial view: Change `viewState` initial values
- Customize markers: Modify the SVG in the `Marker` component

## Features Roadmap

Future enhancements could include:

- [ ] User authentication
- [ ] Real Google Calendar integration
- [ ] Payment processing
- [ ] User reviews and ratings
- [ ] Saved experiences
- [ ] Email confirmations
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)

## Troubleshooting

### Map Not Displaying

- Verify `NEXT_PUBLIC_MAPBOX_KEY` is set correctly
- Check browser console for Mapbox-related errors
- Ensure you're using a public token (not a secret token)

### Videos Not Playing

- Check video files are in `public/videos/`
- Verify video format is MP4 (H.264 codec)
- Some browsers block autoplay; videos should still work with user interaction

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Contributing

This is a prototype application. For production use:

1. Add proper error handling
2. Implement real authentication
3. Add comprehensive testing
4. Set up CI/CD pipeline
5. Add monitoring and analytics
6. Implement proper SEO

## License

ISC

## Support

For issues or questions, please create an issue in the GitHub repository or contact support@tetristravel.com
