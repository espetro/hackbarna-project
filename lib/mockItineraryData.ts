// Mock Itinerary Data Generator
// Generates realistic itinerary events for demo purposes

import { ItineraryEvent } from './types';

const mockEvents = [
  {
    title: 'Morning Coffee at Café de Flore',
    description: 'Start your day with an authentic Parisian breakfast at this historic café',
    location: 'Café de Flore, Paris',
    lat: 48.8542,
    lng: 2.3320,
    duration: 1,
    image: '/assets/barceloneta.png',
  },
  {
    title: 'Louvre Museum Tour',
    description: 'Explore the world\'s largest art museum and see the Mona Lisa',
    location: 'Musée du Louvre',
    lat: 48.8606,
    lng: 2.3376,
    duration: 3,
    image: '/assets/moco museum.png',
  },
  {
    title: 'Lunch at Le Comptoir du Relais',
    description: 'Enjoy traditional French cuisine at this popular bistro',
    location: 'Le Comptoir du Relais, Saint-Germain',
    lat: 48.8516,
    lng: 2.3406,
    duration: 1.5,
    image: '/assets/flamenco.png',
  },
  {
    title: 'Walk along the Seine',
    description: 'Romantic stroll by the river with stunning views of Notre-Dame',
    location: 'Seine River Banks',
    lat: 48.8534,
    lng: 2.3488,
    duration: 1,
  },
  {
    title: 'Eiffel Tower Sunset',
    description: 'Watch the sunset from the iconic Eiffel Tower observation deck',
    location: 'Eiffel Tower',
    lat: 48.8584,
    lng: 2.2945,
    duration: 2,
    image: '/assets/safrada familia.png',
  },
  {
    title: 'Dinner Cruise on the Seine',
    description: 'Romantic dinner cruise with live music and panoramic views',
    location: 'Port de la Bourdonnais',
    lat: 48.8600,
    lng: 2.2989,
    duration: 2.5,
    image: '/assets/camp nou.png',
  },
  {
    title: 'Montmartre & Sacré-Cœur',
    description: 'Explore the charming hilltop district and visit the beautiful basilica',
    location: 'Montmartre',
    lat: 48.8867,
    lng: 2.3431,
    duration: 2,
    image: '/assets/montserrat mountains.png',
  },
  {
    title: 'Artisan Market Shopping',
    description: 'Browse local crafts and souvenirs at the Marché aux Puces',
    location: 'Saint-Ouen Flea Market',
    lat: 48.9017,
    lng: 2.3453,
    duration: 2,
  },
  {
    title: 'Wine Tasting Experience',
    description: 'Sample fine French wines at a traditional wine bar',
    location: 'Le Baron Rouge, Bastille',
    lat: 48.8507,
    lng: 2.3733,
    duration: 1.5,
    image: '/assets/casa mila pedrera.png',
  },
  {
    title: 'Jazz Night at Duc des Lombards',
    description: 'Live jazz performance in an intimate Paris venue',
    location: 'Le Duc des Lombards',
    lat: 48.8602,
    lng: 2.3463,
    duration: 2,
  },
];

/**
 * Generate mock itinerary events for demo purposes
 * Creates events spread across today and tomorrow
 */
export function generateMockItineraryEvents(): ItineraryEvent[] {
  const events: ItineraryEvent[] = [];
  const now = new Date();
  
  // Generate 6-8 events spread across today and tomorrow
  const numEvents = 6 + Math.floor(Math.random() * 3);
  const selectedEvents = [...mockEvents]
    .sort(() => Math.random() - 0.5)
    .slice(0, numEvents);

  let currentTime = new Date(now);
  currentTime.setHours(9, 0, 0, 0); // Start at 9 AM

  selectedEvents.forEach((mockEvent, index) => {
    // Add some variation to start times (30-90 minute gaps between events)
    if (index > 0) {
      const gap = 30 + Math.floor(Math.random() * 60);
      currentTime = new Date(currentTime.getTime() + gap * 60 * 1000);
    }

    // Move to next day after 8 PM
    if (currentTime.getHours() >= 20 && index < selectedEvents.length - 1) {
      currentTime.setDate(currentTime.getDate() + 1);
      currentTime.setHours(9, 0, 0, 0);
    }

    const startTime = new Date(currentTime);
    const durationMs = mockEvent.duration * 60 * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);

    events.push({
      id: `mock-${Date.now()}-${index}`,
      title: mockEvent.title,
      description: mockEvent.description,
      location: {
        name: mockEvent.location,
        lat: mockEvent.lat,
        lng: mockEvent.lng,
      },
      startTime,
      endTime,
      source: 'google_calendar',
      image: mockEvent.image,
    });

    // Update currentTime to end of this event
    currentTime = new Date(endTime);
  });

  return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

/**
 * Generate a single mock event at a specific time
 */
export function generateSingleMockEvent(
  title: string,
  startTime: Date,
  durationHours: number
): ItineraryEvent {
  const mockEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

  return {
    id: `mock-${Date.now()}-${Math.random()}`,
    title: title || mockEvent.title,
    description: mockEvent.description,
    location: {
      name: mockEvent.location,
      lat: mockEvent.lat,
      lng: mockEvent.lng,
    },
    startTime,
    endTime,
    source: 'google_calendar',
    image: mockEvent.image,
  };
}

