import { NextRequest, NextResponse } from 'next/server';
import { getItineraryEvents } from '@/lib/prisma/itinerary';

const DEFAULT_USER_ID = 'default-user';

/**
 * GET /api/itinerary
 * Get all itinerary events for user
 */
export async function GET(request: NextRequest) {
  try {
    const events = await getItineraryEvents(DEFAULT_USER_ID);

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itinerary' },
      { status: 500 }
    );
  }
}
