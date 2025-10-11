import { prisma } from './client';
import type { ItineraryEvent as PrismaItineraryEvent } from '@prisma/client';
import type { ItineraryEvent } from '../types';

/**
 * Convert Prisma ItineraryEvent to app ItineraryEvent
 */
function prismaToItineraryEvent(event: PrismaItineraryEvent): ItineraryEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    location: {
      name: event.locationName,
      lat: event.locationLat,
      lng: event.locationLng,
    },
    startTime: event.startTime,
    endTime: event.endTime,
    source: event.source as 'recommendation' | 'google_calendar' | 'manual',
    recommendationId: event.recommendationId || undefined,
    image: event.image || undefined,
  };
}

/**
 * Convert app ItineraryEvent to Prisma format
 */
function itineraryEventToPrisma(
  userId: string,
  event: ItineraryEvent
): Omit<PrismaItineraryEvent, 'createdAt' | 'updatedAt'> {
  return {
    id: event.id,
    userId,
    title: event.title,
    description: event.description || null,
    locationName: event.location.name,
    locationLat: event.location.lat,
    locationLng: event.location.lng,
    locationAddress: null,
    startTime: event.startTime,
    endTime: event.endTime,
    source: event.source,
    recommendationId: event.recommendationId || null,
    image: event.image || null,
    isLocked: event.source === 'google_calendar',
  };
}

/**
 * Get all itinerary events for a user
 */
export async function getItineraryEvents(userId: string): Promise<ItineraryEvent[]> {
  const events = await prisma.itineraryEvent.findMany({
    where: { userId },
    orderBy: { startTime: 'asc' },
  });

  return events.map(prismaToItineraryEvent);
}

/**
 * Add a single event to itinerary
 */
export async function addItineraryEvent(
  userId: string,
  event: ItineraryEvent
): Promise<ItineraryEvent> {
  const prismaEvent = itineraryEventToPrisma(userId, event);

  const created = await prisma.itineraryEvent.create({
    data: prismaEvent,
  });

  return prismaToItineraryEvent(created);
}

/**
 * Remove an event from itinerary
 */
export async function removeItineraryEvent(
  userId: string,
  eventId: string
): Promise<void> {
  await prisma.itineraryEvent.delete({
    where: {
      id: eventId,
      userId, // Ensure user owns the event
    },
  });
}

/**
 * Import multiple events (e.g., from Google Calendar)
 */
export async function importItineraryEvents(
  userId: string,
  events: ItineraryEvent[]
): Promise<ItineraryEvent[]> {
  const prismaEvents = events.map((event) => itineraryEventToPrisma(userId, event));

  await prisma.itineraryEvent.createMany({
    data: prismaEvents,
    skipDuplicates: true, // Skip if ID already exists
  });

  return getItineraryEvents(userId);
}

/**
 * Clear all itinerary events for a user
 */
export async function clearItinerary(userId: string): Promise<void> {
  await prisma.itineraryEvent.deleteMany({
    where: { userId },
  });
}

/**
 * Check if an event time slot overlaps with existing events
 */
export async function checkTimeOverlap(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeEventId?: string
): Promise<boolean> {
  const overlapping = await prisma.itineraryEvent.findFirst({
    where: {
      userId,
      id: excludeEventId ? { not: excludeEventId } : undefined,
      OR: [
        // New event starts during existing event
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        // New event ends during existing event
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
        // New event completely contains existing event
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
  });

  return !!overlapping;
}
