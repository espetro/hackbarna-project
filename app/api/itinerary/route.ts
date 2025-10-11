import { NextRequest, NextResponse } from 'next/server';
import { ItinerarySchema, ItineraryItemSchema } from '@/src/contracts/itinerary';
import { z } from 'zod';

/**
 * GET /api/itinerary
 * Retrieve user's full itinerary
 * TODO: Add authentication and fetch from MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = 'temp-user-id';

    // TODO: Fetch from MongoDB
    // const itinerary = await db.itineraries.findOne({ userId });

    // For now, return empty itinerary
    const mockItinerary = {
      userId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate with schema
    const validated = ItinerarySchema.parse(mockItinerary);

    return NextResponse.json({ itinerary: validated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid itinerary data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch itinerary' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/itinerary
 * Import calendar events (bulk insert)
 * TODO: Add authentication and persist to MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate each event
    const validatedEvents = z.array(ItineraryItemSchema).parse(body.events);

    // TODO: Get userId from session/auth
    const userId = 'temp-user-id';

    // TODO: Insert into MongoDB
    // await db.itineraries.updateOne(
    //   { userId },
    //   {
    //     $push: { items: { $each: validatedEvents } },
    //     $set: { updatedAt: new Date() }
    //   },
    //   { upsert: true }
    // );

    return NextResponse.json({
      success: true,
      importedCount: validatedEvents.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid calendar events', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to import calendar events' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/itinerary
 * Update entire itinerary (used for reordering, batch updates)
 * TODO: Add authentication and persist to MongoDB
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod including overlap check
    const validated = ItinerarySchema.parse({
      userId: body.userId,
      items: body.items,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // TODO: Get userId from session/auth
    const userId = 'temp-user-id';

    // TODO: Replace in MongoDB
    // await db.itineraries.updateOne(
    //   { userId },
    //   { $set: { items: validated.items, updatedAt: new Date() } },
    //   { upsert: true }
    // );

    return NextResponse.json({
      success: true,
      itinerary: validated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid itinerary', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update itinerary' },
      { status: 500 }
    );
  }
}
