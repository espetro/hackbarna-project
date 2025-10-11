import { NextRequest, NextResponse } from 'next/server';
import { UserSchema, PreferenceSchema } from '@/src/contracts/user';
import { z } from 'zod';

/**
 * GET /api/user
 * Retrieve user data
 * TODO: Add authentication and fetch from MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = 'temp-user-id';

    // TODO: Fetch from MongoDB
    // For now, return mock data
    const mockUser = {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      preferences: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate with schema
    const validated = UserSchema.parse(mockUser);

    return NextResponse.json({ user: validated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid user data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user
 * Update user preferences
 * TODO: Add authentication and persist to MongoDB
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate preferences with Zod
    const validated = PreferenceSchema.parse(body.preferences);

    // TODO: Get userId from session/auth
    const userId = 'temp-user-id';

    // TODO: Update in MongoDB
    // await db.users.updateOne(
    //   { id: userId },
    //   { $set: { preferences: validated, updatedAt: new Date() } }
    // );

    return NextResponse.json({
      success: true,
      preferences: validated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preferences', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
