import { NextRequest, NextResponse } from 'next/server';
import { removeItineraryEvent } from '@/lib/prisma/itinerary';

const DEFAULT_USER_ID = 'default-user';

/**
 * POST /api/itinerary/remove
 * Remove an event from itinerary
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing eventId' },
        { status: 400 }
      );
    }

    await removeItineraryEvent(DEFAULT_USER_ID, eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing event:', error);
    return NextResponse.json(
      { error: 'Failed to remove event' },
      { status: 500 }
    );
  }
}
