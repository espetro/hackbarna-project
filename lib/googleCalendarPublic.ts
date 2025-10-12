// lib/googleCalendarPublic.ts
import { ItineraryEvent } from './types';

/**
 * Extract calendar ID from a Google Calendar URL or return iCal URL
 */
export function parseCalendarUrl(url: string): { type: 'ical' | 'api'; value: string } | null {
  try {
    const urlObj = new URL(url);

    // Handle different URL formats
    if (urlObj.hostname !== 'calendar.google.com') {
      throw new Error('Invalid Google Calendar URL');
    }

    // Check if it's an iCal URL
    if (urlObj.pathname.includes('/ical/') && urlObj.pathname.endsWith('.ics')) {
      return { type: 'ical', value: url };
    }

    // Extract cid parameter (calendar ID)
    const cid = urlObj.searchParams.get('cid');
    if (cid) {
      // The cid is base64 encoded, decode it
      try {
        return { type: 'api', value: atob(cid) };
      } catch (e) {
        // If decoding fails, use the cid as is
        return { type: 'api', value: cid };
      }
    }

    // Handle embed URLs like /calendar/embed?src=...
    // Convert to iCal format automatically
    const src = urlObj.searchParams.get('src');
    if (src) {
      const calendarId = decodeURIComponent(src);
      // Construct the iCal URL for public calendars
      const icalUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`;
      console.log('🔄 Converting embed URL to iCal:', icalUrl);
      return { type: 'ical', value: icalUrl };
    }

    // Handle /calendar/u/0/r?cid= format
    const pathname = urlObj.pathname;
    if (pathname.includes('/calendar/') && cid) {
      return { type: 'api', value: cid };
    }

    throw new Error('Could not extract calendar ID from URL');
  } catch (error) {
    console.error('Error parsing calendar URL:', error);
    return null;
  }
}

/**
 * Parse iCal format and extract events
 */
async function parseICalEvents(icalText: string): Promise<ItineraryEvent[]> {
  const events: ItineraryEvent[] = [];

  // Split by event components
  const eventBlocks = icalText.split('BEGIN:VEVENT');

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split('END:VEVENT')[0];
    const lines = block.split('\n').filter(line => line.trim());

    const event: any = {};
    let currentProperty = '';

    for (const line of lines) {
      // Handle multi-line properties (continuation lines start with space)
      if (line.startsWith(' ') && currentProperty) {
        event[currentProperty] += line.substring(1);
        continue;
      }

      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const fullKey = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);

      // Handle properties with parameters (e.g., DTSTART;TZID=...)
      const [key] = fullKey.split(';');
      currentProperty = key;
      event[key] = value;
    }

    // Parse the event data
    if (event.DTSTART && event.SUMMARY) {
      const startTime = parseICalDate(event.DTSTART);
      const endTime = event.DTEND ? parseICalDate(event.DTEND) : new Date(startTime.getTime() + 60 * 60 * 1000);

      // Extract location coordinates if available
      const location = extractLocationFromICalEvent(event);

      events.push({
        id: `ical-${event.UID || `event-${i}`}`,
        title: event.SUMMARY.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, '\n'),
        description: event.DESCRIPTION
          ? event.DESCRIPTION.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, '\n')
          : undefined,
        location,
        startTime,
        endTime,
        source: 'google_calendar' as const,
      });
    }
  }

  return events;
}

/**
 * Parse iCal date format (YYYYMMDDTHHMMSSZ or YYYYMMDD)
 */
function parseICalDate(dateStr: string): Date {
  // Remove any timezone identifiers
  dateStr = dateStr.split(';')[0];

  if (dateStr.length === 8) {
    // All-day event: YYYYMMDD
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day, 9, 0, 0);
  } else if (dateStr.includes('T')) {
    // DateTime: YYYYMMDDTHHMMSSZ
    const isUTC = dateStr.endsWith('Z');
    dateStr = dateStr.replace('Z', '');

    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11));
    const minute = parseInt(dateStr.substring(11, 13));
    const second = parseInt(dateStr.substring(13, 15));

    if (isUTC) {
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    } else {
      return new Date(year, month, day, hour, minute, second);
    }
  }

  return new Date();
}

/**
 * Extract location from iCal event
 */
function extractLocationFromICalEvent(event: any): { name: string; lat: number; lng: number } {
  const defaultCoords = {
    lat: 41.3851,
    lng: 2.1734,
  };

  if (!event.LOCATION) {
    return {
      name: event.SUMMARY || 'Event Location',
      ...defaultCoords,
    };
  }

  return {
    name: event.LOCATION.replace(/\\,/g, ',').replace(/\\;/g, ';'),
    ...defaultCoords,
  };
}

/**
 * Fetch events from a public iCal URL
 * Uses server-side proxy to bypass CORS restrictions
 */
async function fetchICalEvents(icalUrl: string): Promise<ItineraryEvent[]> {
  try {
    console.log('📅 Fetching iCal from:', icalUrl);

    // Use the proxy API route to bypass CORS
    const proxyUrl = `/api/proxy-ical?url=${encodeURIComponent(icalUrl)}`;
    console.log('🔄 Using proxy:', proxyUrl);

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Proxy fetch failed:', errorData);
      throw new Error(errorData.error || `Failed to fetch iCal: ${response.status}`);
    }

    const icalText = await response.text();
    console.log('✅ Received iCal data:', icalText.length, 'bytes');

    const events = await parseICalEvents(icalText);
    console.log('📊 Parsed', events.length, 'total events');

    // Filter events to next 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const filteredEvents = events.filter(event =>
      event.startTime >= now && event.startTime <= thirtyDaysFromNow
    );

    console.log(`✅ Successfully imported ${filteredEvents.length} events from iCal (filtered to next 30 days)`);
    return filteredEvents;
  } catch (error) {
    console.error('❌ Error fetching iCal events:', error);
    throw error;
  }
}

/**
 * Fetch events from a public Google Calendar using API
 */
export async function fetchPublicCalendarEvents(calendarId: string): Promise<ItineraryEvent[]> {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  
  // For public calendars, we can try without API key first
  if (!API_KEY) {
    console.warn('No Google API key configured. Attempting to fetch public calendar without authentication...');
  }

  // Calculate time range (next 30 days)
  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  // Add API key if available
  if (API_KEY) {
    params.append('key', API_KEY);
  }

  try {
    console.log('Fetching calendar events from:', `${url}?${params}`);
    
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Calendar API Error:', response.status, errorData);
      
      if (response.status === 403) {
        if (!API_KEY) {
          throw new Error('Calendar requires authentication. Please add NEXT_PUBLIC_GOOGLE_API_KEY to your environment variables, or make sure the calendar is truly public.');
        } else {
          throw new Error('Calendar is private or API key is invalid. Please make sure the calendar is public.');
        }
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
  // Default coordinates (Barcelona city center)
  const defaultCoords = {
    lat: 41.3851,
    lng: 2.1734,
  };

  if (!event.location) {
    return {
      name: event.summary || 'Event Location',
      ...defaultCoords,
    };
  }

  // For now, we'll use the event location as the name and default coordinates
  // In a real implementation, you might want to geocode the location string
  return {
    name: event.location,
    ...defaultCoords,
  };
}

/**
 * Import calendar events from a Google Calendar URL
 */
export async function importFromCalendarUrl(calendarUrl: string): Promise<ItineraryEvent[]> {
  console.log('Importing calendar from URL:', calendarUrl);

  // Parse the calendar URL
  const parsed = parseCalendarUrl(calendarUrl);
  if (!parsed) {
    throw new Error('Invalid calendar URL. Please check the URL format.');
  }

  if (parsed.type === 'ical') {
    console.log('✅ Using iCal format (no API key required)');
    console.log('📥 Fetching from:', parsed.value);
    return await fetchICalEvents(parsed.value);
  } else {
    console.log('⚠️ Using Google Calendar API (requires API key or public calendar)');
    console.log('📥 Fetching calendar ID:', parsed.value);
    return await fetchPublicCalendarEvents(parsed.value);
  }
}

/**
 * Test function to validate calendar access
 */
export async function testCalendarAccess(calendarId: string): Promise<boolean> {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  
  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`;
    const testUrl = API_KEY ? `${url}?key=${API_KEY}` : url;
    const response = await fetch(testUrl);
    return response.ok;
  } catch {
    return false;
  }
}
