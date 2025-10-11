# Itinerary Feature Setup Guide

## Overview
The Itinerary feature allows users to:
- Import events from Google Calendar with locations and times
- Add recommendations to their itinerary
- View events on the map with grey markers in time order
- Manage their schedule in a beautiful slide-out agenda panel

## Environment Variables Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Mapbox Configuration (for maps)
NEXT_PUBLIC_MAPBOX_KEY=your_mapbox_access_token_here

# Google Calendar API Configuration
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

## Getting Google Calendar API Credentials

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it something like "TetrisTravel"

### Step 2: Enable Google Calendar API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Optional) Click "Restrict Key" and limit it to "Google Calendar API" for security
5. Add this to your `.env.local` as `NEXT_PUBLIC_GOOGLE_API_KEY`

### Step 4: Create OAuth 2.0 Client ID

1. Go to "APIs & Services" > "Credentials"
2. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "TetrisTravel"
   - Add your email as developer contact
   - Add test users if needed
3. Click "Create Credentials" > "OAuth client ID"
4. Choose "Web application"
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - Add your production URL when deployed
6. Add authorized redirect URIs:
   - `http://localhost:3000`
   - Add your production URL when deployed
7. Click "Create"
8. Copy the "Client ID" (looks like: `xxxxx.apps.googleusercontent.com`)
9. Add this to your `.env.local` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Step 5: Configure OAuth Consent Screen Scopes

1. Go to "APIs & Services" > "OAuth consent screen"
2. Under "Scopes", add:
   - `https://www.googleapis.com/auth/calendar.readonly` (Read-only access to Google Calendar)

## Features Explained

### 1. Itinerary Menu (Floating Button)
- Located in the bottom-right corner
- Shows badge with event count
- Opens menu with two options:
  - **View Itinerary**: Opens the itinerary panel
  - **Import Google Calendar**: Imports events from your Google Calendar

### 2. Import Google Calendar
- Imports events from the next 7 days
- Extracts event name, description, location, start time, and end time
- Uses geocoding to convert location text to map coordinates
- Events are marked as "google_calendar" source

### 3. Add Recommendations to Itinerary
- Click the grey "Add to Itinerary" button on any recommendation card
- Creates a time slot starting from the next hour
- Uses the recommendation's duration to set end time
- Events are marked as "recommendation" source

### 4. Map View
- **Red markers**: Recommendations (numbered 1, 2, 3...)
- **Grey markers**: Itinerary events (numbered in time order)
- Grey markers show time label below them
- Click any marker to view details

### 5. Itinerary Panel
- Beautiful slide-out panel from the right
- Groups events by date
- Shows time, duration, location, and source for each event
- Can remove events by clicking the trash icon
- Click "X" or backdrop to close

## Technical Implementation

### New Types
- `ItineraryEvent`: Core event type with location coordinates, times, and source
- `GoogleCalendarEvent`: Simplified Google Calendar API response type

### State Management
- Extended `AppContext` with:
  - `itineraryEvents`: Array of all itinerary events
  - `addItineraryEvent()`: Add a single event
  - `removeItineraryEvent()`: Remove an event by ID
  - `clearItinerary()`: Clear all events
  - `importGoogleCalendarEvents()`: Bulk import from Google Calendar

### New Components
1. **ItineraryPanel** (`components/ItineraryPanel.tsx`)
   - Slide-out agenda view
   - Time-ordered event list
   - Grouped by date

2. **ItineraryMenu** (`components/ItineraryMenu.tsx`)
   - Floating action button
   - Menu with import and view options
   - Event count badge

3. **Google Calendar Integration** (`lib/googleCalendar.ts`)
   - API initialization
   - OAuth authentication
   - Event import with geocoding

### Updated Components
- **MapView**: Added itinerary event markers with grey styling
- **SwipeableCardStack**: Added "Add to Itinerary" button
- **RecommendationsPage**: Integrated all itinerary features

## User Flow

### Importing Calendar Events
1. User clicks floating menu button (bottom-right)
2. Selects "Import Google Calendar"
3. Prompted to sign in to Google (if not already)
4. Grants calendar read permission
5. Events are imported and shown on map with grey markers
6. Itinerary panel opens automatically to show imported events

### Adding Recommendations
1. User views recommendations on the map
2. Clicks "Add to Itinerary" on any card
3. Event is added with next available time slot
4. Grey marker appears on map
5. Can view in itinerary panel

### Managing Itinerary
1. Click floating menu > "View Itinerary"
2. Panel slides out from right
3. Events grouped by date, ordered by time
4. Click trash icon to remove events
5. Click on event for more details

## Geocoding

The system uses OpenStreetMap's Nominatim service for free geocoding:
- Converts location text (e.g., "123 Main St, Paris") to coordinates
- Falls back to Paris coordinates if geocoding fails
- Rate-limited to respect Nominatim's usage policy

For production, consider using:
- Google Maps Geocoding API
- Mapbox Geocoding API
- Your own geocoding service

## Future Enhancements

Possible improvements:
1. **Drag-and-drop time editing** in itinerary panel
2. **Export itinerary** to PDF or share via link
3. **Smart scheduling** that suggests optimal times based on travel distance
4. **Calendar sync** (two-way) to write back to Google Calendar
5. **Multiple calendar support** (work, personal, etc.)
6. **Conflict detection** for overlapping events
7. **Weather integration** for outdoor activities
8. **Transportation routing** between events

## Troubleshooting

### "Failed to initialize Google Calendar"
- Check that both API key and Client ID are set in `.env.local`
- Verify Google Calendar API is enabled in your project
- Make sure authorized origins include your current URL

### "Failed to import events"
- User may have denied calendar permission
- Check browser console for detailed errors
- Verify OAuth consent screen is properly configured

### Geocoding not working
- Location text may be too vague
- Nominatim might be rate-limiting
- Consider fallback coordinates or alternative geocoding service

### Events not showing on map
- Check that events have valid coordinates
- Verify date range (only shows events within time window)
- Look for console errors during import

## Security Notes

- API keys are exposed in client-side code (NEXT_PUBLIC prefix)
- This is normal for Google Calendar API with OAuth
- OAuth provides the actual security layer
- Consider domain restrictions on API keys for production
- Never commit `.env.local` to version control

