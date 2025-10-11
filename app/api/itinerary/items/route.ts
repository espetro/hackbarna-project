import { NextRequest, NextResponse } from 'next/server';
import { ItineraryItemSchema } from '@/src/contracts/itinerary';
import { z } from 'zod';

/**
 * POST /api/itinerary/items
 * Add a single item to itinerary
 * TODO: Add authentication and persist to MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validated = ItineraryItemSchema.parse(body.item);

    // TODO: Get userId from session/auth
    const userId = 'temp-user-id';

    // TODO: Check for overlaps in MongoDB before inserting
    // const existingItems = await db.itineraries.findOne({ userId });
    // if (wouldOverlap(existingItems.items, validated)) {
    //   return NextResponse.json(
    //     { error: 'Time slot overlaps with existing event' },
    //     { status: 409 }
    //   );
    // }

    // TODO: Insert into MongoDB
    // await db.itineraries.updateOne(
    //   { userId },
    //   {
    //     $push: { items: validated },
    //     $set: { updatedAt: new Date() }
    //   },
    //   { upsert: true }
    // );

    return NextResponse.json({
      success: true,
      item: validated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid itinerary item', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add item to itinerary' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/itinerary/items?itemId=xxx
 * Remove an item from itinerary
 * TODO: Add authentication and persist to MongoDB
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing itemId parameter' },
        { status: 400 }
      );
    }

    // TODO: Get userId from session/auth
    const userId = 'temp-user-id';

    // TODO: Check if item is locked before removing
    // const itinerary = await db.itineraries.findOne({ userId });
    // const item = itinerary.items.find(i => i.id === itemId);
    // if (item?.isLocked) {
    //   return NextResponse.json(
    //     { error: 'Cannot remove locked calendar events' },
    //     { status: 403 }
    //   );
    // }

    // TODO: Remove from MongoDB
    // await db.itineraries.updateOne(
    //   { userId },
    //   {
    //     $pull: { items: { id: itemId } },
    //     $set: { updatedAt: new Date() }
    //   }
    // );

    return NextResponse.json({
      success: true,
      itemId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove item from itinerary' },
      { status: 500 }
    );
  }
}
