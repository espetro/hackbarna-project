// Type definitions for TetrisTravel application

export interface Recommendation {
  id: number;
  title: string;
  description: string;
  image: string;
  location: {
    lat: number;
    lng: number;
  };
  duration?: string;
  price?: string;
}

export interface UserQuery {
  text: string;
  location?: string;
  duration?: string;
}

// Itinerary Event - can be from Google Calendar or added manually
export interface ItineraryEvent {
  id: string;
  title: string;
  description?: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  startTime: Date;
  endTime: Date;
  source: 'google_calendar' | 'manual' | 'recommendation';
  recommendationId?: number; // Link to original recommendation if added from recommendations
  image?: string;
  color?: string; // For calendar categorization
}

// Google Calendar Event (simplified structure from Google Calendar API)
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
}
