import { NextRequest, NextResponse } from 'next/server';
import { importItineraryEvents } from '@/lib/prisma/itinerary';

const DEFAULT_USER_ID = 'default-user';

/**
 * POST /api/itinerary/import
 * Import multiple events (e.g., from Google Calendar)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Invalid events data' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const eventsToImport = events.map((event) => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    }));

    const imported = await importItineraryEvents(DEFAULT_USER_ID, eventsToImport);

    return NextResponse.json({
      success: true,
      count: imported.length,
      events: imported,
    });
  } catch (error) {
    console.error('Error importing events:', error);
    return NextResponse.json(
      { error: 'Failed to import events' },
      { status: 500 }
    );
  }
}
