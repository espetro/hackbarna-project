import { NextRequest, NextResponse } from 'next/server';
import { addItineraryEvent } from '@/lib/prisma/itinerary';
import { getOrCreateUser } from '@/lib/prisma/users';

const DEFAULT_USER_ID = 'default-user';

/**
 * POST /api/itinerary/add
 * Add a single event to itinerary
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event } = body;

    if (!event || !event.title || !event.startTime || !event.endTime) {
      return NextResponse.json(
        { error: 'Invalid event data' },
        { status: 400 }
      );
    }

    // Ensure user exists
    await getOrCreateUser(DEFAULT_USER_ID);

    // Convert date strings to Date objects
    const eventToSave = {
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    };

    const saved = await addItineraryEvent(DEFAULT_USER_ID, eventToSave);

    return NextResponse.json({
      success: true,
      event: saved,
    });
  } catch (error) {
    console.error('Error adding event:', error);
    return NextResponse.json(
      { error: 'Failed to add event' },
      { status: 500 }
    );
  }
}
