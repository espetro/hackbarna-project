// Google Calendar Integration
// This module handles importing events from Google Calendar

import { GoogleCalendarEvent, ItineraryEvent } from './types';

/**
 * Geocode a location string to coordinates using a geocoding service
 * In a real implementation, you would use Google Maps Geocoding API or similar
 */
async function geocodeLocation(locationString: string): Promise<{ lat: number; lng: number } | null> {
  if (!locationString) return null;

  try {
    // Using Nominatim (OpenStreetMap) as a free geocoding service
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1`,
      {
        headers: {
          'User-Agent': 'TetrisTravel/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Convert a Google Calendar event to our ItineraryEvent format
 */
async function convertGoogleEventToItineraryEvent(
  googleEvent: GoogleCalendarEvent
): Promise<ItineraryEvent | null> {
  try {
    // Parse dates
    const startTime = new Date(googleEvent.start.dateTime || googleEvent.start.date || '');
    const endTime = new Date(googleEvent.end.dateTime || googleEvent.end.date || '');

    // Skip all-day events without times or invalid dates
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return null;
    }

    // Try to geocode the location
    let coordinates = { lat: 48.8566, lng: 2.3522 }; // Default to Paris
    if (googleEvent.location) {
      const geocoded = await geocodeLocation(googleEvent.location);
      if (geocoded) {
        coordinates = geocoded;
      }
    }

    return {
      id: `gcal-${googleEvent.id}`,
      title: googleEvent.summary || 'Untitled Event',
      description: googleEvent.description,
      location: {
        name: googleEvent.location || 'No location specified',
        ...coordinates,
      },
      startTime,
      endTime,
      source: 'google_calendar',
    };
  } catch (error) {
    console.error('Error converting Google Calendar event:', error);
    return null;
  }
}

/**
 * Initialize Google Calendar API and authenticate user
 * Returns the gapi client if successful
 */
export async function initGoogleCalendarAPI(): Promise<boolean> {
  return new Promise((resolve) => {
    // Load the Google API client library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      // @ts-ignore - gapi is loaded from external script
      window.gapi.load('client:auth2', async () => {
        try {
          // @ts-ignore
          await window.gapi.client.init({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar.readonly',
          });
          resolve(true);
        } catch (error) {
          console.error('Error initializing Google Calendar API:', error);
          resolve(false);
        }
      });
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Import events from Google Calendar
 * @param timeMin - Start date for importing events (defaults to today)
 * @param timeMax - End date for importing events (defaults to 7 days from now)
 */
export async function importGoogleCalendarEvents(
  timeMin?: Date,
  timeMax?: Date
): Promise<ItineraryEvent[]> {
  try {
    // Check if Google API is available
    // @ts-ignore
    if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
      throw new Error('Google Calendar API not initialized');
    }

    // Check if user is signed in, if not, sign them in
    // @ts-ignore
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }

    // Set default time range if not provided
    const now = new Date();
    const defaultTimeMin = timeMin || now;
    const defaultTimeMax = timeMax || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Fetch events from Google Calendar
    // @ts-ignore
    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: defaultTimeMin.toISOString(),
      timeMax: defaultTimeMax.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const googleEvents = response.result.items as GoogleCalendarEvent[];

    // Convert Google Calendar events to our format
    const conversionPromises = googleEvents.map((event) =>
      convertGoogleEventToItineraryEvent(event)
    );

    const itineraryEvents = await Promise.all(conversionPromises);

    // Filter out null values (failed conversions)
    return itineraryEvents.filter((event): event is ItineraryEvent => event !== null);
  } catch (error) {
    console.error('Error importing Google Calendar events:', error);
    throw error;
  }
}

/**
 * Sign out from Google Calendar
 */
export async function signOutGoogleCalendar(): Promise<void> {
  try {
    // @ts-ignore
    if (window.gapi && window.gapi.auth2) {
      // @ts-ignore
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
      }
    }
  } catch (error) {
    console.error('Error signing out from Google Calendar:', error);
  }
}

