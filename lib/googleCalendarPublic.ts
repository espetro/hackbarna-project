// lib/googleCalendarPublic.ts
import { ItineraryEvent } from './types';

/**
 * Extract calendar ID from a Google Calendar URL
 */
export function parseCalendarUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle different URL formats
    if (urlObj.hostname !== 'calendar.google.com') {
      throw new Error('Invalid Google Calendar URL');
    }

    // Extract cid parameter (calendar ID)
    const cid = urlObj.searchParams.get('cid');
    if (cid) {
      // The cid is base64 encoded, decode it
      try {
        return atob(cid);
      } catch (e) {
        // If decoding fails, use the cid as is
        return cid;
      }
    }

    // Handle embed URLs like /calendar/embed?src=...
    const src = urlObj.searchParams.get('src');
    if (src) {
      return decodeURIComponent(src);
    }

    // Handle /calendar/u/0/r?cid= format
    const pathname = urlObj.pathname;
    if (pathname.includes('/calendar/') && cid) {
      return cid;
    }

    throw new Error('Could not extract calendar ID from URL');
  } catch (error) {
    console.error('Error parsing calendar URL:', error);
    return null;
  }
}

/**
 * Fetch events from a public Google Calendar
 */
export async function fetchPublicCalendarEvents(calendarId: string): Promise<ItineraryEvent[]> {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  
  if (!API_KEY) {
    throw new Error('Google API key is not configured. Please add NEXT_PUBLIC_GOOGLE_API_KEY to your environment variables.');
  }

  // Calculate time range (next 30 days)
  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const params = new URLSearchParams({
    key: API_KEY,
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  try {
    console.log('Fetching calendar events from:', `${url}?${params}`);
    
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Calendar API Error:', response.status, errorData);
      
      if (response.status === 403) {
        throw new Error('Calendar is private or API key is invalid. Please make sure the calendar is public.');
      } else if (response.status === 404) {
        throw new Error('Calendar not found. Please check the calendar URL.');
      } else {
        throw new Error(`Failed to fetch calendar events: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Calendar API Response:', data);

    if (!data.items || data.items.length === 0) {
      throw new Error('No events found in this calendar for the next 30 days.');
    }

    // Convert Google Calendar events to our ItineraryEvent format
    const events: ItineraryEvent[] = data.items
      .filter((item: any) => item.start && (item.start.dateTime || item.start.date))
      .map((item: any, index: number) => {
        // Handle both date-time and all-day events
        const startTime = item.start.dateTime 
          ? new Date(item.start.dateTime)
          : new Date(item.start.date + 'T09:00:00'); // Default time for all-day events
        
        const endTime = item.end?.dateTime 
          ? new Date(item.end.dateTime)
          : item.end?.date 
            ? new Date(item.end.date + 'T10:00:00') // Default 1-hour duration for all-day events
            : new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour default

        // Extract location coordinates if available in description or location
        const location = extractLocationFromEvent(item);

        return {
          id: `gcal-${item.id || `event-${index}`}`,
          title: item.summary || 'Untitled Event',
          description: item.description || undefined,
          location,
          startTime,
          endTime,
          source: 'google_calendar' as const,
          color: item.colorId || undefined,
        };
      });

    console.log(`Successfully imported ${events.length} events from calendar`);
    return events;

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

/**
 * Extract location information from a calendar event
 */
function extractLocationFromEvent(event: any): { name: string; lat: number; lng: number } {
  // Default location (Barcelona city center)
  const defaultLocation = {
    name: 'Barcelona, Spain',
    lat: 41.3851,
    lng: 2.1734,
  };

  if (!event.location) {
    return {
      name: event.summary || 'Event Location',
      ...defaultLocation,
    };
  }

  // For now, we'll use the event location as the name and default coordinates
  // In a real implementation, you might want to geocode the location string
  return {
    name: event.location,
    ...defaultLocation,
  };
}

/**
 * Import calendar events from a Google Calendar URL
 */
export async function importFromCalendarUrl(calendarUrl: string): Promise<ItineraryEvent[]> {
  console.log('Importing calendar from URL:', calendarUrl);
  
  // Parse the calendar ID from the URL
  const calendarId = parseCalendarUrl(calendarUrl);
  if (!calendarId) {
    throw new Error('Invalid calendar URL. Please check the URL format.');
  }

  console.log('Extracted calendar ID:', calendarId);
  
  // Fetch events from the calendar
  return await fetchPublicCalendarEvents(calendarId);
}

/**
 * Test function to validate calendar access
 */
export async function testCalendarAccess(calendarId: string): Promise<boolean> {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  
  if (!API_KEY) {
    return false;
  }

  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`;
    const response = await fetch(`${url}?key=${API_KEY}`);
    return response.ok;
  } catch {
    return false;
  }
}
